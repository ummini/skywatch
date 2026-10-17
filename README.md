# SkyWatch

A tiny flight departures board for practicing **responsible agentic engineering**:
using an AI coding agent (Claude Code) with a plan, tests, small commits, and human review,
instead of one giant "vibe-coded" prompt.

Built for the Hack the Skies workshop.

## Get your own copy

1. Click **Use this template** -> **Create a new repository** on GitHub (public is fine).
2. Clone **your** copy and install:

   ```bash
   gh repo clone <your-username>/skywatch
   cd skywatch
   npm install
   npm run doctor
   ```

   No setup yet? Read [workshop/REQUIREMENTS.md](workshop/REQUIREMENTS.md). You can watch the demo without installing anything.

3. Run it:

   ```bash
   npm run dev     # open the URL it prints
   npm test        # run the tests
   ```

## The workshop

| File | What it is |
| --- | --- |
| [workshop/REQUIREMENTS.md](workshop/REQUIREMENTS.md) | What to install, and how to check it |
| [workshop/HANDOUT.md](workshop/HANDOUT.md) | One-page cheat sheet: the loop, the checklist, feature ideas |
| [workshop/PROMPTS.md](workshop/PROMPTS.md) | Copy-paste prompts for every step |
| [workshop/agent-workflow.md](workshop/agent-workflow.md) | The rules we give the agent in `CLAUDE.md` |
| [docs/plans/_TEMPLATE.md](docs/plans/_TEMPLATE.md) | The shape of a good plan |

## Helper scripts

These wrap `git` and `gh` so the safe path is also the easy path.

| Command | What it does |
| --- | --- |
| `npm run doctor` | Checks Node, Git, GitHub CLI, Claude Code, and that this repo is yours |
| `npm run issues -- docs/plans/<feature>.md` | Creates one GitHub issue per `## Chunk N:` in the plan |
| `npm run start-chunk -- <issue>` | Pulls the latest `main`, then creates `chunk/<issue>-<name>` |
| `npm run check-box -- <issue> tests-written` | Ticks an agent-owned checkbox on the issue |
| `npm run commit-chunk -- <issue> "message"` | Runs tests. Only if they pass: commit, push, tick boxes |
| `npm run pr -- <issue> --notes .pr-notes.md` | Checks tests, build, and the human test approval, opens a PR, then says **STOP** |

`.claude/settings.json` blocks the agent from running `git commit`, `git push`, or `gh pr merge` itself,
so changes reach `main` only through these scripts plus a human merge.
These are guardrails that prevent accidents. They are not a security boundary.

## Project layout

```
src/
  api/getDepartures.js        fake API: waits 1.5s, then returns data/departures.json
  components/DeparturesBoard  the flights table
  App.jsx                     loads flights and shows the board
scripts/                      the helper scripts above (plain Node, no extra packages)
```
