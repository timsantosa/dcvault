# Class Reservation — MVP Wireframes

**Companion to:** [CLASS_RESERVATION_SYSTEM.md](./CLASS_RESERVATION_SYSTEM.md)  
**Audience:** Client design review (walkthrough)  
**Status:** Proposed UI for MVP / dark launch — not pixel-final  
**Last updated:** 2026-09-30  
**Aligned with PRD:** v1.3

This document is the screen-by-screen version of the PRD. It is meant to be walked through live: start at Flow A and follow the numbered taps. Engineering detail, data models, and later-phase features live in the PRD and are only mentioned here when they affect what someone sees on a phone. If this file and the PRD disagree, the **PRD is the source of truth**.

---

## How to use this in a client meeting

1. Start with **Who sees what** so it is clear this is a permission-gated dark launch, not an overnight cutover.
2. Walk **member flows first** (A–E). That is what most people will actually use.
3. Then walk **coach flows** (F–H) and **admin flows** (I–L). Those screens are hidden unless the person has the matching permission. Package catalog editing (Flow L) does not need to be in the first walkthrough.
4. End with **Not in MVP** so waitlists, in-app payment, pole pickers, subscriptions, and automatic discounts do not derail the review.

Wireframes follow the existing DC Vault app: Schedule tab header (messages / logo / more), expandable month + agenda list, red accent (`#bf2026`), and the same bottom tabs (Roster, Schedule, Profile, Convert, Journal). New screens reuse those patterns rather than introducing a separate admin app.

---



## Who sees what

Beta is per-user, using the existing permissions system. Non-beta members keep today’s Google Calendar Schedule tab and keep using Zen Planner.


| Permission            | Typical role               | What it unlocks                                                              |
| --------------------- | -------------------------- | ---------------------------------------------------------------------------- |
| `reserve_classes`     | Beta members               | New Schedule tab, reserve / cancel, credits on profile                       |
| `view_class_roster`   | Members + coaches (MVP)    | Names and photos on class detail                                             |
| `manage_attendance`   | Coaches                    | Check-in and walk-ins                                                        |
| `manage_classes`      | Coaches (optional) / admin | Create / edit / cancel / delete classes, cancel for someone else, edit the class-package catalog |
| `manage_credits`      | Admin (coaches optional)   | Add / remove credits on an athlete (each adjustment is its own history line) |
| `edit_training_group` | Admin (coaches optional)   | Training group field on **Edit Profile**                                     |


**Talking point:** Coaches do not automatically get every staff control. Check-in can be granted without class editing; credit adjustments can stay admin-only.

```
No reserve_classes          Has reserve_classes
┌─────────────────┐         ┌─────────────────┐
│ Today's Schedule│         │ New Schedule    │
│ (Google Cal)    │         │ + reserve/cancel│
│ Zen Planner     │         │ + credits       │
│ still used      │         │ Zen Planner     │
│                 │         │ unused for them │
└─────────────────┘         └─────────────────┘
```

---



## Screen map

```
MEMBER                          COACH                         ADMIN
Schedule tab ─────────┐         same Schedule +               same as coach +
  ├ Class detail      │           Create Class                Adjust Credits
  │   ├ Reserve       │           Check In                    Class packages
  │   └ Cancel        │           Message class               Edit Profile
  └ Upcoming list     │           Cancel for member             (training group)
Athlete profile ──────┘           Cancel / delete class
  ├ Progress / credits
  └ History
```

---



## Visual language (used on every class row)


| Marker                    | Meaning                                                 |
| ------------------------- | ------------------------------------------------------- |
| Colored left bar          | Class / group color (Open, Adult, Elite, Private, etc.) |
| `6/18`                    | Spots taken / capacity                                  |
| **Reserved**              | Selected athlete already has a spot                     |
| **Full**                  | Hard stop — no waitlist in MVP                          |
| **Not eligible** + reason | Visible, but Reserve is blocked                         |
| **View only**             | Meets, breaks, facility closed — not reservable         |
| **Canceled**              | Class still on the calendar; not reservable             |
| Check / miss on past rows | Selected athlete was checked in, or reserved and missed |


### Month-grid markers (not class-type color)

Class-type color stays on the **list rows**. The month grid uses a **different** signal so reserved days are obvious:

| Marker | Meaning                                              |
| ------ | ---------------------------------------------------- |
| `●`    | This athlete has a reservation that day              |
| `○`    | Classes exist that day; this athlete has not reserved |
| (none) | No classes                                           |

---



# Part 1 — Member screens

These are the screens a beta athlete (or a parent switching into that athlete) uses every week.

---



## Flow A — Open Schedule and reserve a class

**Who:** user with `reserve_classes`  
**Goal:** see this week, tap Reserve once, spend one credit.

### A1. Schedule tab (new)

Replaces the current Google Calendar view **only** for beta users. Same tab, same header, same expandable month.

There is **no Upcoming / Past toggle**. The agenda is one scrolling list. Past rows are dimmed. About the **past 2 weeks** load by default; older attendance lives under Profile → Class history.

```
┌─────────────────────────────────────┐
│ 9:41                           ▂▅▇  │
├─────────────────────────────────────┤
│  💬         SCHEDULE            ☰   │
├─────────────────────────────────────┤
│  Emma · Open / All Ages      [▾]    │
│  8 remaining · 3 reserved           │
│  4 expire Sep 30                    │
│                                     │
│            August 2026              │
│     S  M  T  W  T  F  S             │
│                    1  2             │
│     3  4  5  6  7  8  9             │
│    10 11 12 13 14 15 16             │
│    17 ○18 19 20 21 22 23            │
│    24 ●25 ○26 27 28 29 30           │
│           ▔                         │
│                                     │
│  TUESDAY, AUG 25                    │
│  ┌─ Open ───────────────────────┐   │
│  │ 4:00–6:00 PM           6/18  │   │
│  │ Open Vault                   │   │
│  │ DC Vault                     │   │
│  │ Bring a 14' pole for step 5  │   │
│  │              [ Reserve ]     │   │
│  └──────────────────────────────┘   │
│  ┌─ Elite ──────────────────────┐   │
│  │ 6:30–8:00 PM            2/8  │   │
│  │ Elite Development            │   │
│  │ Not eligible · Open group    │   │
│  └──────────────────────────────┘   │
│  ┌─ Meet (view only) ───────────┐   │
│  │ Sat 9:00 AM                  │   │
│  │ Summer Championship          │   │
│  │ View only                    │   │
│  └──────────────────────────────┘   │
│                                     │
│  👥      📅      ⬤      ↻      ✏    │
└─────────────────────────────────────┘
```

**What to point out**

- **Athlete chip** at the top is the currently selected AthleteProfile. Parents with two kids switch here (or via More → Switch Profile). Everything on this tab is for that athlete only.
- **Credits** always show (not only when low) and update as soon as you reserve or cancel. On reserve, the remaining and reserved numbers **animate** (count change / brief emphasis) so the spend is obvious:
  - **Remaining** = unused credits still available to book.
  - **Reserved** = upcoming spots already pulled for this athlete.
  - **Expiring** = how many of the remaining credits expire on the soonest date (`4 expire Sep 30`), not just the date.
- Month dots: `●` on the 25th because Emma is reserved that day; `○` on other practice days. Color of the row still means class type.
- Past classes stay in the same list, dimmed — no toggle.
- Ineligible classes stay on the list with a reason. We do not hide them.
- Meets and breaks show up so the week looks complete, but they are not reservable.
- **Reserve is one tap on the row.** No confirm sheet. The class flips to Reserved and the credit chip animates. Opening class detail is optional. Accidental reserves are undone with Cancel (that step still confirms).
- Tapping the row (not the button) still opens class detail.



### A2. Class detail (member)

```
┌─────────────────────────────────────┐
│ 9:41                           ▂▅▇  │
├─────────────────────────────────────┤
│  ←              Open Vault          │
├─────────────────────────────────────┤
│                                     │
│  Open Vault                         │
│  Tuesday, Aug 25                    │
│  4:00 PM – 6:00 PM                  │
│  DC Vault                           │
│                                     │
│  6 of 18 spots taken                │
│  ████████░░░░░░░░░░░░               │
│                                     │
│  Open / All Ages                    │
│  Cancel up to 24 hours before       │
│  start to keep your credit          │
│                                     │
│  Bring a 14' pole for step 5        │
│                                     │
│  ─────────────────────────────────  │
│  GOING (6)                    [>]   │
│  [JM] [ED] [AK] [+3]                │
│                                     │
│  ─────────────────────────────────  │
│  Note (optional)                    │
│  ┌─────────────────────────────┐    │
│  │ 14'7" 180                   │    │
│  └─────────────────────────────┘    │
│                                     │
│  8 remaining · 3 reserved           │
│  4 expire Sep 30                    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │         RESERVE             │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

**Roster:** names and photos show if the user has `view_class_roster` (planned default for members in MVP — confirmed OK for now). Tapping a person opens their existing athlete profile, with the same privacy rules as today. Without that permission, the member only sees the count (“6 of 18”).

### A3. One tap — reserved

Tapping **Reserve** on the schedule row (or on detail) **commits immediately**. There is no confirm sheet. The row flips to Reserved, the athlete appears on the roster, and the header chip animates the credit spend:

```
Before tap                         After tap
8 remaining · 3 reserved           7 remaining · 4 reserved
4 expire Sep 30                    4 expire Sep 30
        ↘  numbers tick / pulse  ↙
```

```
│  Emma · Open / All Ages      [▾]    │
│  8 remaining · 3 reserved           │  ← tick down / up
│  4 expire Sep 30                    │
```

Cancel cutoff still lives on class detail (“Cancel up to 24 hours before start”) so it is readable before they tap; it does not appear as a blocking confirm.

### A4. Same class, now reserved

```
│  ┌─ Open ───────────────────────┐   │
│  │ 4:00–6:00 PM           7/18  │   │
│  │ Open Vault                   │   │
│  │ DC Vault          Reserved   │   │
│  │              [ Cancel ]      │   │
│  └──────────────────────────────┘   │
```

Primary action on the row and on detail flips from Reserve to Cancel. The month grid marker for that day becomes `●`.

---



## Flow B — Cancel a reservation

**Who:** member with an upcoming reservation, before the cancellation cutoff. Cancel **does** use a confirm sheet (unlike Reserve).

### B1. Cancel sheet

```
┌─────────────────────────────────────┐
│                                     │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ┌─────────────────────────────┐    │
│  │ Cancel this class?          │    │
│  │                             │    │
│  │ Open Vault                  │    │
│  │ Tue Aug 25 · 4:00–6:00 PM   │    │
│  │                             │    │
│  │ Canceling now returns       │    │
│  │ 1 credit.                   │    │
│  │ 7 remaining → 8 remaining   │    │
│  │ 4 reserved → 3 reserved     │    │
│  │                             │    │
│  │  [ Keep it ]  [ Cancel     │    │
│  │                 class ]     │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```



### B2. Too late to cancel (after cutoff)

Reserve/Cancel is replaced with an explanation. The credit is already spent. There is no in-app “ask for an exception” button in MVP — staff restore a credit by hand if it is excused (Flow I). Cutoff is **a duration before start** (e.g. 24 hours before), not a clock time that day.

```
│  Cancellation closed 24 hours       │
│  before start.                      │
│  Credit has been used.              │
│  Ask a coach if this should be      │
│  excused.                           │
```

---



## Flow C — Blocked states (still visible)

The class is never silently missing. The member can open it and read why they cannot reserve.

### C1. Class is full

```
│  Open Vault                         │
│  18 of 18 spots taken               │
│  ████████████████████  FULL         │
│                                     │
│  ┌─────────────────────────────┐    │
│  │      Class is full          │    │
│  │      No waitlist            │    │
│  └─────────────────────────────┘    │
```

**Talking point:** MVP is a hard stop. Waitlist is a later phase.

### C2. Wrong group / age

```
│  Elite Development                  │
│  2 of 8 spots taken                 │
│                                     │
│  Emma is in Open / All Ages.        │
│  This class is Elite Development.   │
│                                     │
│  ┌─────────────────────────────┐    │
│  │     Not eligible            │    │
│  └─────────────────────────────┘    │
```



### C3. No usable credits

Schedule banner + class detail both point at website registration. In-app purchase is **not** MVP.

```
┌─────────────────────────────────────┐
│  💬         SCHEDULE            ☰   │
│                                     │
│  Emma · Open / All Ages      [▾]    │
│  ┌─────────────────────────────┐    │
│  │ 0 remaining · 0 reserved    │    │
│  │ Register on the website to  │    │
│  │ add classes for this period.│    │
│  │        [ Open website ]     │    │
│  └─────────────────────────────┘    │
│                                     │
│  Classes still list as usual,       │
│  with Reserve replaced by           │
│  “Register to reserve”.             │
└─────────────────────────────────────┘
```

Credits bought on the website show up here automatically. Staff no longer need to type that purchase into Zen Planner for beta users.

### C4. Cutoff passed / not yet started / display-only / canceled


| Situation                             | What the member sees                                      |
| ------------------------------------- | --------------------------------------------------------- |
| Reservation cutoff passed             | “Reservations closed 24 hours before start”               |
| Package start date is in the future   | “Credits start Oct 1 (next quarter)”                      |
| Meet / break / `isReservable = false` | “View only” — no Reserve button                           |
| Class canceled by staff               | “Canceled” — still on the calendar, not reservable        |
| Hidden class                          | Does not appear on the member schedule at all             |


---



## Flow D — Private lesson (pay at reserve, no card charge)

Private lessons use the same Schedule tab. There is **no request / wait / approve loop in MVP**. A lesson is a normal class configured with a dollar price, a small capacity, and notify-on-reserve. It does not spend group credits, and the website does not sell lesson packs.

Reserving a credit class is still one tap (Flow A). Reserving a **dollar** class asks the member to confirm the price, then saves the spot. MVP does not call PayPal. Staff are notified and send the invoice themselves.

### D1. Member sees a lesson slot

```
│  ┌─ Private ────────────────────┐   │
│  │ 5:00–5:45 PM            0/1  │   │
│  │ Private Lesson               │   │
│  │ Coach Ramirez                │   │
│  │ $45                          │   │
│  │           [ Reserve ]        │   │
│  └──────────────────────────────┘   │
```

### D2. Price confirm (no charge)

```
│  ┌─────────────────────────────┐    │
│  │ Reserve this lesson?        │    │
│  │                             │    │
│  │ Private Lesson · $45        │    │
│  │ Tue Aug 25 · 5:00–5:45 PM   │    │
│  │                             │    │
│  │ Your spot is saved. A coach │    │
│  │ will send the invoice.      │    │
│  │                             │    │
│  │  [ Back ]    [ Reserve ]    │    │
│  └─────────────────────────────┘    │
```

Optional note still exists on class detail (“Working 13' 7" this week”). To give the spot back, they Cancel — same confirm as Flow B. If the slot is already taken: **Full**.

---



## Flow E — Profile: remaining classes, progress, history

**Who:** the athlete (own profile) and anyone who can already view that profile.  
**Where:** existing Athlete Profile tab, new section below the current stats.

### E1. Profile additions

```
┌─────────────────────────────────────┐
│ 9:41                           ▂▅▇  │
├─────────────────────────────────────┤
│  💬                         ☰       │
│         [ profile photo ]           │
│         EMMA DUNNE                  │
│         #12  ·  PR 12'6"            │
│                                     │
│   Age    Height   Weight   Pole     │
│   16      5'7"     125    14' 155   │
│                                     │
│  ──────── WINTER QUARTER ─────────  │
│                                     │
│           8 left                    │
│        ╭──────────╮                 │
│       ╱   8 / 16   ╲                │
│      │    remaining  │              │
│       ╲  8 attended ╱               │
│        ╰──────────╯                 │
│                                     │
│  Open / All Ages                    │
│  8 remaining · 3 reserved           │
│  4 expire Sep 30                    │
│                                     │
│  [ Upcoming classes ]               │
│  [ Class history     ]              │
│                                     │
│  (existing medals, records, meets)  │
└─────────────────────────────────────┘
```

Semicircle is remaining vs total purchased for the **current** period. “Attended” means checked in, not merely reserved.

**Later (not MVP):** if they are out of this quarter but already bought next quarter, show next quarter’s meter; if they ran out and did not buy next quarter, keep `0 / N` for this quarter; if they have no package this quarter or next, hide the meter. Documented in the PRD so it is not lost.

Training group is **read-only** for the athlete. Staff change it on **Edit Profile** (Flow J), not a separate screen.

### E2. Upcoming classes (from profile)

A simple list of this athlete’s reservations — same cancel rules as the Schedule tab.

```
┌─────────────────────────────────────┐
│  ←        Upcoming classes          │
├─────────────────────────────────────┤
│  Tue Aug 25  4:00 PM                │
│  Open Vault              Reserved   │
│                                     │
│  Thu Aug 27  4:00 PM                │
│  Open Vault              Reserved   │
│                                     │
│  Tue Sep 2   5:00 PM                │
│  Private · Ramirez       Reserved   │
└─────────────────────────────────────┘
```



### E3. Class history

Filterable list of credit and attendance events for the selected athlete. Staff credit adjustments show as their **own lines** (they are new package records, not silent edits of the original purchase).

```
┌─────────────────────────────────────┐
│  ←         Class history            │
├─────────────────────────────────────┤
│  This period ▾                      │
│                                     │
│  Aug 25  Open Vault                 │
│          Attended                   │
│                                     │
│  Aug 20  Open Vault                 │
│          Missed (reserved, no       │
│          check-in)                  │
│                                     │
│  Aug 12  Makeup credit              │
│          +1 · exp Sep 30            │
│                                     │
│  Aug 1   Quarterly package          │
│          +16 credits · exp Sep 30   │
│                                     │
│  Jun 30  Unused credits expired     │
│          −2                         │
└─────────────────────────────────────┘
```

**Talking point:** PDF/CSV export is later. MVP is this in-app list.

### E4. Attendance marks on the Schedule (past)

Past rows sit in the same scrolling agenda, dimmed.

```
│  TUESDAY, AUG 25                    │
│  ┌──────────────────────────────┐   │
│  │ 4:00–6:00 PM                 │   │
│  │ Open Vault          Reserved │   │
│  └──────────────────────────────┘   │
│                                     │
│  THURSDAY, AUG 20   (dimmed)        │
│  ┌──────────────────────────────┐   │
│  │ 4:00–6:00 PM                 │   │
│  │ Open Vault           Attended│   │
│  └──────────────────────────────┘   │
│  TUESDAY, AUG 18    (dimmed)        │
│  ┌──────────────────────────────┐   │
│  │ 4:00–6:00 PM                 │   │
│  │ Open Vault             Missed│   │
│  └──────────────────────────────┘   │
```

---



## Flow E+ — Parent with two athletes

Switching AthleteProfile (existing More → Switch Profile, also the chip on Schedule) swaps **schedule, credits, reservations, and history** to that athlete. A parent never accidentally spends Kid B’s credit while looking at Kid A.

```
┌─────────────────────────────────────┐
│  Switch athlete                     │
│                                     │
│  ●  Emma Dunne                      │
│     Open / All Ages · 8 left        │
│                                     │
│  ○  Noah Dunne                      │
│     Fly Kids · 12 left              │
└─────────────────────────────────────┘
```

---



# Part 2 — Coach screens

Hidden unless the user has the matching permission. Coaches still use the same Schedule tab — extra actions appear in place.

---



## Flow F — Check in a class (personal phone)

**Permission:** `manage_attendance`  
**Goal:** fast tap-to-present on the coach’s own phone. No kiosk mode, no athlete self check-in in MVP.

### F1. Entry from class detail

On a class the coach can manage, detail gains a **Check in** button (and Create/Edit if they also have `manage_classes`).

```
┌─────────────────────────────────────┐
│  ←              Open Vault          │
├─────────────────────────────────────┤
│  Tuesday, Aug 25 · 4:00–6:00 PM     │
│  7 reserved · 2 checked in          │
│                                     │
│  ┌─────────────────────────────┐    │
│  │         CHECK IN            │    │
│  └─────────────────────────────┘    │
│                                     │
│  [ Edit class ]  [ Message all ]    │  ← manage_classes / messaging
│                                     │
│  GOING (7)                          │
│  ...roster...                       │
└─────────────────────────────────────┘
```



### F2. Check-in list (the main coach screen)

```
┌─────────────────────────────────────┐
│  ←     Check in · Open Vault        │
├─────────────────────────────────────┤
│  Tue Aug 25 · 4:00–6:00 PM          │
│  2 of 7 present                     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ + Walk-in                   │    │
│  └─────────────────────────────┘    │
│                                     │
│  RESERVED                           │
│  ┌─────────────────────────────┐    │
│  │ [ED] Emma Dunne             │    │
│  │      Open / All Ages        │    │
│  │                      [ ✓ ]  │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ [JM] Jordan Miles           │    │
│  │                      [ ✓ ]  │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ [AK] Aisha Khan             │    │
│  │                      [  ]   │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ [BL] Ben Lee                │    │
│  │                      [  ]   │    │
│  └─────────────────────────────┘    │
│                                     │
│  WALK-INS                           │
│  ┌─────────────────────────────┐    │
│  │ [CR] Chris Ruiz             │    │
│  │      added at 4:12 · 1 cr   │    │
│  │                      [ ✓ ]  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Interaction:** tap the row (or the checkbox) to mark present. Tap again to undo if they tapped the wrong person. Large targets, no extra confirm on the happy path.

Someone who reserved and is never checked in is a **no-show**. There is no separate “mark no-show” button — the credit was already taken at reserve time.

### F3. Walk-in

Athlete showed up without a reservation. Staff add them and deduct a credit.

```
┌─────────────────────────────────────┐
│  ←            Add walk-in           │
├─────────────────────────────────────┤
│  Search athletes                    │
│  ┌─────────────────────────────┐    │
│  │  ruiz                       │    │
│  └─────────────────────────────┘    │
│                                     │
│  Chris Ruiz                         │
│  Open / All Ages · 4 remaining      │
│                                     │
│  Maya Ruiz                          │
│  Fly Kids · 11 remaining            │
└─────────────────────────────────────┘

Then confirm:

│  ┌─────────────────────────────┐    │
│  │ Add Chris Ruiz to           │    │
│  │ Open Vault?                 │    │
│  │                             │    │
│  │ 1 credit will be deducted.  │    │
│  │ 4 remaining → 3 remaining   │    │
│  │                             │    │
│  │  [ Cancel ]     [ Add ]     │    │
│  └─────────────────────────────┘    │
```

If they have **zero credits**, it is **two steps in one flow** (not two disconnected screens). Staff with `manage_credits` add a credit first (that add is a **new history record**), then check them in. Staff without that permission are told to ask an admin.

Going negative so the next purchase pays it back is **not MVP** and **not decided** — parked as a possible Phase 2 item in the PRD so it is not lost.

```
│  Chris has 0 remaining.             │
│                                     │
│  Step 1 of 2                        │
│  [ Add 1 credit ]                   │  ← only if manage_credits
│                                     │
│  Then:                              │
│  [ Check in with that credit ]      │
│                                     │
│  or, without the perm:              │
│  An admin needs to add a credit     │
│  before you can sign them in.       │
```

---



## Flow G — Create and edit classes

**Permission:** `manage_classes`  
**Entry:** `+` on the Schedule header, or Edit on class detail.  
**Pattern:** bottom sheet / full-screen form, large controls, mobile-first. Not a desktop admin site.

### G1. Schedule tab with staff controls

```
┌─────────────────────────────────────┐
│  💬         SCHEDULE         +  ☰   │
│                                     │
│  Emma · Open / All Ages      [▾]    │
│  ...same member calendar...         │
│                                     │
│  Staff also see hidden classes      │
│  marked “Hidden from members”.      │
│  Canceled classes stay on the list  │
│  marked Canceled.                   │
└─────────────────────────────────────┘
```

Hidden classes appear for staff so they can edit them; members never see them.

### G2. Create class — main sheet

One form covers every current use case (open class, age-restricted, private, meet, break, event). There is no separate “class types” catalog in MVP. Staff fill in the properties.

```
┌─────────────────────────────────────┐
│  ←           New class              │
│                      [ Copy from ▾] │
├─────────────────────────────────────┤
│  Title                              │
│  ┌─────────────────────────────┐    │
│  │ Open Vault                  │    │
│  └─────────────────────────────┘    │
│                                     │
│  Date        Start       End        │
│  Aug 25      4:00 PM     6:00 PM    │
│                                     │
│  Location                           │
│  DC Vault                           │
│                                     │
│  Repeat                             │
│  Custom                      [▾]    │
│  Sun  11:30 AM – 1:00 PM            │
│  Tue   6:00 PM – 8:00 PM            │
│  Thu   7:00 PM – 8:30 PM            │
│  [ + Add day / time ]               │
│                                     │
│  Visible on member schedule  [ON]   │
│  Members can reserve         [ON]   │
│                                     │
│  Capacity                      18   │
│                                     │
│  Cost                               │
│  (•) Credits   ( ) Money   ( ) Both │
│  Credit cost                    1   │
│  Dollar cost               $____    │
│                                     │
│  Allowed groups                     │
│  [x] Open / All Ages                │
│  [x] Adult                          │
│  [ ] Elite Development              │
│  [ ] Fly Kids                       │
│                                     │
│  Age limits (optional)              │
│  Min ____   Max ____                │
│                                     │
│  Reserve until                      │
│  24 hours before start       [▾]    │
│  Cancel until                       │
│  24 hours before start       [▾]    │
│                                     │
│  Coaching staff                     │
│  [ + Add coach ]                    │
│  Ramirez, Chen                      │
│                                     │
│  Color                         Red  │
│                                     │
│  Note for athletes                  │
│  ┌─────────────────────────────┐    │
│  │ Bring a 14' pole for step 5 │    │
│  └─────────────────────────────┘    │
│                                     │
│  Notify coach on reserve     [OFF]  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │          SAVE CLASS         │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Copy from** duplicates settings from an existing class so weekly setup is not retyped.

**Custom repeat:** a series can be mixed days and times (Sunday 11:30, Tuesday 6 PM, Thursday 7 PM) instead of “every Tuesday only.” Simple weekly is still the default shortcut.

**Cutoffs** are **how long before start**, not “3:30 PM that day.” Same idea for reserve and cancel (often both 24 hours before).

**Cost** is credits, money, or both. Charging mechanics for dollar cost are a follow-up engineering session. The fields are here so staff can describe events and lessons correctly.

**Display-only** (meets, breaks): turn **Members can reserve** off. The item still shows on the schedule.

**Private lesson:** capacity 1 (or 2 for semi-private), notify-coach as needed, credit and/or dollar cost. **Requires approval is not on this MVP form** — the slot reserves immediately like any other class.

### G3. Edit this one vs the whole series

Saving a repeating class asks:

```
│  ┌─────────────────────────────┐    │
│  │ Save changes to             │    │
│  │                             │    │
│  │ ( ) This class only         │    │
│  │     Tue Aug 25              │    │
│  │                             │    │
│  │ ( ) Entire series           │    │
│  │     Sun / Tue / Thu         │    │
│  │                             │    │
│  │  Notify reserved athletes   │    │
│  │  [ON]                       │    │
│  │                             │    │
│  │  [ Cancel ]      [ Save ]   │    │
│  └─────────────────────────────┘    │
```

Staff can **save without notifying**. Bulk “update pole note on every week of the series” is **not** a separate MVP tool — series edit covers the whole series, single-instance edit covers one day.

### G4. Cancel a member’s reservation (staff)

On roster / class detail, staff with `manage_classes` can remove someone. This does **not** auto-restore the credit. If the cancel is excused, admin adds a credit in Flow I.

```
│  Emma Dunne                    ⋯    │
│                                     │
│  ⋯ menu:                            │
│  ┌─────────────────────────────┐    │
│  │ View profile                │    │
│  │ Cancel reservation          │    │
│  │ Adjust credits…             │    │  ← only if manage_credits
│  └─────────────────────────────┘    │

Then:

│  Cancel Emma’s reservation?         │
│  Her credit is not returned         │
│  automatically. Add a credit        │
│  separately if this is excused.     │
│                                     │
│  [ Back ]     [ Cancel for Emma ]   │
```

Emma gets a notification that her reservation changed.

### G5. Cancel class vs delete class

These are different. Canceling a **person** is G4. Canceling or deleting the **class itself**:

```
CANCEL CLASS (reversible)
┌─────────────────────────────────────┐
│  Cancel Open Vault?                 │
│                                     │
│  It stays on the calendar marked    │
│  Canceled. Members still see it.    │
│                                     │
│  ( ) This class only                │
│  ( ) Entire series                  │
│                                     │
│  Notify reserved athletes    [ON]   │
│  Optional message…                  │
│                                     │
│  [ Back ]     [ Cancel class ]      │
└─────────────────────────────────────┘

DELETE CLASS (permanent — extra confirm)
┌─────────────────────────────────────┐
│  Delete Open Vault?                 │
│                                     │
│  This removes it from the calendar. │
│  It cannot be undone.               │
│                                     │
│  ( ) This class only                │
│  ( ) Entire series                  │
│                                     │
│  Type DELETE to confirm             │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  Notify reserved athletes    [ON]   │
│                                     │
│  [ Back ]     [ Delete forever ]    │
└─────────────────────────────────────┘
```

---



## Flow H — Message the class

Uses the **existing messaging** system. Staff open class detail → **Message all**.

Class cancel / time / location changes use **this same path** (a class conversation), not a one-off alert that never appears in the inbox. Staff can still save those edits with notify **off**. Auto-delete is **not MVP**, but the rule is already decided: **all class conversations** (this thread included) after ~2 weeks; **all other message types** after 6 months.

```
│  ┌─────────────────────────────┐    │
│  │ Message Open Vault (7)      │    │
│  │                             │    │
│  │ Pit is running 20 min late. │    │
│  │ Start at 4:20.              │    │
│  │                             │    │
│  │         [ Send ]            │    │
│  └─────────────────────────────┘    │
```

Recipients are users with an athlete reserved on that class.

---



# Part 3 — Admin screens

Admin has every permission above, plus credit and training-group tools. Coaches only see these if those permissions are assigned to them personally.

---



## Flow I — Add or remove credits

**Permission:** `manage_credits`  
**Entry:** athlete profile (staff view) or class roster ⋯ menu.  
**MVP:** add/remove only. No cutoff override, no required reason field, no audit log UI. The member gets a notification.

Each add or remove is a **new package / credit record** so history stays honest. It does **not** silently rewrite the original quarterly purchase.

### I1. Staff actions on someone else’s profile

These sit with the existing staff buttons (View Contact, View Jumps, Edit Roles). Training group is **not** a separate button — it lives on Edit Profile (Flow J).

```
┌─────────────────────────────────────┐
│         EMMA DUNNE                  │
│         Open / All Ages             │
│         7 remaining · 4 expire Sep 30│
│                                     │
│  [ View Contact Info ]              │
│  [ View Athlete's Jumps ]           │
│  [ Edit User's Roles & Permissions] │
│  [ Edit Profile ]                   │  ← training group lives here
│  [ Adjust Credits ]                 │  ← manage_credits
└─────────────────────────────────────┘
```



### I2. Adjust credits sheet

```
┌─────────────────────────────────────┐
│  ←         Adjust credits           │
├─────────────────────────────────────┤
│  Emma Dunne                         │
│  7 remaining  ·  4 expire Sep 30    │
│                                     │
│  PACKAGES                           │
│  Quarterly · 7 of 16 left           │
│  expires Sep 30                     │
│                                     │
│  ┌──────────┐    ┌──────────┐       │
│  │  + Add   │    │ − Remove │       │
│  └──────────┘    └──────────┘       │
│                                     │
│  Amount                             │
│  ┌─────────────────────────────┐    │
│  │ 1                           │    │
│  └─────────────────────────────┘    │
│                                     │
│  This creates a new credit record   │
│  (history), not an edit of the      │
│  original package.                  │
│                                     │
│  Expiration                         │
│  End of current quarter      [▾]    │
│                                     │
│  Emma will get a notification.      │
│                                     │
│  ┌─────────────────────────────┐    │
│  │           SAVE              │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

Typical uses: excused late cancel, walk-in with no credits, goodwill makeup, fixing a website sync mistake.

### I3. End a package (unlimited, or the whole grant)

Add and remove still create a new history line. They cannot take an unlimited package away, because there is no count to subtract. **End package** sets that grant’s expiration to now and keeps the row.

```
│  Unlimited Classes                  │
│  through Nov 30                     │
│                                     │
│  [ End package ]                    │
│                                     │
│  Ends Emma’s unlimited package      │
│  today. The history line stays.     │
│  Classes she already reserved       │
│  stay reserved.                     │
│                                     │
│  [ Back ]          [ End package ]  │
```

Afterward the chip falls back to any finite credits she still has, or to 0. Staff who want to leave her a few classes end this grant, then add a finite one.

---



## Flow J — Training group on Edit Profile

**Permission:** `edit_training_group`  
**Not** editable by the athlete.  
**Not** a standalone screen — the field is on the existing **Edit Profile** form.

```
│  Edit profile · Emma Dunne          │
│                                     │
│  (existing name, bio, measurements) │
│                                     │
│  Training group                     │
│  ┌─────────────────────────────┐    │
│  │ Open / All Ages          ▾  │    │
│  └─────────────────────────────┘    │
│  Controls which classes Emma        │
│  is eligible for.                   │
│                                     │
│  [ Cancel ]              [ Save ]   │
```

Without `edit_training_group`, the field is hidden or read-only on that form.

---



## Flow K — Class canceled or moved (via class messages)

When staff save a destructive or member-visible change (class canceled, time changed, location changed), they get an optional message field and a **notify** toggle. Recipients: users with a reserved athlete on that class.

The notice is sent **through the class messaging system**, same as Flow H. Staff can save with notify **off**.

```
│  ┌─────────────────────────────┐    │
│  │ Time changed                │    │
│  │ 4:00 PM → 4:30 PM           │    │
│  │                             │    │
│  │ Notify reserved athletes    │    │
│  │ [ON]                        │    │
│  │                             │    │
│  │ Optional message            │    │
│  │ ┌───────────────────────┐   │    │
│  │ │ Thunder delay — still │   │    │
│  │ │ on for 4:30.          │   │    │
│  │ └───────────────────────┘   │    │
│  │                             │    │
│  │  [ Don’t save ]  [ Save ]   │    │
│  │                  [ Save &  │    │
│  │                    notify ] │    │
│  └─────────────────────────────┘    │
```

Member lock screen (whatever push the messaging system already sends):

```
│  ┌─────────────────────────────┐    │
│  │ DC Vault                    │    │
│  │ Open Vault moved to 4:30 PM │    │
│  │ Thunder delay — still on    │    │
│  │ for 4:30.                   │    │
│  └─────────────────────────────┘    │
```

Tapping opens that class detail **and** the class conversation. MVP does not add a second parallel push channel. No 24-hour class reminder in MVP. Message auto-delete is later: class conversations ~2 weeks, other messages 6 months.

---



## Flow L — Class packages

**Permission:** `manage_classes`  
**Where:** More → Administrator → Class packages. The website only reads the list.

Staff create the products registration can sell. The first nine (Fly-Kids, Adult, All Ages, including Unlimited) are seeded once. After that, this screen is how packages change.

```
│  ←           Class packages     +  │
│                                     │
│  ALL AGES                           │
│  4 Classes              $250    [>] │
│  8 Classes              $425    [>] │
│  15 Classes             $575    [>] │
│  Unlimited Classes      $825    [>] │
│                                     │
│  New package                        │
│  Name          8 Classes            │
│  Price         $425                 │
│  Group         All Ages          ▾  │
│  Credits       8                    │
│  Unlimited                     [OFF]│
│  Who can see it                     │
│  (•) Everyone                       │
│  ( ) Invite level  1 ▾              │
│  Show on website               [ON] │
│                                     │
│  [ Save ]                           │
```

The + in the header starts a new package. Tap a row to edit that package. Each group header has **Reorder**, which opens a drag sheet for that group only. Save rewrites the order inside the group. The groups themselves stay in a fixed order: Fly Kids, Adult, All Ages, then any other group alphabetically.

Turning **Show on website** off hides the package from registration and leaves credits already purchased. Invite level uses the same 1–5 codes as today. A hidden package stays off the form until someone enters a code of that level. The form says changes apply to future website sales; credits already purchased stay as they are.

---



# Part 4 — Website (member does not do this in the app)

MVP registration and payment stay on the **existing website**. A database flag chooses which package list checkout uses.

**Flag off (default):** today’s radios, including invite-only groups. No credits are created. Staff add credits by hand.

**Flag on:** the quarter picker stays. Class options come from the package catalog. Public packages show for everyone. A valid invite code reveals hidden packages of that invite level, and the code is still used up on purchase. PayPal, waivers, apparel, and facility stay. After payment, one credit grant appears on that athlete.

```
Website (catalog flag on)           App (new)
┌──────────────────────────┐         ┌──────────────────────────┐
│ Choose quarter           │         │ Emma · 16 remaining      │
│ Choose catalog package   │  ──►    │ 0 reserved               │
│ Invite code if needed    │  sync   │ 16 expire Sep 30         │
│ Sign waivers · PayPal    │         │ Reserve is enabled       │
└──────────────────────────┘         └──────────────────────────┘
```

People who already paid before the flag is turned on do not get grants automatically.

If they buy **next quarter early**, those credits have a start date. The app shows them as “starts Oct 1” and will not spend them on this quarter’s classes.

Admins with `manage_classes` edit the catalog in the app (name, price, who it’s for, class count or unlimited, public or invite-only). Turning a package off hides it here and leaves credits people already bought.

---



# Part 5 — What non-beta users still see

No new chrome, no disabled Reserve button, no “you don’t have access” empty state.

```
┌─────────────────────────────────────┐
│  💬         SCHEDULE            ☰   │
├─────────────────────────────────────┤
│            August 2026              │
│     (existing Google Calendar)      │
│                                     │
│  TUESDAY, AUG 25                    │
│  4:00–6:00 PM                       │
│  Open Vault                         │
│  DC Vault                           │
│                                     │
│  Tap → today’s event modal          │
│  (title, time, location, notes)     │
│  No Reserve.                        │
└─────────────────────────────────────┘
```

They keep reserving in Zen Planner until they are granted `reserve_classes`.

---



## Staff notification summary (MVP)


| Event                                    | Who is notified            | How                                      |
| ---------------------------------------- | -------------------------- | ---------------------------------------- |
| Class canceled / time / location changed | Members with a reservation | Class conversation (unless notify is off)|
| Staff message the class                  | Reserved roster            | Class conversation                       |
| Staff cancel a reservation               | That member                | Existing notify pattern                  |
| Staff add or remove credits              | That member                | Existing notify pattern                  |


---



## Not in this MVP (say this out loud)

Call these out so the review stays on launch scope:

- Waitlist when a class is full
- Athlete self check-in or a front-desk tablet mode
- In-app package purchase, waivers, or discount codes
- **Automatic discounts** (early bird with a configurable time window, military, etc.) — still manual codes on the website for now
- **Auto-renewing memberships** — admin configures the cadence; customer signs up and can cancel anytime
- **Weekly-allotment packages** (e.g. 3 classes per week for the quarter; unused classes vanish that week) — MVP is total classes per period
- **Package expiration push** (~2 weeks before a package runs out)
- Private lesson request / approve (lessons reserve immediately after a price confirm)
- Charging a card when reserving a lesson (MVP shows the price; a coach sends the invoice)
- Lesson packs sold on the website registration form
- Structured pole picker (free-text note only)
- Bulk “reserve every Tuesday”
- Admin override of cutoffs / eligibility (workaround: add a credit)
- Negative credits / walk-in overdraft paid back on next purchase (**parked — not decided**)
- Refunds in-app (coach handles money; admin adjusts credits)
- Email / SMS / 24-hour class reminders
- Auto-delete of messages (class conversations ~2 weeks; other types 6 months)
- Personal Apple/Google calendar subscription
- Progress meter flipping to next quarter when this quarter is empty
- Replacing the public website calendar or turning off Zen Planner for everyone

---



## Suggested walkthrough order (15–20 min)


| Min   | Show                                            | Ask them                                                            |
| ----- | ----------------------------------------------- | ------------------------------------------------------------------- |
| 1–2   | Who sees what / dark launch                     | Confirm beta is permission-based, Zen Planner stays                 |
| 2–6   | Flow A + B — reserve and cancel                 | Confirm one-tap Reserve + credit animation; cancel still confirms   |
| 6–8   | Flow C — full / ineligible / no credits         | Confirm classes stay visible with a reason                          |
| 8–9   | Flow D — private lesson price confirm       | Confirm no approval loop and no card charge        |
| 9–12  | Flow E — profile meter + history                | Confirm “attended” = checked in                                     |
| 12–15 | Flow F — check-in + walk-in                     | Confirm tap-to-present; two-step grant+check-in when at zero        |
| 15–17 | Flow G — create class sheet                     | Confirm custom series, relative cutoffs, cancel vs delete           |
| 17–18 | Flow H + K — class messages, silent save        | Confirm notify toggle and inbox (not a one-off alert)               |
| 18–20 | Flow I + J — credits as new records + profile   | Confirm coaches may or may not get these                            |
| last  | Not in MVP                                      | Park waitlist, subscriptions, auto discounts, weekly packages       |


---



## Decisions already captured (from client review)

These used to be open UI questions. They are now in the PRD as well.

1. **Agenda:** single scrolling list, past dimmed, load about 2 weeks of past. No Upcoming / Past toggle.
2. **Roster for all members:** OK for now.
3. **Reserve is one tap on the schedule row** for credit classes (no confirm sheet). Credit chip animates remaining / reserved. Opening detail is optional. Cancel still confirms. Dollar-cost classes confirm the price and do not charge a card.
4. **Walk-in with zero credits:** two steps, one flow (add credit, then check in).
5. **Private lessons:** no approval system for MVP. They are a dollar-priced class. The member confirms the price; staff invoice outside the app.
6. **Header credit chip:** always visible; updates on reserve; remaining, reserved, and how many expire on the soonest date. A spendable unlimited grant shows `Unlimited` instead of a count.
7. **Calendar markers:** reserved vs unreserved days are a separate indicator from class-type color.
8. **Cutoffs:** duration before start (e.g. 24 hours before), not a clock time that day.
9. **Training group:** field on Edit Profile, not its own flow.
10. **Credit adjustments:** new record for history, not a silent edit of the original package. Ending a package (including unlimited) sets that grant’s expiration and keeps the row.
11. **Cancel vs delete class:** cancel stays on the calendar and is reversible; delete is permanent and confirmed (this one vs series).
12. **Class changes:** class messaging, with option to save without notifying.
13. **Weekly-allotment (later):** unused classes vanish at week’s end (use-it-or-lose-it).
14. **Subscriptions (later):** admin sets the cadence; customer signs up and can cancel anytime.
15. **Early bird (later):** configurable duration, not a hardcoded window.
16. **Message auto-delete (later):** all class conversations ~2 weeks; all other message types 6 months.
