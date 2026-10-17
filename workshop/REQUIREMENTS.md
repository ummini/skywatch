# What you need for the workshop

> **Not installed? That's fine.** You can watch the demo and get everything out of it.
> This repo and the handout are yours to try later at the hackathon.

## Required to follow along hands-on

| What | Why | Check it works |
| --- | --- | --- |
| A laptop you can install software on (macOS 13+, Windows 10/11, or Linux) | School-managed Chromebooks and locked-down laptops usually can't install these tools | - |
| A free [GitHub account](https://github.com/signup) with a verified email | Your copy of the repo, issues, and pull requests live here | log in at github.com |
| **Git** | Saves versions of your code (commits, branches) | `git --version` |
| **Node.js 22 LTS or newer** (22.12+) | Runs the app and the tests | `node -v` and `npm -v` |
| **GitHub CLI** (`gh`) | Lets you and the agent create issues and PRs from the terminal | `gh --version`, then `gh auth status` |
| **Claude Code 2.1.284 or newer** + the workshop invite | The AI coding agent. You'll get an **email invite from Anthropic (Claude Console)** to the workshop's organization, which pays for your usage. Accept it before you come. You don't need your own Claude subscription. No invite? Pair up and watch. | `claude --version` (2.1.284 or higher) |
| A charged battery or a charger | The workshop is 45 minutes of terminal time | - |

## Nice to have (not required)

- A code editor such as [VS Code](https://code.visualstudio.com) or [Cursor](https://cursor.com), to read the code and diffs comfortably.
- Basic terminal comfort: `cd folder`, `ls` (or `dir` on Windows).
- Knowing roughly what a **commit**, **branch**, and **pull request (PR)** are. We'll recap in 30 seconds.

## Install (one line each)

Open a terminal: **Terminal** on macOS, **PowerShell** on Windows.

| Tool | macOS | Windows | Linux |
| --- | --- | --- | --- |
| Git | `xcode-select --install` | Installer from [git-scm.com](https://git-scm.com/downloads) (includes Git Bash, which Claude Code uses) | `sudo apt install git` |
| Node.js | LTS installer from [nodejs.org](https://nodejs.org) | LTS installer from [nodejs.org](https://nodejs.org) | LTS from [nodejs.org](https://nodejs.org) or your package manager |
| GitHub CLI | `brew install gh` or [cli.github.com](https://cli.github.com) | `winget install --id GitHub.cli` or [cli.github.com](https://cli.github.com) | see [cli.github.com](https://cli.github.com) |
| Claude Code | `curl -fsSL https://claude.ai/install.sh \| bash` | `irm https://claude.ai/install.ps1 \| iex` | `curl -fsSL https://claude.ai/install.sh \| bash` |

After installing, **close and reopen your terminal** so it can find the new commands.

Already have Claude Code? Run `claude update` to get the latest version.

Official Claude Code install docs: <https://code.claude.com/docs/en/setup>

## Sign in (once)

```bash
gh auth login      # GitHub.com -> HTTPS -> Login with a web browser
claude             # choose "Anthropic Console account", then "Sign in with your Console account"
git config --global user.name "Your Name"
git config --global user.email "the-email-on-your-github-account@example.com"
```

For Claude: accept the email invite first. When the browser opens, log in with **the same email the invite went to** and pick the workshop organization. Back in Claude Code, type `/status` to check you're on the Console account, then `/exit`. Never share your login or paste API keys anywhere.

## Get the repo and check everything

1. On the workshop repo's GitHub page, click **Use this template** -> **Create a new repository**.
2. Then:

   ```bash
   gh repo clone <your-username>/skywatch
   cd skywatch
   npm install
   npm run doctor
   ```

`npm run doctor` prints `[PASS]`, `[WARN]`, or `[FAIL]` for each item, plus how to fix it.
All `PASS`? You're ready to fly.

## Stuck?

Don't spend the workshop fighting an installer. Pair up with a neighbor or just watch,
and come back to this page later. Helpers can fix most problems in five minutes after the session.
