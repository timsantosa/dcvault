---
name: next-class-reservation-task
description: >-
  Continues the Class Reservation System from the first unchecked task in
  dcvault/docs/CLASS_RESERVATION_SYSTEM.md. Asks only undecided questions,
  plans in Plan mode, implements with tests after approval, then sends the
  diff to a fresh reviewer. Use when the user invokes
  /next-class-reservation-task or asks for the next class reservation task.
disable-model-invocation: true
---

# Next class reservation task

One session, one unchecked task from §18. Simpler code is better than an over-engineered system.

## 1. Read

Read these before proposing anything:

- `dcvault/docs/CLASS_RESERVATION_SYSTEM.md` — §18 (first unchecked task), §19, §16, §15, and the product sections that task cites
- `dcvault/docs/CLASS_RESERVATION_WIREFRAMES.md` — only the flows for this task (table below)
- `dcvault/docs/CREDIT_INVENTORY.md` when the task touches packages, grants, balances, or website sync
- Workspace `AGENTS.md` for repo layout and test commands

The PRD wins over the wireframes. Do not implement Phase 2+ (§15) or the "What not to do" list in §19.

If the user named a specific task (for example "3.1"), do that task. Otherwise take the first `[ ]` item under §18.

## 2. Push back before planning

Stop and say so when the task, as written, is not worth building yet:

- It needs a product decision §16 still leaves open, and guessing would bake the wrong rule in
- It repeats something already shipped, or it is Phase 2
- A straightforward function or existing pattern covers it, and a new framework, layer, or generic "type" system does not
- It is too big for one session — propose the smallest slice that is still manually testable, and wait

Wait for the user when you push back. Do not plan past a real objection.

## 3. Clarifying questions

Ask only what the PRD, wireframes, and credit inventory doc do not already decide. Settled behavior is not a question.

Use the AskQuestion tool when the answer is one of a few concrete options. Use prose for an open-ended answer. Batch every question into one turn, then stop.

If nothing is undecided, say that in one sentence and go to step 4.

## 4. Plan mode

After questions are answered (or there were none), switch to Plan mode with SwitchMode (`target_mode_id`: `plan`) before writing the plan. Do not edit code in Plan mode.

The plan states:

- Task id and the behavior being added
- Repos and files, following existing patterns
- The simple approach, and any heavier approach you are not taking
- Unit tests (pure functions; see AGENTS.md). No `require` of `server/app.js`
- Out of scope, including the next §18 task
- What the user should manually test when it is done

Stop. Implement only after the user approves the plan. Do not ask again once they approve. If you are still in Plan mode, switch to Agent mode and build.

## 5. Build

- Scope stays on this task
- Match the repo you are in: Node 16, Sequelize, MySQL 5.7, CommonJS in `dcvault/`; Node 24, Expo, TypeScript in `polevaultapp/DCVault/`
- `nvm use` in each repo before tests
- Run `npm test` in every repo you change. Fix failures before review
- For a website or mobile UI change, verify the flow the way a user would when a browser or simulator is available. Say what you could not run
- Do not commit

## 6. Fresh review

After tests pass, launch one Bugbot subagent per git repo that has changes. Each reviewer starts with no conversation, no plan, and no rationale. Run them in parallel. `run_in_background`: false. Description: `Bugbot`. `subagent_type`: `bugbot`.

Use `Diff: uncommitted changes` so earlier tasks on this branch are not part of the review. Do not commit first.

```text
Full Repository Path: <absolute path to dcvault or polevaultapp>
Diff: uncommitted changes
Custom Instructions: Review only this diff. Look for correctness bugs, permission holes, and missing tests for business logic that this diff added. Flag code that is hard to read or more abstract than the task needs. Do not propose new abstractions, extra flexibility, or refactors outside this diff unless they fix a concrete bug. Simpler code is the standard.
```

If Bugbot fails because the call was wrong or the diff could not be computed, retry once using the review-bugbot skill's retry rules. Then stop and tell the user.

## 7. Triage the review

You decide what is worth changing. Fix concrete bugs, wrong behavior against the task, permission holes, and missing tests for logic this task added. Then re-run `npm test` in repos you touch.

Decline, and say why, when a finding is a style nit, a one-use helper, future-proofing, a drive-by refactor, or scope that belongs to a later task or Phase 2. Do not implement those.

## 8. Close the task

Follow §19 "After completing a task": check off the §18 item, add completion notes (date and what shipped), update the PRD and wireframes if behavior changed, and tell the user the manual test steps plus the test commands you already ran. Do not check off a task whose tests failed.

## Wireframe flows

| Task | Read |
| --- | --- |
| 3.1 | CREDIT_INVENTORY.md §5. No member screen. |
| 4.1, 4.2, 8.1 | Flow G |
| 5.1 | PRD §6 and §16 item 3. No screen. |
| 6.1, 6.2 | Who sees what, visual language, Flow A |
| 7.1, 7.2 | Flows A, B, C |
| 8.2 | Flow D |
| 9.1, 9.2 | Flow I and Flow G4 |
| 10.1, 10.2 | Flow F |
| 11.1 | Flow J |
| 11.2 | Flow E and Flow E+ |
| 12.1 | Who sees what, roster on class detail |
| 12.2 | Flow K |
| 12.3 | Flow H |
| 13.x | MVP checklist and the flows for gaps you find |
