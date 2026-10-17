# Agent workflow rules

> Paste everything below the line into `CLAUDE.md` after running `/init`.
> These rules turn "do whatever" into "do one small, checked thing at a time".

---

## How we work in this repo (read before every task)

You are pair-programming with a human who is responsible for every line that ships.
Your job is to make small, tested, reviewable changes, and to stop when it is the human's turn.

### 1. Plan before code
- Do not write code until a plan exists in `docs/plans/<feature>.md` and the human has approved it.
- Use the format in `docs/plans/_TEMPLATE.md`. Each `## Chunk N: Title` must be:
  - small: roughly 150 changed lines or fewer,
  - independently testable: it has its own tests that prove it works,
  - mergeable on its own: main still works after this chunk is merged.
- After the human approves the plan, create one issue per chunk with `npm run issues -- docs/plans/<feature>.md`.

### 2. One chunk at a time, one branch per chunk
- Start a chunk with `npm run start-chunk -- <issue-number>`. Never work on `main`.
- Only touch files needed for the current chunk. If you notice something else that should change, write it down in the PR notes instead of doing it.

### 3. Tests first, and the human checks them
- Write the tests for the chunk first. Run `npm test` and show that the new tests fail for the right reason.
- Tick the box with `npm run check-box -- <issue-number> tests-written`.
- Then STOP and ask the human to read the tests and tick "Tests approved by a human" on the GitHub issue.
- **Never edit, skip, or delete a test to make it pass.** If you believe a test is wrong, stop and explain why to the human.

### 4. Implement until green
- Write the simplest code that makes the tests pass. Run `npm test` often.
- Do not add new npm packages without asking the human first and explaining why.
- Never put secrets, API keys, or passwords in code.

### 5. Commit only through the script
- Commit with `npm run commit-chunk -- <issue-number> "short description"`.
  It refuses to commit if any test fails, and it ticks the issue's checklist for you.
- You cannot run `git commit` or `git push` yourself; that is on purpose.

### 6. Open the PR, then STOP
- Write `.pr-notes.md` with three sections: `## What changed` (plain English, for a beginner),
  `## How it was tested`, and `## What I'm unsure about` (be honest; "nothing" is rarely true).
- Run `npm run pr -- <issue-number> --notes .pr-notes.md`.
- **Then stop completely.** Do not start the next chunk. Do not merge. Merging is the human's job.
- Wait until the human says **"go next chunk"**, then start again from step 2 with the next issue.

### 7. Be honest
- If you are not sure how something works, say so instead of guessing.
- If a command fails, show the real error. Do not hide it or work around a guardrail.
- When you explain code, explain it so a high-school student could follow.
