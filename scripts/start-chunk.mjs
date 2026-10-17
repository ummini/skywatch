#!/usr/bin/env node
// Usage: npm run start-chunk -- <issue-number>
// Gets the latest main from GitHub, then creates a branch for one chunk.
import { fail, getIssue, info, ok, parseIssueNumber, run, slugify } from './lib.mjs';

const issueNumber = parseIssueNumber(process.argv[2]);
if (!issueNumber) fail('Usage: npm run start-chunk -- <issue-number>');

const issue = getIssue(issueNumber);
if (issue.state !== 'OPEN') fail(`Issue #${issueNumber} is ${issue.state.toLowerCase()}. Pick an open chunk.`);

const dirtyTracked = run('git', ['status', '--porcelain', '--untracked-files=no']).stdout;
if (dirtyTracked) {
  fail('You have uncommitted changes to tracked files. Commit them with npm run commit-chunk, or ask a human what to do with them.');
}

const chunkTitle = issue.title.replace(/^.* - Chunk \d+:\s*/, '');
const branch = `chunk/${issueNumber}-${slugify(chunkTitle)}`;

info('Switching to main and pulling the latest version (includes PRs merged on GitHub)...');
if (!run('git', ['checkout', 'main'], { inherit: true }).ok) fail('Could not switch to main.');
if (!run('git', ['pull', '--ff-only', 'origin', 'main'], { inherit: true }).ok) {
  fail('Could not update main. Ask a human: your local main may have commits that are not on GitHub.');
}

const exists = run('git', ['rev-parse', '--verify', '--quiet', branch]).ok;
const checkout = exists ? ['checkout', branch] : ['checkout', '-b', branch];
if (!run('git', checkout, { inherit: true }).ok) fail(`Could not switch to ${branch}.`);

ok(`On branch ${branch} for issue #${issueNumber}: ${issue.title}`);
console.log('\nNext: write the tests for this chunk ONLY, then show them to a human.\n');
