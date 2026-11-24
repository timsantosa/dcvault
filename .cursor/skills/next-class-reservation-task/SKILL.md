---
name: next-class-reservation-task
description: >-
  Continues the Class Reservation System from the first unchecked task in
  dcvault/docs/CLASS_RESERVATION_PHASE_2.md. Asks only undecided questions,
  plans in Plan mode, implements with tests after approval, then sends the
  diff to a fresh reviewer. Use when the user invokes
  /next-class-reservation-task or asks for the next class reservation task.
disable-model-invocation: true
---

# Next class reservation task

One session, one unchecked task from the phase 2 list. Phase 1 (§18) is complete. Simpler code is better than an over-engineered system.

## 1. Read

Read these before proposing anything:

- `dcvault/docs/CLASS_RESERVATION_PHASE_2.md` — the first unchecked task, or the L id the user named
- The L item that task cites in `dcvault/docs/CLASS_RESERVATION_LATER_PHASES.md` — that item is the rule
- `dcvault/docs/CLASS_RESERVATION_SYSTEM.md` — §19, §16, and any dark-launch section the task still relies on. §18 is finished. Do not reopen it.
- `dcvault/docs/CLASS_RESERVATION_WIREFRAMES.md` — only the flows for this task (table below)
- `dcvault/docs/CREDIT_INVENTORY.md` when the task touches packages, grants, balances, or website sync
- Workspace `AGENTS.md` for repo layout and test commands

The L item wins over the phase 2 task list and over the wireframes. If they disagree, follow the L item and fix the task list. Do not implement an item that is not the current phase 2 task, and do not do the "What not to do" list in §19, unless the user explicitly asks.

If the user named a phase 2 task (for example "L48"), do that task. Otherwise take the first `[ ]` item in the phase 2 doc. A number like "3.1" is a finished §18 task. Do not rebuild it. An L id that is not in the phase 2 doc is a later phase, unassigned, or not being built. Stop.

## 2. Push back before planning

Stop and say so when the task, as written, is not worth building yet:

- It needs a product decision the L item or §16 still leaves open, and guessing would bake the wrong rule in. L30 is one of these: ask where the coach is told, then wait. L46 is the other: when it is the current task, ask the editor layout and wait. Do not invent the form, and do not skip the task.
- It repeats something already shipped, or it is not in the phase 2 task list
- A straightforward function or existing pattern covers it, and a new framework, layer, or generic "type" system does not
- It is too big for one session — propose the smallest slice that is still manually testable, and wait. L47 says this explicitly.

Wait for the user when you push back. Do not plan past a real objection.

## 3. Clarifying questions

Ask only what the PRD, wireframes, and credit inventory doc do not already decide. Settled behavior is not a question.

Use the AskQuestion tool when the answer is one of a few concrete options. Use prose for an open-ended answer. Batch every question into one turn, then stop.

If nothing is undecided, say that in one sentence and go to step 4.

## 4. Plan mode

After questions are answered (or there were none), switch to Plan mode with SwitchMode (`target_mode_id`: `plan`) before writing the plan. Do not edit code in Plan mode.

The plan states:

- Task id and the behavior being added
- Repos and files, following existing patterns and reusing components and shared functions.
- The simple approach, and any heavier approach you are not taking
- Unit tests (pure functions; see AGENTS.md). No `require` of `server/app.js`
- Out of scope, including the next phase 2 task
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

Decline, and say why, when a finding is a style nit, a one-use helper, future-proofing, a drive-by refactor, or scope that belongs to a later task or a later phase. Do not implement those.

## 8. Close the task

Follow §19 "After completing a task", applied to the phase 2 doc: check off that item, add completion notes (date and what shipped), update the L item and the wireframes if behavior changed, and tell the user the manual test steps plus the test commands you already ran. Do not check off a task whose tests failed. Do not edit §18.

## Wireframe flows

| Task | Read |
| --- | --- |
| L48 | Flow G |
| L49, L50 | Flow A. L50 also class detail. |
| L51 | Flow E2. The L item's date form wins over the E2 sketch. |
| L52 | Flow A chip, class detail, Flow B cancel preview, Flow E2 |
| L26 | Flow E1 |
| L53 | Class detail, and the attendees list (who sees what, Flow F) |
| L31 | Flow K, and staff cancel on the attendees row |
| L30 | Flow G (the flag is already there). Ask where the notice is delivered before planning. |
| L28 | Flow K. The L item is the rule. |
| L54 | No wireframe. CREDIT_INVENTORY.md §5. No member screen. |
| L47 | Flow A |
| L46 | No layout yet. This session works through the editor layout with the user. The app class sheet is what a class can store. Do not invent the form. |
