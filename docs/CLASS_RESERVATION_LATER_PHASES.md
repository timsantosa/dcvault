# Class Reservation — Later Phases

**Status:** Phases filled in 2026-11-22. `unassigned` still needs a phase.  
**Last updated:** 2026-11-24  
**Phase 1 (dark launch):** [CLASS_RESERVATION_SYSTEM.md](./CLASS_RESERVATION_SYSTEM.md)  
**Phase 2 sessions:** [CLASS_RESERVATION_PHASE_2.md](./CLASS_RESERVATION_PHASE_2.md) — build order for the fourteen `Phase 2` items. This file stays the rule.  
**Screens for phase 1:** [CLASS_RESERVATION_WIREFRAMES.md](./CLASS_RESERVATION_WIREFRAMES.md)  
**Credit schema:** [CREDIT_INVENTORY.md](./CREDIT_INVENTORY.md)

This file is the list after the dark launch. Phase 1 stays in the PRD. The **Phase** line on each item is the assignment. `unassigned` means it still needs one.

Three labels say how ready an item is:

- **Rules written** — the behavior below is enough to build without a new product decision.
- **Named only** — the old Phase 2+ list names it. The workflow is not specified. Assigning a phase still needs a short product pass before anyone builds it.
- **Not decided** — explicitly parked. Putting it in a phase means choosing to build it.

The order below is by area, not by priority. Credit schema constraints stay in [CREDIT_INVENTORY.md](./CREDIT_INVENTORY.md) §9 and §11. This file is the product rule.

Tasks 13.1 and 13.2 are done. They are the dark-launch test pass and the MVP checklist cleanup, not items in this file. The §15 checklist is fully checked. Anything still to build is in this file.

---

## Schedule and classes

### L1. Per-weekday location

**Phase:** Phase 2  
**Ready:** Rules written

A series can give each weekday its own location and address, the same way it already gives each weekday its own start and end. A weekday left blank keeps the series location. Changing one date still overrides that date and does not rewrite the weekday.

A location change on a weekday uses the existing class-change notice for upcoming reservations on that weekday.

Phase 1 uses one location and address for the series. A single date can already be edited to a different place.

If [L37](#l37-separate-google-calendar-sync) ships first, every weekday event uses the series location. After this item, the synced event uses the weekday’s location when the weekday has one.

### L2. Class configuration presets

**Phase:** Not doing  
**Ready:** Named only

Staff shortcuts for common setups (open class, private lesson, break, and similar), so a new class starts from a preset instead of an empty form. Phase 1 is a full configuration form with copy-from-existing. No preset list was written.

### L3. Meets reservation workflows

**Phase:** Not doing  
**Ready:** Named only

A meet is already a class. Leave it visible and not reservable, or turn reservable on and set a credit or dollar cost when people should sign up. That is the same path as any other class. No separate meets workflow.

### L4. Waitlist

**Phase:** Phase 4  
**Ready:** Named only

Phase 1 is a hard stop when a class is full. No one joins a waitlist. Join, notify, promote, expire, and what happens to a credit while someone is waiting were not specified.

### L45. Coaching classes on the coach’s calendar

**Phase:** Later phase  
**Ready:** Rules written

When the selected profile is on the coaching staff for a class, that day uses the same filled marker as a day they reserved. The agenda row says **Coaching**. It does not create a reservation, spend a credit, or show Cancel.

The staff for a date is the series coach list, unless that date has its own coach list. A class they also reserved still says **Reserved**, because that signup is real. One color on a day stays one marker, and it is filled if they reserved or they are coaching.

Phase 1 fills the marker only when the selected athlete has a signup. Being a coach does not.

### L46. Website class calendar

**Phase:** Phase 2  
**Ready:** Named only

Coaches need to build classes on the website, not only in the app. The page is a calendar in the style of Google Calendar, and staff add a class from that calendar. It reads and writes the same classes as the app. It is not a second schedule, and it does not replace the public Google Calendar. That cutover is [L39](#l39-public-calendar-and-zen-planner-retirement).

The website has no app-style permission checks. Its JWT already carries `isAdmin`. This page is limited to `isAdmin` until the app permissions are put on that token. Do not build a website permission system as part of this page. `manage_classes` on the web token can replace the `isAdmin` check later without a new calendar.

The editor layout is not specified yet. Do not invent the form. The app class sheet remains the source for what a class can store until that layout is written. The phase 2 task list picks this up last, and that session settles the layout with the user, then writes it here.

### L47. Schedule window follows the calendar

**Phase:** Phase 2  
**Ready:** Rules written

Anyone on the app calendar, member or staff, can need a class five or six months out. Phase 1 does not do that. `GET /mobileapp/user/schedule` always uses today: 14 days back through 77 days ahead. The class list rejects a range longer than 92 days. A month on screen can therefore stop before the month ends.

The app keeps loaded classes in memory and asks for more as the person moves.

- A fetch never leaves a month half loaded. If the range touches a month, that whole month is included before the month grid shows it.
- Ask for about 60 days of new classes, then extend both ends to the first and last day of the months that span covers. A request still cannot be longer than 92 days. Three whole months fit. A longer span is more than one request, and the grid waits until each of those months is complete.
- The loaded set is the union of those fetches. Moving near either end of what is loaded fetches the next chunk in that direction and adds it. Months already loaded stay.
- Choosing a date outside the loaded set fetches around that date: 14 days before it and about 60 days after it, then out to whole months. It does not first load every month between today and that date.
- Moving into a gap between two loaded stretches fetches those missing months and fills them in.
- A refresh uses the calendar’s selected date when that date is not today. The new load is the window around the selected date. Months that were only in memory from before the refresh are not assumed to still be there.
- Attendance older than the loaded window stays on class history. This does not turn the schedule into an infinite history list.

### L48. Weekday rows start on the series start day

**Phase:** Phase 2  
**Ready:** Rules written

On a new repeating class, the day rows and the weekday picker begin with the weekday of the series start date, then the rest of the week, wrapping after Saturday. A series that starts on Wednesday lists Wednesday first, not Sunday. Add weekday picks the next free day in that same order.

Phase 1 already sets the first row to the selected date’s weekday. The picker still runs Sunday through Saturday, and Add weekday takes the first free day from Sunday. The rows then sort Sunday-first, so the start day jumps down the list.

Changing the series start date does not move days already chosen. The picker order follows the new start date. Saved weekday numbers stay as they are. Sunday is still 0.

### L49. Class description on the schedule

**Phase:** Phase 2  
**Ready:** Rules written

The agenda row on the schedule shows the class description, truncated to two lines, so a longer description is visibly cut off. The class detail screen keeps the full description. A class with no description adds no line.

This is the class description, not the class note and not the athlete’s reservation note. The row already shows the class note when one is set. Both can show. The month grid stays dots only.

### L50. Quarter label on each class

**Phase:** Phase 2  
**Ready:** Rules written

The agenda row and the class detail screen name the quarter that class date falls in. The quarter comes from the class date and the fixed season dates: winter Dec–Feb, spring Mar–May, summer Jun–Aug, fall Sep–Nov. The label is the season and the year that season starts, such as `Fall 2026` or `Winter 2026` (Dec 2026 through Feb 2027).

A class does not get a quarter from the athlete’s package. Two classes on the same day share a label. The month grid does not add the label.

### L51. Dates on Upcoming classes

**Phase:** Phase 2  
**Ready:** Rules written

Each row on Upcoming classes shows the weekday and date, in the same form as the schedule’s day headers (`Tuesday, Dec 2`), above the time. The schedule list already groups rows under those headers. Upcoming classes does not, so a row there is only a time and a title.

The date is the class date. Several classes on one day each show that date.

### L52. Credit chip for one quarter

**Phase:** Phase 2  
**Ready:** Rules written

The chip’s remaining count and reserved count are for the same quarter. Phase 1 remaining counts credits that cover today, and reserved counts every upcoming reservation, including ones in a later quarter. That is how fall can read `0 remaining · 8 reserved` while winter still has unused credits.

The quarter is the quarter of the day selected on the calendar. Moving to a day in another quarter switches the chip. Website purchases and staff grants both count. The chip names that quarter, after the counts, so the words `remaining` and `reserved` stay where they are: `7 remaining · 8 reserved · Winter 2026`.

Remaining is the unused balance of grants that cover that quarter. Reserved is upcoming reservations whose class date falls in that quarter. A winter reservation is not counted on a fall chip. The expiring line counts only credits inside that same quarter. Unlimited for that quarter stays `Unlimited · N reserved`, then the quarter name.

The schedule chip, the class detail chip, and the cancel preview all use this text. Class detail uses the quarter of that class date. Upcoming classes uses the quarter of the selected calendar day, the same as the schedule.

---

## Reservations and poles

### L5. Update a reservation note

**Phase:** Phase 4  
**Ready:** Rules written

After reserving, the member can add or change the free-text note on that reservation. Phase 1 accepts the note on the reserve request and does not allow a later edit. The note stays free text. Showing the saved note, without editing it, is [L53](#l53-show-the-reservation-note).

### L53. Show the reservation note

**Phase:** Phase 2  
**Ready:** Rules written

On class detail, the selected athlete’s reservation note shows as text when that class is already reserved and the note is not empty. It is not an editor. Phase 1 hides the editor after reserve, and the text on that screen is the class note, not this note. The reservation note is stored on the signup and is not on the schedule payload yet.

The attendees list shows that same note under the athlete’s name when it is not empty. Anyone who can open that list can read it. It is not editable there.

Before reserve, the optional note field stays editable, which it already is. An empty note adds no line. Editing a note after reserve stays [L5](#l5-update-a-reservation-note).

### L6. Structured pole selection

**Phase:** Phase 4  
**Ready:** Named only

The member picks a pole instead of typing a note. Phase 1 is the free-text note in [L5](#l5-update-a-reservation-note). No pole catalog, no required-versus-optional rule, and no link to the pole already stored on the profile were specified.

### L7. Multi-pole preference order

**Phase:** Phase 4  
**Ready:** Named only

The member ranks more than one pole. Depends on a structured selection ([L6](#l6-structured-pole-selection)). No ranking rules were written.

### L8. Pinned-pole quick-select

**Phase:** Phase 4  
**Ready:** Named only

A saved pole the member can apply in one tap. Depends on [L6](#l6-structured-pole-selection). No pin rules were written.

### L9. Bulk series updates

**Phase:** unassigned  
**Ready:** Named only

Staff update reservation notes or pole choices across a series in one action. Phase 1 edits one occurrence or the series fields on the class. It does not push a note or a pole onto existing reservations. The phase 1 series model was shaped so this can be added later. The bulk action itself was not specified.

### L10. Bulk / multi-class reservation

**Phase:** Later Phase  
**Ready:** Named only

A member reserves more than one session in one action (for example every Tuesday). Phase 1 reserves one session, one series and one date. No rule was written for a partial failure, a full class in the middle of the run, or how many credits are held if one date is ineligible.

### L11. Private lesson request / approve

**Phase:** Phase 3  
**Ready:** Named only

A lesson reservation waits for staff approval instead of saving immediately. Phase 1 private lessons reserve immediately after the member confirms the price. No card is charged. Who approves, what the member sees while waiting, and whether a hold is placed were not specified.

### L12. Override reservation cutoff or eligibility

**Phase:** unassigned  
**Ready:** Named only

Staff can reserve an athlete after the reservation cutoff, or reserve an athlete who fails the group or age check. Phase 1 rejects both. Staff can already cancel someone else’s reservation after the cancellation cutoff, and that cancel returns the credit. Marking someone present does not recheck eligibility. How an override is confirmed, and whether it is written to an audit log ([L40](#l40-audit-log)), were not specified.

A walk-in does not do this. A walk-in and a reservation are the same `classReservations` row. `walkIn` true means staff added that signup at check-in. It spends a credit the same way, and it can be marked present. It is allowed on the class’s calendar day and after, and it skips the reservation cutoff. It still rejects a future date, a full class, a view-only class, a canceled class, and a group or age mismatch. So staff can add an eligible athlete once the class day has started. They cannot book a future date after the cutoff, and they cannot put an ineligible athlete on the class.

---

## Check-in

### L13. Late arrival distinction

**Phase:** Later Phase  
**Ready:** Named only

Phase 1 check-in is present or not. A reserved athlete who is not checked in is a no-show, and the credit was already taken at reserve. No separate late state was specified.

### L14. Athlete self-check-in

**Phase:** Later phase  
**Ready:** Named only

The athlete marks themselves present. Phase 1 check-in is staff only, on the attendees screen, with `manage_attendance`.

### L15. Kiosk / tablet mode

**Phase:** Not doing  
**Ready:** Named only

A front-desk device for check-in. No device, login, or roster rules were written.

### L16. Overdraft credits

**Phase:** Later phase  
**Ready:** Not decided

Parked on purpose. If this is chosen: a walk-in (or a similar case) can go negative, and the next package purchase pays that debt back. Do not design a debt ledger until this is explicitly chosen. Phase 1 refuses a walk-in with no credits unless staff with `manage_credits` add a credit first, then check the person in.

Open question in the PRD (§16 #5).

---

## Credits, packages, and money

### L17. In-app registration

**Phase:** Phase 3  
**Ready:** Rules written, large

Members buy packages in the app. Entry points, when this exists: Schedule tab, athlete profile, and the out-of-credits prompt. Parity with the website means packages, waivers, registration fields, discounts, and PayPal.

Phase 1 registration stays on the website. The app can point a member with no credits at the website. Discount behavior in the app must match the website, including automatic discounts if [L23](#l23-automatic-discounts) exists by then.

### L18. Real payment at reserve

**Phase:** Phase 3  
**Ready:** Rules written at the product level

Dollar-cost classes charge a card when the member reserves. Phase 1 shows the price, saves the reservation with `paymentStatus: external`, and does not call PayPal. Staff invoice outside the app and can cancel the reservation with `manage_classes`.

Which processor, what a failed charge does to the spot, and refunds ([L25](#l25-refund-and-chargeback-automation)) were not specified beyond “real card charging.”

### L19. Lesson-credit packs

**Phase:** Later phase  
**Ready:** Rules written

The website sells lesson packs. A lesson reservation spends a lesson credit instead of only the pay-at-reserve price.

Schema shape, from [CREDIT_INVENTORY.md](./CREDIT_INVENTORY.md) §9: add `creditPool` (string, default `group`) on `classPackages`, `creditGrants`, and the class. Deduction filters on pool. Phase 1 did not add that column. Group credits are not spent on a lesson.

### L20. Weekly-allotment packages

**Phase:** Phase 5  
**Ready:** Rules written

Alongside “N classes for the period,” offer packages that grant **N classes per week** for the period (for example 3 per week). Unused classes do not roll. If the athlete uses 1 of 3, the leftover 2 vanish at the end of that week.

Schema shape, from [CREDIT_INVENTORY.md](./CREDIT_INVENTORY.md) §11: `allotment` on `classPackages` (`total` by default, or `weekly`) plus a weekly class count. Each week is its own `creditGrant` whose `expiresAt` is the end of that week. Deduction stays “soonest `expiresAt` first,” so a weekly grant is used before a quarter grant that ends later. No second balance engine.

Phase 1 packages are a total count for a period, including unlimited (null count). The period those weeks sit inside follows the season dates, which [L21](#l21-configurable-quarter-dates) would make editable.

### L21. Configurable quarter dates

**Phase:** Phase 5  
**Ready:** Rules written

An admin sets each season’s start and end. Credit expiration and the active-member quarter check use that same configuration.

Phase 1 seasons are fixed: Dec–Feb, Mar–May, Jun–Aug, Sep–Nov, using `getCurrentQuarter` in `server/lib/helpers.js`. Do not add a second clock. [CREDIT_INVENTORY.md](./CREDIT_INVENTORY.md) §11.

### L22. Auto-renewing memberships

**Phase:** Phase 4  
**Ready:** Rules written

An admin sets up one or more membership products and their cadence (quarterly, yearly, or another interval they configure). The customer signs up and can cancel at any time. Staff can change or end a membership. A new interval is an admin setting, not an engineering project.

Schema shape, from [CREDIT_INVENTORY.md](./CREDIT_INVENTORY.md) §11: a `membershipPlans` catalog (cadence, price, grant template) and a `memberships` row per athlete (`active` / `canceled`, period bounds). Each period inserts a `creditGrant` with a new `source` string. `source` is already a string so a renewal does not need an `ALTER`. Cancel stops future grants and leaves old ones. The renewal job is a new writer on the existing grants.

### L23. Automatic discounts

**Phase:** Later Phase  
**Ready:** Rules written, one open question

Discounts that apply from rules, without a coach issuing a code. Early bird and military are the examples. They cover class packages and paid events. The early-bird window is a duration staff set, not a hardcoded date.

Manual codes can remain until they are no longer needed. Phase 1 is the existing website discount system. Coaches hand out codes. There is no in-app discount screen.

Still open (PRD §16 #6): how military and other non-time-based discounts are verified, and whether automatic discounts stack with manual codes.

### L24. Discount management in the app

**Phase:** Later phase  
**Ready:** Named only

Staff manage the existing manual discount codes in the app. Phase 1 has no `manage_discounts` permission and no in-app discount UI. When [L17](#l17-in-app-registration) ships, checkout must validate codes the way the website does. This item is the admin UI for those codes, separate from automatic rules ([L23](#l23-automatic-discounts)).

### L25. Refund and chargeback automation

**Phase:** Later phase  
**Ready:** Named only

Phase 1 refunds are manual. The coach handles the money and an admin adjusts credits with `manage_credits`. Ending active-member status after a refund is also manual. No automatic reversal of a PayPal refund or chargeback was specified.

### L26. Progress meter, current and next quarter

**Phase:** Phase 2  
**Ready:** Rules written

The profile progress block can show the current quarter or the next quarter. Small arrows sit on the left and right of the quarter label. The right arrow shows the next quarter. The left arrow returns to the current quarter. The arrow that has nowhere to go is disabled. A horizontal swipe moves between those same two quarters. No earlier quarter and no quarter past the next one.

The block opens on the current quarter. If no grant covers the current quarter and a grant covers the next quarter, it opens on the next quarter. Website purchases and staff grants both count. Running out of credits does not by itself switch quarters. If neither quarter has a grant, it stays on the current quarter and keeps today’s empty state.

The meter, attended count, remaining, reserved, and the expire line all follow the quarter on screen. Tapping the block still opens class history. Unlimited and “No classes this quarter” stay as they are in phase 1 for whichever quarter is showing.

### L54. Package name on the admin purchases table

**Phase:** Phase 2  
**Ready:** Rules written

The website admin panel’s Registered Athletes table shows the membership column as `pkg:9` after catalog checkout. That stored value stays `pkg:<id>`. Checkout and the credit grant parse that exact shape. This item does not write a different membership string.

The table looks up that package and shows its name and how many credits the purchase gave. The count is the grant created for that purchase, so a later edit to the package does not change an old row. Unlimited stays the word Unlimited. A row that is not `pkg:<id>`, including the older `8classes` values, keeps the stored text.

### L27. History export

**Phase:** Later phase  
**Ready:** Named only

Export the in-app class history as PDF or CSV. Phase 1 history is the on-screen list (purchases, staff adjustments, attended, missed, unused credits expired), filtered by current quarter, earlier quarters, or custom dates. Columns and filters for the file were not specified.

---

## Notifications and messaging

Phase 1 already posts class cancel, time, and location changes, and credit add, remove, and end, in that athlete’s private Notifications conversation. The athlete can read it and cannot reply. Message all is a separate group for one class date, and the people on the class can reply. `notifyCoachOnReserve` is stored on the class and does not send.

L29–L31 were pulled out of the phase 1 notification work. The lesson reserve, the coach flag, and the staff cancel already exist. They do not send. L28 is a different path: the member picks a coach, instead of replying in Notifications.

### L28. Message a coach on the class

**Phase:** Phase 2  
**Ready:** Rules written

A member messages one coach listed on that class. They pick the coach. That opens a normal conversation with that coach. The member does not need `manage_conversations`. The Notifications thread stays read-only. Replying inside Notifications is not the path.

The coach list is the same one as [L45](#l45-coaching-classes-on-the-coachs-calendar): the series coaches, unless that date has its own list. An empty coach list has no one to pick.

### L29. Lesson reserved notice

**Phase:** Later phase  
**Ready:** Rules written

One message in the athlete’s Notifications conversation when a lesson is reserved.

### L30. Notify coaches on reserve

**Phase:** Phase 2  
**Ready:** Rules written

When `notifyCoachOnReserve` is on, tell the coaches listed on that class that someone reserved. The flag is already stored. An empty coach list sends nothing.

### L31. Reservation canceled by staff

**Phase:** Phase 2  
**Ready:** Rules written

One message in that athlete’s Notifications conversation when staff cancel their reservation. Phase 1 already deletes the signup and returns the credit, including after the cancellation cutoff, and sends nothing.

### L32. Class reminders

**Phase:** Phase 3  
**Ready:** Named only

A reminder before class start. The example in the PRD is a push about 24 hours before. Lead time, which events send one, and what the member can turn off were not specified. See [L36](#l36-opt-out-of-class-messages).

### L33. Expiring package alerts

**Phase:** Phase 4  
**Ready:** Rules written

Notify the member with a push when a package is about to expire. Default is about 2 weeks before expiration. Timing should be configurable later.

### L34. Email and SMS

**Phase:** Phase 5  
**Ready:** Named only

The same notices can also go out by email and SMS. Phase 1 left comments in the messaging path and did not send either channel. Which notices use which channel, and how an address or phone number is chosen, were not specified.

### L35. Message retention

**Phase:** Phase 5  
**Ready:** Rules written

Delete old messages on a schedule. The phase 1 store was left so this does not need a rewrite. Nothing is deleted automatically yet.

- All class conversations (Message all, class-change threads, and any other class-scoped thread): delete after about 2 weeks.
- All other message types, including Notifications: delete after 6 months.

### L36. Opt-out of class messages

**Phase:** Later phase  
**Ready:** Named only

A member can opt out of class messages separately from general communications. No switch, default, or effect on staff “Message all” was specified.

---

## Calendars and cutover

### L37. Separate Google Calendar sync

**Phase:** Phase 3  
**Ready:** Rules written

One-way push from the class system to a **separate** Google Calendar. The public website calendar is never written. Moved out of the first build on 2026-11-21 (old task 5.1). Not built.

- The push runs when a class is created, edited, canceled, restored, or deleted. There is no scheduled job.
- A repeating class is one Google event per weekday and time. That event has no end date unless the class has one. A one-off class is a single event. Dates nobody edited are not stored as their own events.
- A moved, canceled, or otherwise edited date is its own event. A moved session stays that one event and changes day. Each Google event id is stored in a sync table.
- A canceled class stays on the sync calendar, with the title prefixed `Canceled:` . A deleted class is removed.
- Each event shows the title, date, start and end time, location, and training groups. Until [L1](#l1-per-weekday-location) ships, every weekday event uses the series location. After that, the event uses the weekday’s location when the weekday has one.
- Hidden classes are not copied. Only classes marked visible are synced.
- The calendar id and a service-account key path come from the environment (`GOOGLE_CLASS_SYNC_CALENDAR_ID`, `GOOGLE_CLASS_SYNC_CREDENTIALS`). If either is missing, the push is skipped and the class save still succeeds.
- Confirm the IANA timezone (gym local time) when this is built. That confirmation is still open.

Phase 1 staff keep maintaining the public Google Calendar by hand for non-beta members.

### L38. Personal calendar subscription

**Phase:** Later phase  
**Ready:** Rules written at the product level

A member can subscribe or resync a personal Apple or Google calendar with their reservations. Un-reserving removes the event from that calendar. Which account, how the feed is authorized, and what a series looks like on the phone were not specified past that.

### L39. Public calendar and Zen Planner retirement

**Phase:** Phase 5  
**Ready:** Rules written, communication still open

Full release. Zen Planner is retired for reservations. All members use in-app reservations, not only people with `reserve_classes`. The public website calendar is a candidate to read from this system instead of the hand-maintained Google Calendar.

Still open (PRD §16 #3 and #4): success metrics before that cutover, and the member message when Zen Planner is turned off.

[L37](#l37-separate-google-calendar-sync) is the separate test calendar. It is not this cutover.

---

## Staff tools

### L40. Audit log

**Phase:** Later Phase  
**Ready:** Named only

A record of staff credit and reservation actions. Phase 1 keeps history by inserting a new credit grant, and by deleting a signup when staff cancel it. There is no separate audit log. Which actions, who can read them, and how long they are kept were not specified.

### L41. Note or reason on staff actions

**Phase:** Later Phase  
**Ready:** Named only

Staff can attach an optional note to a credit add, remove, end, or a reservation cancel. Phase 1 has no reason field on those actions. Class-change notices already have an optional note, and that note is phase 1.

### L42. Attendance-based restrictions

**Phase:** Later Phase  
**Ready:** Named only

Named on the old Phase 2+ list. No rule was written.

### L43. Dynamic pricing

**Phase:** Not doing  
**Ready:** Named only

The old list named this and never defined it. It would have meant a price that changes with demand, how soon the class is, or who is booking. Phase 1 dollar price stays a fixed amount on the class.

### L44. Analytics

**Phase:** Later phase  
**Ready:** Named only

Named on the old Phase 2+ list. No reports, metrics, or audience were written. Success metrics for the Zen Planner cutover are the open question on [L39](#l39-public-calendar-and-zen-planner-retirement), not this item.

---

## Decisions that are not features

These stay open in PRD §16. They are listed here so a phase split does not drop them.

| Topic | What is still open | Related item |
| --- | --- | --- |
| Roster privacy | Members can see names and photos for now. Tighten to coaches only if gym culture changes. | — |
| Training group fallback | An athlete with no groups counts as Open / All Ages, and nothing is saved. Still open: derive a saved group from a purchase, or require an admin to set one. | — |
| Walk-in overdraft | Do not build a debt ledger until this is chosen. | [L16](#l16-overdraft-credits) |
| Automatic discount eligibility | How non-time-based discounts are verified, and whether they stack with manual codes. | [L23](#l23-automatic-discounts) |
| Calendar timezone | Confirm the IANA zone when the sync is built. | [L37](#l37-separate-google-calendar-sync) |
| Launch communication | What members are told when Zen Planner is turned off. | [L39](#l39-public-calendar-and-zen-planner-retirement) |
| Success metrics | What to measure before full release. | [L39](#l39-public-calendar-and-zen-planner-retirement) |
