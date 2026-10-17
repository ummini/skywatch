# Copy-paste prompts

Use these in order. Replace anything in `<angle brackets>`.
Notice what they have in common: each one asks for **one** thing, and most end with "then stop".

---

## 0. Set up context (once per repo)

```
/init
```

Then:

```
Read workshop/agent-workflow.md and add its rules (everything below the line) to the end of CLAUDE.md.
Then move the project facts (what the app is, commands, folder structure) into a new AGENTS.md
so other AI tools can read them too, and make CLAUDE.md import it with a line that says @AGENTS.md.
Show me both files when you are done. Do not change any other files.
```

> Why: without this the agent guesses what your project is. With it, every session starts with the same facts and rules.

---

## 1. Plan (press Shift+Tab until you see "plan mode")

```
I want to add <feature>. Right now <what happens today>.
Make a plan in docs/plans/<feature-slug>.md using docs/plans/_TEMPLATE.md.
Split it into 2-4 chunks. Each chunk must be small, have its own tests, and leave main working.
Ask me questions first if anything is unclear. Do not write any code yet.
```

Demo version:

```
I want to add a loading screen. Right now the app shows a blank page for 1.5 seconds while
departures load, and if loading fails nothing happens at all.
Make a plan in docs/plans/loading-screen.md using docs/plans/_TEMPLATE.md.
Split it into 3 chunks. Each chunk must be small, have its own tests, and leave main working.
Ask me questions first if anything is unclear. Do not write any code yet.
```

Read the plan. Push back on anything you do not understand. Then approve it.

---

## 2. Issues

```
Create the GitHub issues for the plan with npm run issues -- docs/plans/<feature-slug>.md.
Show me the issue links, then stop.
```

---

## 3. Tests first (one chunk)

```
Start chunk 1 (issue #<N>) with npm run start-chunk.
Write ONLY the tests for this chunk. Run them and show me that they fail, and why.
Then tick tests-written and stop so I can review the tests.
```

Now **you** read the tests. Ask the agent: *"Explain each test in one sentence. What bug would each one catch?"*
If you are happy, tick **"Tests approved by a human"** on the GitHub issue.

---

## 4. Implement, commit, PR

```
I approved the tests on issue #<N>. Implement the chunk until all tests pass.
Do not change the tests. Commit with npm run commit-chunk, write .pr-notes.md, open the PR
with npm run pr, then stop.
```

---

## 5. Review (you, on GitHub)

Ask the agent to help you review, but **you** decide:

```
Explain PR #<N> to me like I am new to React. Walk through every changed file.
What could break? What did you assume? What would you test by hand?
```

Then: run `npm run dev`, click around, tick the reviewer checklist on the PR, and merge on GitHub.

---

## 6. Next chunk

```
I merged PR #<N>. go next chunk
```

---

## When things go wrong

| Situation | Say this |
| --- | --- |
| The agent wants to change a test | "Stop. Do not change the test. Explain why you think the test is wrong." |
| The diff is huge | "This is too big for me to review. Undo this and split it into smaller chunks." |
| You do not understand a change | "Explain line <X> of <file>. What happens if I delete it?" |
| It added a package | "Why do we need this package? Can we do it without one?" |
| It keeps failing the same way | "Stop. Summarize what you have tried and what you think the cause is. Do not change anything yet." |
| It went off and did extra stuff | "Only do what issue #<N> asks. Undo everything else." |
