#!/usr/bin/env node
// Usage: npm run pr -- <issue-number> [--notes .pr-notes.md]
// Checks that the chunk is really done, opens a PR to main, then tells the
// agent to STOP. Merging is a human's job.
import { existsSync, readFileSync } from 'node:fs';
import {
  assertNotOnMain,
  checklistItem,
  fail,
  getIssue,
  info,
  isTicked,
  ok,
  parseIssueNumber,
  reviewerSection,
  run,
  runTests,
  tickIssueBoxes,
} from './lib.mjs';

const args = process.argv.slice(2);
const issueNumber = parseIssueNumber(args[0]);
const notesFlag = args.indexOf('--notes');
const notesPath = notesFlag === -1 ? null : args[notesFlag + 1];
if (!issueNumber) fail('Usage: npm run pr -- <issue-number> [--notes .pr-notes.md]');

const branch = assertNotOnMain();

if (run('git', ['status', '--porcelain']).stdout) {
  fail(`You have uncommitted changes. Run  npm run commit-chunk -- ${issueNumber} "message"  first.`);
}

const existing = run('gh', ['pr', 'view', branch, '--json', 'url,state']);
if (existing.ok) {
  const pr = JSON.parse(existing.stdout);
  if (pr.state === 'OPEN') {
    ok(`A PR for this branch already exists: ${pr.url}`);
    process.exit(0);
  }
}

if (!runTests()) fail('Tests failed. A PR needs green tests.');
info('Checking that the app still builds (npm run build)...');
if (!run('npm', ['run', 'build'], { inherit: true }).ok) fail('The build failed. A PR needs a working build.');

const issue = getIssue(issueNumber);
const required = ['tests-written', 'tests-approved', 'tests-pass', 'committed'];
const missing = required.filter((key) => !isTicked(issue.body, key));
if (missing.includes('tests-approved')) {
  fail(`A human has not approved the tests on issue #${issueNumber} yet.\n       Ask them to read the tests and tick "Tests approved by a human" on GitHub.`);
}
if (missing.length > 0) {
  fail(`These boxes on issue #${issueNumber} are not ticked yet:\n       - ${missing.map((key) => checklistItem(key).label).join('\n       - ')}`);
}

const pushed = run('git', ['push', '-u', 'origin', branch], { inherit: true });
if (!pushed.ok) fail('Could not push the branch to GitHub.');

let notes = '## What changed\n_The agent did not leave notes. Ask it to explain this PR in plain English._';
if (notesPath) {
  if (!existsSync(notesPath)) fail(`Could not find ${notesPath}.`);
  notes = readFileSync(notesPath, 'utf8').trim();
}

const templatePath = '.github/pull_request_template.md';
const reviewer = existsSync(templatePath) ? reviewerSection(readFileSync(templatePath, 'utf8')) : '';
const title = issue.title.replace(/^.* - (Chunk \d+:)/, '$1');
const body = [`Closes #${issueNumber}`, '', notes, '', reviewer].join('\n').trim();

const created = run('gh', ['pr', 'create', '--base', 'main', '--head', branch, '--title', title, '--body', body]);
if (!created.ok) fail(`gh pr create failed.\n       ${created.stderr}`);

tickIssueBoxes(issueNumber, ['pr-opened']);

console.log(`
============================================================
  PR opened: ${created.stdout.split('\n').pop()}

  STOP. Waiting for human review and merge.

  Agent: do not start the next chunk. Do not merge.
  Human: read the diff on GitHub, run it locally, tick the
  reviewer checklist, then merge. Say "go next chunk" when done.
============================================================
`);
