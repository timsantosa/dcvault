# Class Reservation — Phase 2 tasks

**Status:** Ready to build, in the order below.  
**Last updated:** 2026-11-24  
**Product rules:** [CLASS_RESERVATION_LATER_PHASES.md](./CLASS_RESERVATION_LATER_PHASES.md) — the L item is the rule. If this file and that item disagree, that item wins, then fix this file.  
**Dark launch:** [CLASS_RESERVATION_SYSTEM.md](./CLASS_RESERVATION_SYSTEM.md) — §18 is complete. Do not reopen it.  
**Screens:** [CLASS_RESERVATION_WIREFRAMES.md](./CLASS_RESERVATION_WIREFRAMES.md)  
**Credits:** [CREDIT_INVENTORY.md](./CREDIT_INVENTORY.md)

Phase 2 is the fourteen items whose **Phase** line is `Phase 2`. Each one is a session in this file, including L46. The skill `next-class-reservation-task` takes the first `[ ]` item, or the L id you name.

Work in order. Check off a task by changing `[ ]` to `[x]` and adding a completion note (date and what shipped). Update the L item and the wireframes when the behavior that shipped is different from what they say.

Phase 3 and later, `Later phase`, `unassigned`, and `Not doing` stay in the later-phases doc. They are not tasks here. L29 (lesson reserved notice) sits beside L30 and L31 in that doc and is **Later phase**, so it is not in this list.

---

## What is in Phase 2

| Order | Item | Ready | One session does |
| --- | --- | --- | --- |
| 1 | [L1](#l1--per-weekday-location) | Rules written | Each weekday can have its own location and address |
| 2 | [L47](#l47--schedule-window-follows-the-calendar) | Rules written | The calendar can move months beyond the current window |
| 3 | [L48](#l48--weekday-rows-start-on-the-series-start-day) | Rules written | Weekday rows and Add weekday follow the series start day |
| 4 | [L49](#l49--class-description-on-the-schedule) | Rules written | Agenda row shows the class description, two lines |
| 5 | [L51](#l51--dates-on-upcoming-classes) | Rules written | Upcoming classes shows the weekday and date |
| 6 | [L50](#l50--quarter-label-on-each-class) | Rules written | Agenda and class detail name the quarter of that date |
| 7 | [L53](#l53--show-the-reservation-note) | Rules written | Class detail and the attendees list show a saved note |
| 8 | [L52](#l52--credit-chip-for-one-quarter) | Rules written | Chip counts are for one quarter |
| 9 | [L26](#l26--progress-meter-current-and-next-quarter) | Rules written | Profile meter moves between this quarter and the next |
| 10 | [L31](#l31--reservation-canceled-by-staff) | Rules written | Staff cancel posts one Notifications message |
| 11 | [L30](#l30--notify-coaches-on-reserve) | Rules written, one question | Coaches are told when the flag is on |
| 12 | [L28](#l28--message-a-coach-on-the-class) | Rules written | Member picks a coach and opens a normal conversation |
| 13 | [L54](#l54--package-name-on-the-admin-purchases-table) | Rules written | Registered Athletes shows the package name and grant size |
| 14 | [L46](#l46--website-class-calendar) | Named only | Work through the website editor layout, then build |

L1 and L47 are first. They are the two changes needed now: a weekday can have its own place, and the calendar can move to a class months ahead. L52 still scopes the chip to the selected day's quarter. Until L52, a month outside today's quarter keeps the phase 1 chip. L46 is last. The skill picks it up, and that session settles the editor layout with the user before anything is built.

---

## Tasks

### L1 — Per-weekday location

- [ ] **L1 — Per-weekday location**
  - Rule: [L1](./CLASS_RESERVATION_LATER_PHASES.md#l1-per-weekday-location). Screen: Flow G.
  - A series can give each weekday its own location and address, the same way it already gives each weekday its own start and end. A weekday left blank keeps the series location. Changing one date still overrides that date and does not rewrite the weekday.
  - A location change on a weekday uses the existing class-change notice for upcoming reservations on that weekday.
  - A single date can already be edited to a different place. This task adds the standing weekday location.
  - Unit-test how a date resolves its place: the weekday location, a blank weekday falling back to the series, and a single-date override winning.
  - Out of scope: Google Calendar sync (L37). Nothing pushes the weekday location to a calendar in this task. The next task is L47.

### L47 — Schedule window follows the calendar

- [ ] **L47 — Schedule window follows the calendar**
  - Rule: [L47](./CLASS_RESERVATION_LATER_PHASES.md#l47-schedule-window-follows-the-calendar). Screen: Flow A. Phase 1’s “about 11 weeks ahead” sentence in that flow is what this task replaces.
  - Anyone on the app calendar can move to a class five or six months out. The app keeps loaded classes in memory and asks for more as the person moves.
  - A fetch never leaves a month half loaded. If the range touches a month, that whole month is included before the month grid shows it.
  - Ask for about 60 days of new classes, then extend both ends to the first and last day of the months that span covers. A request still cannot be longer than 92 days. Three whole months fit. A longer span is more than one request, and the grid waits until each of those months is complete.
  - The loaded set is the union of those fetches. Moving near either end fetches the next chunk in that direction and adds it. Months already loaded stay.
  - Choosing a date outside the loaded set fetches around that date: 14 days before it and about 60 days after it, then out to whole months. It does not first load every month between today and that date.
  - Moving into a gap between two loaded stretches fetches those missing months. A refresh uses the calendar’s selected date when that date is not today, and loads the window around that date.
  - Attendance older than the loaded window stays on class history.
  - Put the range rules in one pure function and unit-test them: whole months, the 92-day cap, a jump that does not fill the months in between, a gap, and a refresh around the selected date. The schedule screen calls that function. The class list already rejects a range longer than 92 days.
  - This is the largest ready task. If it does not fit one session, stop and name the smallest slice that is still manually testable. Do not start a later task in its place.
  - Out of scope: the quarter chip (L52), the website calendar (L46), the public Google Calendar (L37, L39), and class history.

### L48 — Weekday rows start on the series start day

- [ ] **L48 — Weekday rows start on the series start day**
  - Rule: [L48](./CLASS_RESERVATION_LATER_PHASES.md#l48-weekday-rows-start-on-the-series-start-day). Screen: Flow G.
  - On a new repeating class, the day rows and the weekday picker start on the weekday of the series start date, then the rest of the week, wrapping after Saturday. Wednesday starts Wednesday, not Sunday. Add weekday picks the next free day in that same order.
  - Changing the series start date does not move days already chosen. The picker order follows the new start date. Saved weekday numbers stay as they are. Sunday is still 0.
  - Unit-test the order. The form already has a first row set to the selected date’s weekday; this task changes the picker and Add weekday, and stops the rows sorting back to Sunday-first.
  - Out of scope: weekday locations (L1), and the next task.

### L49 — Class description on the schedule

- [ ] **L49 — Class description on the schedule**
  - Rule: [L49](./CLASS_RESERVATION_LATER_PHASES.md#l49-class-description-on-the-schedule). Screen: Flow A.
  - The agenda row shows the class description, truncated to two lines. The class detail screen keeps the full description. No description adds no line.
  - This is the class description. The row already shows the class note when one is set. Both can show. The month grid stays dots only.
  - Out of scope: the reservation note (L53), and the next task.

### L51 — Dates on Upcoming classes

- [ ] **L51 — Dates on Upcoming classes**
  - Rule: [L51](./CLASS_RESERVATION_LATER_PHASES.md#l51-dates-on-upcoming-classes). Screen: Flow E2. The L item wins over the E2 sketch, which shows a shorter date.
  - Each Upcoming classes row shows the weekday and date above the time, in the same form as the schedule’s day headers (`Tuesday, Dec 2`). The date is the class date. Several classes on one day each show that date.
  - The schedule list already groups rows under those headers. This task does not add those headers there.
  - Out of scope: the quarter label (L50), and the next task.

### L50 — Quarter label on each class

- [ ] **L50 — Quarter label on each class**
  - Rule: [L50](./CLASS_RESERVATION_LATER_PHASES.md#l50-quarter-label-on-each-class). Screens: Flow A agenda and class detail.
  - The agenda row and the class detail screen name the quarter that class date falls in. Seasons stay the fixed phase 1 dates: winter Dec–Feb, spring Mar–May, summer Jun–Aug, fall Sep–Nov. The label is the season and the year that season starts, such as `Fall 2026` or `Winter 2026` (Dec 2026 through Feb 2027).
  - The quarter comes from the class date, not from the athlete’s package. Two classes on the same day share a label. The month grid does not add the label.
  - Unit-test the label for a date, including a December date whose winter runs into the next calendar year. Use the existing season helper. Do not add a second clock, and do not make the dates configurable (that is L21, Phase 5).
  - Out of scope: the chip text (L52), and the next task.

### L53 — Show the reservation note

- [ ] **L53 — Show the reservation note**
  - Rule: [L53](./CLASS_RESERVATION_LATER_PHASES.md#l53-show-the-reservation-note). Screens: class detail, and the attendees list.
  - On class detail, the selected athlete’s reservation note shows as text when that class is already reserved and the note is not empty. It is not an editor. The class note stays the class note.
  - The attendees list shows that same note under the athlete’s name when it is not empty. Anyone who can open that list can read it. It is not editable there.
  - The note is already stored on the signup. Phase 1 does not put it on the schedule payload. This task adds it there, or on the attendees payload, only as far as those two screens need it.
  - Before reserve, the optional note field stays editable. An empty note adds no line.
  - Out of scope: editing the note after reserve (L5, Phase 4), bulk notes (L9), and the next task.

### L52 — Credit chip for one quarter

- [ ] **L52 — Credit chip for one quarter**
  - Rule: [L52](./CLASS_RESERVATION_LATER_PHASES.md#l52-credit-chip-for-one-quarter). Screens: schedule chip, class detail chip, cancel preview, Upcoming classes. Credits: [CREDIT_INVENTORY.md](./CREDIT_INVENTORY.md).
  - The chip’s remaining count and reserved count are for one quarter. Remaining is the unused balance of grants that cover that quarter. Reserved is upcoming reservations whose class date falls in that quarter. The expiring line counts only credits inside that same quarter. Unlimited for that quarter stays `Unlimited · N reserved`, then the quarter name.
  - The quarter on the schedule and on Upcoming classes is the quarter of the day selected on the calendar. Moving to a day in another quarter switches the chip. Class detail uses the quarter of that class date. The chip names the quarter after the counts: `7 remaining · 8 reserved · Winter 2026`. The words `remaining` and `reserved` stay where they are.
  - Website purchases and staff grants both count. A winter reservation is not counted on a fall chip.
  - Unit-test the quarter filter: remaining, reserved, expiring, and unlimited. One function. The schedule, class detail, cancel preview, and Upcoming classes all use its text.
  - Out of scope: the profile meter (L26), configurable season dates (L21), and the next task.

### L26 — Progress meter, current and next quarter

- [ ] **L26 — Progress meter, current and next quarter**
  - Rule: [L26](./CLASS_RESERVATION_LATER_PHASES.md#l26-progress-meter-current-and-next-quarter). Screen: Flow E1.
  - Small arrows sit on the left and right of the quarter label. The right arrow shows the next quarter. The left arrow returns to the current quarter. The arrow that has nowhere to go is disabled. A horizontal swipe moves between those same two quarters. No earlier quarter, and no quarter past the next one.
  - The block opens on the current quarter. If no grant covers the current quarter and a grant covers the next quarter, it opens on the next quarter. Running out of credits does not by itself switch quarters. If neither quarter has a grant, it stays on the current quarter and keeps today’s empty state.
  - The meter, attended count, remaining, reserved, and the expire line all follow the quarter on screen. Remaining and reserved use the L52 quarter balance. Tapping the block still opens class history. Unlimited and “No classes this quarter” stay as they are for whichever quarter is showing.
  - Unit-test which quarter opens, and which arrow is disabled. Do not add a third quarter.
  - Out of scope: class history’s existing quarter filter, and the next task.

### L31 — Reservation canceled by staff

- [ ] **L31 — Reservation canceled by staff**
  - Rule: [L31](./CLASS_RESERVATION_LATER_PHASES.md#l31-reservation-canceled-by-staff). Screens: Flow K, and staff cancel on the attendees row.
  - One message in that athlete’s Notifications conversation when staff cancel their reservation. Phase 1 already deletes the signup and returns the credit, including after the cancellation cutoff, and sends nothing.
  - Use the same Notifications thread as the class-change and credit notices. The athlete can read it and cannot reply. A member cancel does not send this message.
  - Out of scope: L29 (lesson reserved notice, Later phase), L30, email and SMS (L34), and the next task.

### L30 — Notify coaches on reserve

- [ ] **L30 — Notify coaches on reserve**
  - Rule: [L30](./CLASS_RESERVATION_LATER_PHASES.md#l30-notify-coaches-on-reserve). The flag is already on the class form (Flow G) and is stored. It does not send.
  - When `notifyCoachOnReserve` is on, tell the coaches listed on that class that someone reserved. The coach list is the series coaches, unless that date has its own list. An empty coach list sends nothing.
  - **Ask once before planning.** L30 says to tell the coaches and does not say which thread. Do not invent a channel. The question is whether each coach gets one message in their own Notifications conversation (the same private thread the other automated notices use) or somewhere else. Wait for the answer.
  - Out of scope: the member picking a coach (L28), the lesson-reserved notice (L29), and the next task.

### L28 — Message a coach on the class

- [ ] **L28 — Message a coach on the class**
  - Rule: [L28](./CLASS_RESERVATION_LATER_PHASES.md#l28-message-a-coach-on-the-class). Screen: Flow K names this as later; the L item is the rule.
  - A member messages one coach listed on that class. They pick the coach. That opens a normal conversation with that coach. The member does not need `manage_conversations`. The Notifications thread stays read-only.
  - The coach list is the series coaches, unless that date has its own list. An empty coach list has no one to pick.
  - Reuse the existing conversation. Do not add a messaging system.
  - Out of scope: L30’s automatic notice, replying inside Notifications, and the next task.

### L54 — Package name on the admin purchases table

- [ ] **L54 — Package name on the admin purchases table**
  - Rule: [L54](./CLASS_RESERVATION_LATER_PHASES.md#l54-package-name-on-the-admin-purchases-table). No member screen. Credits: [CREDIT_INVENTORY.md](./CREDIT_INVENTORY.md) §5. The stored `membership` value is `pkg:<id>`.
  - The website admin panel’s Registered Athletes table shows the package name and how many credits the purchase gave. The count is the grant created for that purchase, so a later edit to the package does not change an old row. Unlimited stays the word Unlimited.
  - The stored value stays `pkg:<id>`. Checkout and the credit grant keep parsing that exact shape. A row that is not `pkg:<id>`, including the older `8classes` values, keeps the stored text.
  - Unit-test the label: package name plus that grant’s count, Unlimited, a missing package, and a non-`pkg:` value left as stored.
  - Out of scope: writing a different membership string, the app, and the next task.

### L46 — Website class calendar

- [ ] **L46 — Website class calendar**
  - Rule: [L46](./CLASS_RESERVATION_LATER_PHASES.md#l46-website-class-calendar). This is the last phase 2 task. Pick it up when it is the first unchecked item, or when the user names it.
  - Coaches need to build classes on the website. The page is a calendar in the style of Google Calendar, and staff add a class from that calendar. It reads and writes the same classes as the app. It does not replace the public Google Calendar (L39).
  - The website has no app-style permission checks. Limit the page to `isAdmin` until the app permissions are on the website token. Do not build a website permission system for this page.
  - The editor layout is not written. The first work of this task is to settle that layout with the user. Ask how the calendar and the editor should look. The app class sheet is the source for what a class can store. Do not invent the form, and do not plan or build until the user has agreed to the layout.
  - Write the agreed layout into L46 and the wireframes. If the calendar is too big for the rest of that session, leave this task unchecked, note the layout, and build from it on the next session. Split extra sessions into this file only after the layout is agreed.
  - Out of scope: the public Google Calendar (L37, L39), a website permission system, and every item in "Not in this list".

---

## Not in this list

These are in the later-phases doc and are not Phase 2 work:

- Phase 3: L11, L17, L18, L32, L37
- Phase 4: L4, L5, L6, L7, L8, L22, L33
- Phase 5: L20, L21, L34, L35, L39
- Later phase, still unscheduled: L10, L13, L14, L16, L19, L23, L24, L25, L27, L29, L36, L38, L40, L41, L42, L44, L45
- Unassigned: L9, L12
- Not doing: L2, L3, L15, L43
