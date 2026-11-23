# Class reservation beta checklist

Manual pass for the dark launch. Beta is a permission. Zen Planner stays in use for everyone else. Screen detail is in [CLASS_RESERVATION_WIREFRAMES.md](./CLASS_RESERVATION_WIREFRAMES.md). This list is the walk, not a second spec.

Do not file these as bugs:

- An athlete with no training group counts as Open / All Ages. Nothing is saved on the profile.
- A dollar class confirms the price and is not charged. Staff invoice outside the app.
- The Notifications thread is read-only. The athlete cannot reply.
- Staff cancel of one reservation returns the credit and sends no message.
- `notifyCoachOnReserve` is stored and does not send.
- Website grants exist only when `useClassPackageCatalog` is on. Old purchases are not backfilled. The flag is the `registrationSettings` row (`id = 1`). There is no screen for it.

## Before you start

- [ ] [server/db/migrations/class-reservation.sql](../server/db/migrations/class-reservation.sql) has been applied once on this database. — New tables exist, and `conversations.noticesForAthleteProfileId` exists.
- [ ] From `dcvault/`, `node server/db/seedTrainingGroups.js` and `node server/db/seedClassPackages.js` have each been run once. — Four training groups, nine public packages, and the settings row. A second run does not change prices or the catalog flag.
- [ ] `registrationSettings.useClassPackageCatalog` is still false unless you are on the website step below. — Registration keeps today’s package radios and writes no credit grant.

## Grant `reserve_classes`

Permissions sit on roles. The person granting them needs `manage_roles` (Admin has it). Admin already has every class permission, including `reserve_classes`. Base has `view_class_roster` and does not have `reserve_classes`. Do not add `reserve_classes` to Base.

- [ ] More → Administrator → Manage Roles → Edit → add a role, for example Class beta. — The new role appears in the list.
- [ ] Open that role → Edit → add **Reserve Classes**. — Base is unchanged.
- [ ] On each test user’s profile, **Edit User's Roles & Permissions** → Edit → add Class beta. — The role is listed on that user.
- [ ] For a staff tester, add Class beta and only the extra permissions that person needs: **Manage Classes**, **Manage Credits**, **Manage Attendance**, **Edit Training Group**. — A check-in coach does not have to be able to edit classes or credits. Without Class beta, Schedule stays the Google Calendar and the staff steps below cannot start.
- [ ] Each tester signs out and back in. — The Schedule tab picks up the new permission.

## Coexistence

- [ ] Sign in as someone **without** `reserve_classes` and open Schedule. — The tab is the existing Google Calendar. There is no Reserve button and no “you don’t have access” empty state.
- [ ] That same person still reserves in Zen Planner the way they do today. — The app did not replace Zen Planner for them.
- [ ] Sign in as a Class beta user and open Schedule. — The tab is the class schedule: athlete name, credit chip, month grid, and a scrolling list of classes.
- [ ] An admin, who already has the permission, also sees the class schedule. — No extra grant is required for Admin.

## Flow A — Reserve

- [ ] Scroll the agenda. — One list, no Upcoming / Past toggle. Past rows are dimmed. About two weeks of past classes are loaded.
- [ ] Look at the month grid. — An open ring is a class this athlete has not reserved. A filled dot is a reservation. The color matches the row’s left bar, not a separate reserved/unreserved palette.
- [ ] Read the chip. — It shows remaining, reserved, and how many expire on the soonest date (for example `4 expire Sep 30`). It is visible even when credits are not low.
- [ ] Tap **Reserve** on a credit class, including a free one. — One tap, no confirm sheet. The row flips to Reserved, spots go up by one, and the chip pulses (remaining down, reserved up).
- [ ] Open class detail and type an optional note, then reserve from there if you have not already. — The note is saved. The row’s Reserve button sends no note.
- [ ] Open **Upcoming classes** from the profile. — This athlete’s reserved sessions in the loaded window are listed.
- [ ] Switch athlete with the name on the schedule, or More → Switch Profile, when the account has two profiles. — Chip, reservations, eligibility, and Upcoming classes follow the selected profile.

## Flow B — Cancel

- [ ] Tap **Cancel** before the cutoff. — A confirm sheet names the class and the credits coming back. **Keep it** leaves the reservation. **Cancel class** removes it and the chip moves back.
- [ ] After the cancellation cutoff, look at the row and at class detail. — Cancel is gone. The screen says cancellation is closed, and the chip still counts the reservation.
- [ ] A cutoff of 0 minutes says **Cancellation closed at start**.

## Flow C — Blocked, still visible

- [ ] Fill a class to capacity. — The row stays visible and says **Class is full**. Reserve is not offered.
- [ ] Open a class whose groups or ages exclude this athlete. — The row stays visible, labeled **Not eligible**, and the reason names the athlete’s groups and the class’s groups, or the age. Reserve returns the same reason.
- [ ] Leave an athlete with no groups and open an Open / All Ages class, then an Elite class. — The Open class can be reserved. The Elite class says Not eligible. The profile still shows no groups.
- [ ] Open a class this athlete already reserved, then change their group so they would no longer qualify. — The reservation stays, and Cancel still shows.
- [ ] With no usable credits, open Schedule. — The chip says to register on the website. Rows say **Register to reserve**.
- [ ] Open a class after its reservation cutoff, one whose credits start later, and one whose credits expire before that date. — The reasons are reservations closed, credits that start later, and credits that expire before the class.
- [ ] Open a view-only class (meet, break, or members cannot reserve) and a canceled class. — They say **View only** and **Canceled**. Both stay on the calendar.
- [ ] As a member, look for a class marked hidden. — It is not on the schedule.

## Flow D — Dollar class

- [ ] Tap **Reserve** on a class with a dollar price and a credit cost of 0. — A confirm sheet shows the price and says a coach will send the invoice. **Reserve** saves the spot. Nothing is charged. Group credits do not drop.
- [ ] Cancel that spot before the cutoff. — The same cancel confirm as Flow B. No refund call.

## Flow E — Profile

- [ ] Open the athlete’s own profile. — Under Age / Height / Weight / Pole, the current quarter shows a semicircle, attended, the chip, and **Upcoming classes**. Attended means checked in.
- [ ] With no grant covering today, open the profile. — The semicircle is hidden and the section says **No classes this quarter**. Attended still shows.
- [ ] With an unlimited grant covering today, open the profile. — The meter says Unlimited instead of a fraction.
- [ ] Tap the quarter block. — Class history opens. Lines can include the purchase, **Credit added**, **Credit removed**, Attended, Missed, and Unused credits expired. A canceled class does not say Missed.
- [ ] Use the filter. — Current Quarter, the previous eight quarters, and custom dates. The icon tints when the range is not the current quarter.
- [ ] On a past reserved row, compare a check-in with a no check-in. — **Attended** and **Missed**. Today and future stay **Reserved** until check-in.

## Flow F — Check-in

Flows F through L start on the class schedule, so the tester needs Class beta (`reserve_classes`) plus the permission named on that flow. Opening someone else’s profile uses `view_profiles`, which Base already has.

Needs `manage_attendance`. Use a class today or earlier that is not canceled.

- [ ] Tap **Check in** on the schedule row. — The attendees screen opens. Reserved people, then walk-ins. Photo or initials, name, and group labels when groups are set.
- [ ] Tap **Check in** on a row, then tap **Checked in**. — Present, then undone. The credit does not move.
- [ ] On a future class, open **View attendees**. — Names show. There is no Check in control.
- [ ] Tap **+ Walk-in**, search, and add someone who has a credit. — They are checked in and the credit is spent. The reservation cutoff does not block the walk-in.
- [ ] Walk in someone with zero credits, as staff who also have `manage_credits`. — Add that many credits for the class’s season, then check them in. One flow, two steps.
- [ ] Repeat that walk-in as staff who do **not** have `manage_credits`. — The screen says **An admin needs to add a credit before you can sign them in.** No credit is created.
- [ ] Search a walk-in who is not eligible. — The row says **Not eligible**. Choosing them shows the reason and does not offer add-credits.
- [ ] Walk in to a dollar class. — The price is confirmed and nothing is charged.

## Flow G — Classes

Needs `manage_classes`.

- [ ] Tap **+** on the schedule and save a one-off class, then a repeating class with more than one weekday and an optional end date. — Both show on the schedule. Saving the repeating class asks this date or the whole series.
- [ ] Set credits, a dollar price, or both, plus groups, ages, cutoffs, color, a note, and notify-coach-on-reserve. — The member schedule shows those settings. Notify-coach does not send a message.
- [ ] **Copy from** a class already on the schedule. — The new form is filled from that series.
- [ ] Turn off **Visible on member schedule**. — Members do not see it. Staff see it, labeled **Hidden from members**.
- [ ] Edit one date of a series (time or location). — That date stays moved. The other dates do not.
- [ ] Cancel this date, then the series. — Canceled stays on the calendar. Restore puts it back.
- [ ] Delete a class you can afford to lose. — The confirm requires typing DELETE. The class is gone. No message is sent.
- [ ] On an attendees row, open **⋯**. — `manage_classes` sees View profile, Cancel reservation, and Adjust credits when they also have `manage_credits`.
- [ ] Cancel one member’s reservation from that menu, including after the member cutoff. — The signup is gone and the credit is back. No Notifications message.

## Flow H — Message the class

Needs `manage_classes` or `manage_attendance`.

- [ ] On class detail, tap the message icon in the header, write a note, and send. — The sheet is titled Message {class} (count). One group for that series and date. Reserved athletes and walk-ins can reply. The sheet opens that conversation.
- [ ] Remove someone from the class and send again. — They are not in the later message. Staff who already sent stay in the group.
- [ ] Message a class with nobody signed up. — **No one is on this class yet.**

## Flow I — Credits

Needs `manage_credits`. Use someone else’s profile.

- [ ] On someone else’s profile, tap **Adjust Class Credits**. — The screen is Adjust credits. The chip includes reserved. Add and remove insert **Credit added** and **Credit removed**. They do not edit the original purchase.
- [ ] Change the window. — It defaults to the current season. Other season, custom dates, and no expiration are available.
- [ ] Add with **Unlimited**, then **End package**. — The chip shows Unlimited. End sets that grant’s expiration to now and keeps the row. A credit-removed line has no End package button.
- [ ] Hold two finite grants that both cover a class, and reserve. — The grant that expires sooner is spent. An unlimited grant is spent only after finite credits are gone.
- [ ] Open a profile with no Associated Athlete. — The screen says to edit the profile and choose an Associated Athlete. No grant is created.
- [ ] After an add, remove, or end that changes the date, open that athlete’s Notifications thread. — One message. The sender is the staff member’s selected profile. The athlete cannot reply.

## Flow J — Training group

The catalog needs `manage_classes`. The chips on Edit Profile need `edit_training_group`. Opening someone else’s Edit Profile also needs `edit_others_profiles`.

- [ ] More → Administrator → Classes → **Training groups**. — The list shows name and key. **+** adds a group. The key is made from the name and does not change when you rename.
- [ ] On someone else’s **Edit Profile**, select more than one group and save, then save with none selected. — The labels follow the save. Clearing leaves the group unset (Open / All Ages for eligibility).
- [ ] Open Edit Profile as the athlete, without `edit_training_group`. — The training-group field is hidden.

## Flow K — Class change notice

- [ ] Change the time, date, or location, or cancel, with notify on and an optional note. — Each reserved athlete gets one Notifications message for their dates. It names the previous value. **View class** opens that date. Past dates are skipped.
- [ ] Save the same kind of change with notify off. — Nothing is sent.
- [ ] Restore a canceled class, and delete a class. — Nothing is sent.

## Flow L — Class packages

Needs `manage_classes`.

- [ ] More → Administrator → Classes → **Class packages**. — Fly Kids, Adult, and All Ages list the seeded packages, including Unlimited.
- [ ] Add a package and edit one. Turn **Show on website** off. — It disappears from the website list. Grants already purchased stay.
- [ ] Reorder inside one group. — That group’s order changes. The group sections stay Fly Kids, Adult, All Ages, then any other key alphabetically.

## Website purchase

Leave the flag off for the first check. Turn it on only for the second. Set it back to false when you are done unless this database is the live cutover.

```sql
UPDATE registrationSettings
SET useClassPackageCatalog = 1
WHERE id = 1;
```

- [ ] With the flag off, open website registration and finish a purchase. — The form is the existing radios. `purchases` is written. No `creditGrants` row.
- [ ] Turn the flag on and reload registration. — The quarter picker stays. Class choices are the active public catalog packages. An invite code reveals packages of that invite level only.
- [ ] Finish one purchase. — One grant for that purchase. The app chip shows the credits after the athlete signs in. A purchase from before the flag was turned on still has no grant.
- [ ] Buy a later quarter. — Those credits show a future start and cannot reserve this quarter’s classes.
- [ ] Submit finalize again for the same purchase, if you can. — A second grant is not created.

## Automated tests

Run from each repo after `nvm use`. Record the result on the line.

- [x] `dcvault/` (Node 16): `npm test`. — 2026-11-22: 19 suites, 301 tests passed.
- [x] `polevaultapp/DCVault/` (Node 24): `npm test`. — 2026-11-22: 29 suites, 199 tests passed.

The six §15 boxes this walk covers (credit model, package catalog, scrolling agenda, soonest-expiring deduction, profile switching, unit tests) were checked in task 13.2. They had already shipped.
