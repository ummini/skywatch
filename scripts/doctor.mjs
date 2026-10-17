#!/usr/bin/env node
// Usage: npm run doctor
// Checks that this laptop is ready for the workshop. Changes nothing.
import { existsSync } from 'node:fs';
import { run } from './lib.mjs';

const results = [];
const report = (status, name, detail = '', fix = '') => results.push({ status, name, detail, fix });

// Node
const [major, minor] = process.versions.node.split('.').map(Number);
const nodeOk = (major === 22 && minor >= 12) || major >= 24;
report(nodeOk ? 'PASS' : 'FAIL', 'Node.js 22.12+', `you have ${process.versions.node}`, 'Install the LTS version from https://nodejs.org');

// Git
const git = run('git', ['--version']);
report(git.ok ? 'PASS' : 'FAIL', 'Git installed', git.stdout, 'Install from https://git-scm.com');

if (git.ok) {
  const name = run('git', ['config', 'user.name']).stdout;
  const email = run('git', ['config', 'user.email']).stdout;
  report(
    name && email ? 'PASS' : 'FAIL',
    'Git knows who you are',
    name && email ? `${name} <${email}>` : 'name or email missing',
    'git config --global user.name "Your Name"  &&  git config --global user.email "you@example.com"',
  );
}

// GitHub CLI
const gh = run('gh', ['--version']);
report(gh.ok ? 'PASS' : 'FAIL', 'GitHub CLI (gh) installed', gh.stdout.split('\n')[0], 'Install from https://cli.github.com');

let ghAuthed = false;
if (gh.ok) {
  const auth = run('gh', ['auth', 'status']);
  ghAuthed = auth.ok;
  report(auth.ok ? 'PASS' : 'FAIL', 'Signed in to GitHub CLI', '', 'gh auth login   (choose GitHub.com, HTTPS, login with a web browser)');
}

// Claude Code
const claude = run('claude', ['--version']);
report(
  claude.ok ? 'PASS' : 'WARN',
  'Claude Code installed',
  claude.stdout,
  'See workshop/REQUIREMENTS.md. No Claude Code? You can still watch and follow along.',
);

if (claude.ok) {
  const MIN_CLAUDE = [2, 1, 284];
  const found = claude.stdout.match(/(\d+)\.(\d+)\.(\d+)/);
  const version = found ? found.slice(1).map(Number) : null;
  const diff = version && version.map((n, i) => n - MIN_CLAUDE[i]).find((d) => d !== 0);
  report(
    version && (diff === undefined || diff > 0) ? 'PASS' : 'WARN',
    `Claude Code ${MIN_CLAUDE.join('.')}+`,
    version ? `you have ${version.join('.')}` : 'could not read the version',
    'claude update',
  );
}

// This repo
report(
  existsSync('node_modules') ? 'PASS' : 'FAIL',
  'Dependencies installed',
  '',
  'npm install',
);

if (ghAuthed) {
  const repo = run('gh', ['repo', 'view', '--json', 'nameWithOwner,isFork,hasIssuesEnabled,viewerPermission']);
  if (!repo.ok) {
    report('FAIL', 'This folder is a GitHub repo', '', 'Clone your own copy: gh repo clone <your-username>/skywatch');
  } else {
    const info = JSON.parse(repo.stdout);
    const canWrite = ['ADMIN', 'MAINTAIN', 'WRITE'].includes(info.viewerPermission);
    report(
      canWrite ? 'PASS' : 'FAIL',
      'You own this repo',
      info.nameWithOwner,
      'Click "Use this template" on GitHub to make your own copy, then clone that one.',
    );
    report(
      info.hasIssuesEnabled ? 'PASS' : 'FAIL',
      'Issues are turned on',
      '',
      'gh repo edit --enable-issues',
    );
    if (info.isFork) {
      report(
        'WARN',
        'This repo is a fork',
        'PRs may go to the original repo',
        `gh repo set-default ${info.nameWithOwner}`,
      );
    }
  }
}

console.log('\nSkyWatch workshop doctor\n');
for (const { status, name, detail, fix } of results) {
  console.log(`  [${status}] ${name}${detail ? `  (${detail})` : ''}`);
  if (status !== 'PASS' && fix) console.log(`         fix: ${fix}`);
}

const failures = results.filter((r) => r.status === 'FAIL').length;
console.log(
  failures === 0
    ? '\nAll set. You are ready to fly.\n'
    : `\n${failures} thing(s) to fix. Stuck? Watching along is totally fine. Fix it later at the hackathon.\n`,
);
process.exit(failures === 0 ? 0 : 1);
