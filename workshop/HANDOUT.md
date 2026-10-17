# Responsible agentic engineering: one-page cheat sheet

**AI can write code fast. You are still the one responsible for it.**
If you can't explain it, don't merge it.

## The loop

```
 context  ->  plan  ->  issues  ->  for each chunk:
 /init        plan      one per      branch -> tests -> HUMAN checks tests
 CLAUDE.md    mode      chunk        -> code until green -> commit -> PR
 AGENTS.md                           -> HUMAN reviews + merges -> "go next chunk"
```

| Step | Command | Who |
| --- | --- | --- |
| Check your setup | `npm run doctor` | you |
| Give the agent context | `/init`, then add `workshop/agent-workflow.md` to `CLAUDE.md` | agent, you review |
| Plan | Shift+Tab to plan mode, see `workshop/PROMPTS.md` | agent writes, **you approve** |
| One issue per chunk | `npm run issues -- docs/plans/<feature>.md` | agent |
| Start a chunk | `npm run start-chunk -- <issue>` | agent |
| Tests first | agent writes tests, they fail | agent writes, **you approve on GitHub** |
| Make them pass | `npm test` | agent |
| Commit (only if green) | `npm run commit-chunk -- <issue> "message"` | agent |
| Open PR and stop | `npm run pr -- <issue> --notes .pr-notes.md` | agent |
| Review and merge | GitHub PR page, `npm run dev` | **you, only you** |

## Why not just one-shot it?

- **Wrong code nobody notices.** It looks right, runs once, and breaks later. Tests catch it now.
- **Too big to understand.** Nobody can really review a 600-line diff. Small chunks can be reviewed.
- **Wasted tokens and time.** Without a plan the agent wanders, retries, and rewrites. A plan is a map.
- **Cognitive debt.** Every line you don't understand is a loan. You pay it back with interest when it breaks.
- **You can't own what you don't know.** Your name is on the commit, not the AI's.

## Before you merge, check

- [ ] I read every changed file
- [ ] I can explain every changed line
- [ ] Tests check the real behavior, and none were weakened or deleted
- [ ] I ran it and it works
- [ ] No surprise packages, secrets, or files
- [ ] It only does what the issue asked

## Red flags: stop the agent when you see these

- It edits or deletes a test to "fix" a failure
- It wants to install a package you've never heard of (AI sometimes invents package names, and attackers register them)
- It touches files that have nothing to do with the chunk
- It says "done!" but you never saw the tests pass
- It asks to run something with `sudo`, `rm -rf`, or `--force`
- It wants to read `.env` or paste in an API key

## Feature ideas for your turn

Pick one, and plan it as 2-3 chunks:

- **Search box:** filter flights by destination as you type
- **Delayed badge:** highlight delayed and cancelled flights, with a count in the header
- **Sort:** click a column header to sort by time, gate, or destination
- **Dark/light toggle:** remember the choice in `localStorage`
- **Auto-refresh:** reload departures every 30 seconds, with a "last updated" time
- **Flight details:** click a row to see more info in a panel
- **Your own idea:** keep it small enough to finish in 2-3 chunks

## Learn more

- Claude Code docs: <https://code.claude.com/docs>
- The prompts we used: `workshop/PROMPTS.md`
- The rules we gave the agent: `workshop/agent-workflow.md`
