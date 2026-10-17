#!/usr/bin/env node
// Usage: npm run commit-chunk -- <issue-number> "what this commit does"
// Runs the tests. Only if they ALL pass: commits everything, pushes,
// and ticks "All tests pass" + "Committed and pushed" on the issue.
import { assertNotOnMain, fail, info, ok, parseIssueNumber, run, runTests, tickIssueBoxes } from './lib.mjs';

const LARGE_CHUNK_LINES = 300;

const issueNumber = parseIssueNumber(process.argv[2]);
const message = process.argv.slice(3).join(' ').trim();
if (!issueNumber || !message) fail('Usage: npm run commit-chunk -- <issue-number> "what this commit does"');

const branch = assertNotOnMain();

if (!runTests()) {
  fail('Tests failed, so nothing was committed.\n       Fix the CODE, not the tests. If you think a test is wrong, stop and ask a human.');
}
ok('All tests pass.');

run('git', ['add', '-A']);
const staged = run('git', ['diff', '--cached', '--numstat']).stdout;
if (!staged) fail('There is nothing to commit.');

const linesChanged = staged
  .split('\n')
  .map((line) => line.split('\t'))
  .reduce((sum, [added, removed]) => sum + (Number(added) || 0) + (Number(removed) || 0), 0);

info('Files in this commit:');
run('git', ['diff', '--cached', '--stat'], { inherit: true });

if (linesChanged > LARGE_CHUNK_LINES) {
  console.log(`\n[WARN] This commit changes ${linesChanged} lines. A human has to read all of that.`);
  console.log('       Consider splitting the chunk into smaller ones next time.\n');
}

const commit = run('git', ['commit', '-m', `${message} (refs #${issueNumber})`], { inherit: true });
if (!commit.ok) fail('git commit failed. Read the error above.');

const push = run('git', ['push', '-u', 'origin', branch], { inherit: true });
if (!push.ok) fail('Committed locally, but the push to GitHub failed. Read the error above.');

const ticked = tickIssueBoxes(issueNumber, ['tests-pass', 'committed']);
ok(`Committed and pushed to ${branch}.`);
if (ticked.length > 0) ok(`Ticked on issue #${issueNumber}: ${ticked.join(', ')}`);
console.log(`\nNext: when the chunk is done, open the PR with  npm run pr -- ${issueNumber} --notes .pr-notes.md\n`);
