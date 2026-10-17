#!/usr/bin/env node
// Usage: npm run issues -- docs/plans/<feature>.md [--dry-run]
// Creates one GitHub issue per "## Chunk N: Title" section in the plan,
// then writes the issue numbers back into the plan file.
import { readFileSync, writeFileSync } from 'node:fs';
import { annotatePlan, fail, info, ok, parsePlan, renderChecklist, run } from './lib.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const planPath = args.find((arg) => !arg.startsWith('--'));

if (!planPath) fail('Usage: npm run issues -- docs/plans/<feature>.md [--dry-run]');

let markdown;
try {
  markdown = readFileSync(planPath, 'utf8');
} catch {
  fail(`Could not read ${planPath}. Save the plan there first.`);
}

const { feature, chunks } = parsePlan(markdown);
if (chunks.length === 0) {
  fail('No chunks found. Each chunk needs a heading like:  ## Chunk 1: LoadingScreen component');
}

if (!dryRun) {
  // Safe to run every time: --force updates the label if it already exists.
  run('gh', ['label', 'create', 'chunk', '--color', 'F5C542', '--description', 'One small, testable piece of a feature', '--force']);
}

const created = {};
for (const chunk of chunks) {
  if (chunk.issue) {
    info(`Chunk ${chunk.number} already has issue #${chunk.issue}, skipping.`);
    continue;
  }

  const title = `${feature} - Chunk ${chunk.number}: ${chunk.title}`;
  const body = [
    `Part of the **${feature}** plan: \`${planPath}\``,
    '',
    chunk.body,
    '',
    '## Checklist',
    renderChecklist(),
  ].join('\n');

  if (dryRun) {
    console.log(`\n--- would create: ${title} ---\n${body}\n`);
    continue;
  }

  const result = run('gh', ['issue', 'create', '--title', title, '--body', body, '--label', 'chunk']);
  if (!result.ok) fail(`Could not create the issue for chunk ${chunk.number}.\n       ${result.stderr}`);

  const url = result.stdout.split('\n').pop();
  const number = Number(url.split('/').pop());
  created[chunk.number] = number;
  ok(`Chunk ${chunk.number} -> issue #${number}  ${url}`);
}

if (!dryRun && Object.keys(created).length > 0) {
  writeFileSync(planPath, annotatePlan(markdown, created));
  ok(`Wrote the issue numbers back into ${planPath}`);
}

console.log('\nNext: a human reads the issues on GitHub, then start chunk 1 with  npm run start-chunk -- <issue-number>\n');
