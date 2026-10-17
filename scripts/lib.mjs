import { spawnSync } from 'node:child_process';

export const IS_WINDOWS = process.platform === 'win32';

/**
 * Every chunk issue gets this checklist. `owner` decides who may tick it:
 * the agent (through these scripts) or a human (by clicking the box on GitHub).
 */
export const CHECKLIST = [
  { key: 'tests-written', owner: 'agent', label: 'Tests written' },
  { key: 'tests-approved', owner: 'human', label: 'Tests approved by a human (tick this on GitHub after reading the tests)' },
  { key: 'tests-pass', owner: 'agent', label: 'All tests pass' },
  { key: 'committed', owner: 'agent', label: 'Committed and pushed' },
  { key: 'pr-opened', owner: 'agent', label: 'PR opened' },
  { key: 'merged', owner: 'human', label: 'Human reviewed and merged the PR' },
];

export function checklistItem(key) {
  const item = CHECKLIST.find((entry) => entry.key === key);
  if (!item) {
    throw new Error(`Unknown checklist item "${key}". Valid items: ${CHECKLIST.map((e) => e.key).join(', ')}`);
  }
  return item;
}

export function renderChecklist() {
  return CHECKLIST.map((item) => `- [ ] ${item.label}`).join('\n');
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function checkboxPattern(label, flags = '') {
  return new RegExp(`^(\\s*[-*] \\[)([ xX])(\\] ${escapeRegExp(label)})`, `m${flags}`);
}

export function isTicked(body, key) {
  const match = body.match(checkboxPattern(checklistItem(key).label));
  return Boolean(match && match[2].toLowerCase() === 'x');
}

export function tickBox(body, key) {
  return body.replace(checkboxPattern(checklistItem(key).label), '$1x$3');
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\(#\d+\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '');
}

const CHUNK_HEADING = /^## Chunk (\d+):\s*(.+?)\s*(?:\(#(\d+)\))?\s*$/;

/**
 * Splits a plan file into chunks. A chunk starts at a `## Chunk N: Title`
 * heading and runs until the next `## ` heading.
 */
export function parsePlan(markdown) {
  const lines = markdown.split(/\r?\n/);
  const featureLine = lines.find((line) => line.startsWith('# '));
  const feature = featureLine ? featureLine.replace(/^# (Feature:\s*)?/, '').trim() : 'Feature';
  const chunks = [];
  let current = null;

  for (const line of lines) {
    const heading = line.match(CHUNK_HEADING);
    if (heading) {
      current = {
        number: Number(heading[1]),
        title: heading[2].trim(),
        issue: heading[3] ? Number(heading[3]) : null,
        body: [],
      };
      chunks.push(current);
    } else if (line.startsWith('## ')) {
      current = null;
    } else if (current) {
      current.body.push(line);
    }
  }

  return {
    feature,
    chunks: chunks.map((chunk) => ({ ...chunk, body: chunk.body.join('\n').trim() })),
  };
}

/** Writes `(#issue)` after each chunk heading so the plan links to its issues. */
export function annotatePlan(markdown, issueNumbersByChunk) {
  return markdown
    .split('\n')
    .map((line) => {
      const heading = line.match(CHUNK_HEADING);
      if (!heading || heading[3]) return line;
      const issue = issueNumbersByChunk[Number(heading[1])];
      return issue ? `## Chunk ${heading[1]}: ${heading[2].trim()} (#${issue})` : line;
    })
    .join('\n');
}

/** Pulls the "Reviewer checklist" section out of the PR template. */
export function reviewerSection(template) {
  const start = template.indexOf('## Reviewer checklist');
  return start === -1 ? '' : template.slice(start).trim();
}

// ---------- process helpers (not unit tested) ----------

/** Runs a command and returns { ok, stdout, stderr }. Never throws. */
export function run(command, args = [], { inherit = false } = {}) {
  // npm (and an npm-installed claude) are .cmd files on Windows and can only
  // be spawned through a shell. Their arguments here never contain spaces.
  const useShell = IS_WINDOWS && (command === 'npm' || command === 'claude');
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: inherit ? 'inherit' : 'pipe',
    shell: useShell,
  });
  return {
    ok: result.status === 0,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    missing: result.error?.code === 'ENOENT',
  };
}

export function fail(message) {
  console.error(`\n[FAIL] ${message}\n`);
  process.exit(1);
}

export function info(message) {
  console.log(`[info] ${message}`);
}

export function ok(message) {
  console.log(`[ ok ] ${message}`);
}

export function currentBranch() {
  return run('git', ['branch', '--show-current']).stdout;
}

export function assertNotOnMain() {
  const branch = currentBranch();
  if (!branch) fail('Could not tell which git branch you are on. Are you inside the repo folder?');
  if (branch === 'main' || branch === 'master') {
    fail(`You are on "${branch}". Never commit straight to main. Start a chunk branch first:\n       npm run start-chunk -- <issue-number>`);
  }
  return branch;
}

export function parseIssueNumber(value) {
  const number = Number(String(value ?? '').replace('#', ''));
  if (!Number.isInteger(number) || number <= 0) return null;
  return number;
}

export function getIssue(number) {
  const result = run('gh', ['issue', 'view', String(number), '--json', 'number,title,body,state']);
  if (!result.ok) fail(`Could not read issue #${number} from GitHub.\n       ${result.stderr}`);
  return JSON.parse(result.stdout);
}

export function setIssueBody(number, body) {
  const result = run('gh', ['issue', 'edit', String(number), '--body', body]);
  if (!result.ok) fail(`Could not update issue #${number}.\n       ${result.stderr}`);
}

/** Ticks checklist boxes on an issue. Returns the labels that changed. */
export function tickIssueBoxes(number, keys) {
  const issue = getIssue(number);
  let body = issue.body;
  const changed = [];
  for (const key of keys) {
    if (!isTicked(body, key)) {
      body = tickBox(body, key);
      if (isTicked(body, key)) changed.push(checklistItem(key).label);
    }
  }
  if (changed.length > 0) setIssueBody(number, body);
  return changed;
}

export function runTests() {
  info('Running the test suite (npm test)...');
  return run('npm', ['test'], { inherit: true }).ok;
}
