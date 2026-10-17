#!/usr/bin/env node
// Usage: npm run check-box -- <issue-number> <item>
// Ticks one checklist box on a chunk issue. Only agent-owned boxes can be
// ticked here; human-owned boxes have to be ticked by a person on GitHub.
import { CHECKLIST, checklistItem, fail, ok, parseIssueNumber, tickIssueBoxes } from './lib.mjs';

const issueNumber = parseIssueNumber(process.argv[2]);
const key = process.argv[3];
const agentKeys = CHECKLIST.filter((item) => item.owner === 'agent').map((item) => item.key);

if (!issueNumber || !key) {
  fail(`Usage: npm run check-box -- <issue-number> <item>\n       Items you can tick: ${agentKeys.join(', ')}`);
}

let item;
try {
  item = checklistItem(key);
} catch (error) {
  fail(error.message);
}

if (item.owner === 'human') {
  fail(`"${item.label}" can only be ticked by a human, on GitHub. Ask them to review and tick it.`);
}

const changed = tickIssueBoxes(issueNumber, [key]);
ok(changed.length > 0 ? `Ticked "${item.label}" on issue #${issueNumber}` : `"${item.label}" was already ticked on #${issueNumber}`);
