# Credit Inventory — Design

**Companion to:** [CLASS_RESERVATION_SYSTEM.md](./CLASS_RESERVATION_SYSTEM.md)  
**Status:** Decided (Task 2.1). Tasks 2.2+ implement this file.  
**Last updated:** 2026-09-27

This is the schema and spending model for class credits. The PRD remains the product source of truth. If this file and the PRD disagree, update the PRD first, then this file.

---

## 1. What this model is

Two new tables:

- **`classPackages`** — the catalog. What the website can sell, and what an admin can assign. One row is a product (“8 Classes”, “Unlimited Classes”), not one athlete’s balance.
- **`creditGrants`** — the inventory. One row per website purchase or staff adjustment, owned by an **Athlete** (not an AthleteProfile). `quantity` does not change after insert. How many are left is computed from that quantity minus the reservations still holding a credit. It is not stored, and check-in does not change it.

The existing `packages` table (`name`, integer `quarter`, `year`, `price`) stays as it is. Registration does not read it. `discounts.packageId` already points at it, and `quarter` / `year` mean “one specific quarter,” which is the wrong shape for a reusable product. Startup `schema.sync()` creates missing tables and does not add columns to a table that already exists, so a new table is also the change this app will actually apply on boot.

A third small table, **`registrationSettings`**, holds one row: whether the website shows this catalog or the hardcoded form.

Athlete balances do not go on `classPackages`. Many athletes buy the same product.

---

## 2. `classPackages`

Sequelize model name `classPackage`. Table `classPackages`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | int PK | |
| `name` | string, required | Member-facing, e.g. `8 Classes`, `Unlimited Classes` |
| `price` | `DECIMAL(10,2)`, required | The price printed on the package. Apparel and the 3% checkout fee stay in the website payment step and are not part of this number. |
| `audience` | string, required | Website section and the value stored on `purchases.group`. Seeded keys match today’s form: `fly-kids`, `adult`, `allages`. Not a closed enum — an invite-only product may use another key, such as `elite` or `dropin`, which becomes its own section once a code reveals it. |
| `creditCount` | int, null | Classes granted. **Null means unlimited.** Finite packages are 1 or more. There is no separate unlimited flag. |
| `inviteLevel` | int, null | Null means public. `1`–`5` matches existing `invites.level`. Hidden until a code of that level is applied. |
| `active` | boolean, default true | `false` hides the product from registration. Existing grants stay spendable. |
| `sortOrder` | int, default 0 | Order within an audience section. |

Timestamps: Sequelize `createdAt` / `updatedAt`.

Rules:

- `creditCount` null means unlimited. A number must be 1 or more. The package editor writes null only when Unlimited is explicitly chosen. A blank count without that choice is a validation error, so a half-finished form cannot become an unlimited product.
- `audience` does not set `AthleteProfile.trainingGroup` and does not limit which classes a credit can book. Eligibility stays on the athlete’s training group. Facility on the purchase does not limit where a credit can be used.

### One-time seed

Public products only (`inviteLevel` null, `active` true). Prices are the radio labels.

| `audience` | `name` | `creditCount` | `price` | `sortOrder` |
| --- | --- | --- | --- | --- | --- |
| `fly-kids` | 2 Classes | 2 | 60.00 | 1 |
| `fly-kids` | 8 Classes | 8 | 200.00 | 2 |
| `fly-kids` | 15 Classes | 15 | 300.00 | 3 |
| `adult` | 2 Classes | 2 | 100.00 | 1 |
| `adult` | 8 Classes | 8 | 350.00 | 2 |
| `allages` | 4 Classes | 4 | 250.00 | 1 |
| `allages` | 8 Classes | 8 | 425.00 | 2 |
| `allages` | 15 Classes | 15 | 575.00 | 3 |
| `allages` | Unlimited Classes | null | 825.00 | 4 |

The All Ages $825 product is truly unlimited until the purchased quarter ends. The old “30–50 classes” label was a Zen Planner limit. Do not seed invite-only products (drop-in, private lesson, elite, and the rest). Add those later in the package editor if they should be sold.

---

## 3. `creditGrants`

Sequelize model name `creditGrant`. Table `creditGrants`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | int PK | |
| `athleteId` | FK `athletes`, required | Indexed. |
| `classPackageId` | FK `classPackages`, null | Null for a staff adjustment that is not a catalog product. |
| `purchaseId` | FK `purchases`, null | Set for website checkout. **Unique.** MySQL allows many nulls, so staff grants are fine. A second finalize for the same purchase inserts nothing. |
| `source` | string, required | `website_purchase`, `staff_add`, or `staff_remove`. String, not a MySQL enum, so a later source (for example a membership renewal) does not need an `ALTER`. |
| `label` | string, required | History line. Catalog name, or staff text such as `Makeup credit` / `Credit removed`. |
| `quantity` | int, null | Immutable. **Null means unlimited.** Negative for `staff_remove`. Copied from `classPackages.creditCount` on a website purchase. |
| `startsAt` | datetime, null | Inclusive. A class can use this grant when `class.start >= startsAt`. Null means no start restriction. |
| `expiresAt` | datetime, null | Exclusive end. A class can use this grant when `expiresAt` is null or `class.start < expiresAt`. Staff ending a grant writes this. |
| `originalExpiresAt` | datetime, null | Copy of `expiresAt` at insert. Never updated. |
| `createdByUserId` | FK `users`, null | Staff user for add, remove, and end. Null for website purchases. |

Index `athleteId`. Unique `purchaseId`.

A grant was **ended early** when `expiresAt` and `originalExpiresAt` are not the same value, counting null as a value. Both null means it never had an end date. Both equal means it still has the expiration it was created with. No third timestamp.

A grant is **spendable** for a class when all of these are true:

- `startsAt` is null or `class.start >= startsAt`
- `expiresAt` is null or `class.start < expiresAt`
- `quantity` is null (unlimited), or its balance is greater than 0 (§7)

`staff_remove` rows fail the last check. They exist so the summed balance drops and history has its own line.

---

## 4. Quarter windows

MVP seasons match `getCurrentQuarter` in `server/lib/helpers.js`: winter Dec–Feb, spring Mar–May, summer Jun–Aug, fall Sep–Nov. Use that function’s clock (server local time) so credit windows and active-member checks do not disagree. Making those boundaries admin-configurable is later work (PRD §15). When that ships, credit windows and active-member checks must read the same configuration.

`startsAt` is the first instant of the quarter (inclusive). `expiresAt` and `originalExpiresAt` are the first instant of the next day after the quarter (exclusive). Winter’s February uses the real last day (28 or 29).

The website lists four seasons and no year. Resolve the picked season to the window that contains today, or the next future window if that season has already ended:

| Today | Fall | Winter | Spring | Summer |
| --- | --- | --- | --- | --- |
| 2026-09-27 | 2026-09-01 → 2026-12-01 | 2026-12-01 → 2027-03-01 | 2027-03-01 → 2027-06-01 | 2027-06-01 → 2027-09-01 |
| 2027-01-15 | 2027-09-01 → 2027-12-01 | 2026-12-01 → 2027-03-01 | 2027-03-01 → 2027-06-01 | 2027-06-01 → 2027-09-01 |

Buying the current quarter covers classes from the first day of that quarter through the end, including classes before the checkout timestamp. Buying a later quarter sets `startsAt` in the future, so those credits cannot pay for this quarter’s classes.

---

## 5. Website catalog flag

`registrationSettings` is one row (`id = 1`):

| Column | Type | Notes |
| --- | --- | --- |
| `useClassPackageCatalog` | boolean, default **false** | Flipped in the database. There is no admin screen for it. |

**Flag off.** Today’s registration form, including invite-only groups. `POST /registration/finalize` writes `purchases` and does **not** create a grant. Staff add credits by hand for those athletes. No backfill of old purchases.

**Flag on.** The quarter picker, waivers, apparel, facility, discount codes, and PayPal stay. The class-count radios are replaced by active catalog rows for the chosen audience.

- Public packages (`inviteLevel` null) always show, grouped by `audience`.
- The invite-code box stays. A valid code reveals every **active** package whose `inviteLevel` equals `invites.level`. A level with no packages reveals nothing (level 2 / private lesson, until someone adds one).
- The code is still destroyed on successful purchase, same as today.
- Finalize still inserts `purchases`: `quarter` is the season string, `group` is `audience`, `membership` is `pkg:<classPackageId>`. Then it inserts one `creditGrants` row. If that `purchaseId` already has a grant, skip the insert.

Private lessons are not a website package. They are paid at reserve (§8).

---

## 6. Staff adjustments

Permission: `manage_credits`.

**Add N credits.** Insert a grant: `source = staff_add`, `quantity = N`. Staff pick `startsAt` / `expiresAt` (default: current quarter window) and set `originalExpiresAt` to that same `expiresAt`. This does not change the original purchase grant’s `quantity`.

**Remove N credits.** Insert a grant: `source = staff_remove`, `quantity = -N`. Same date window, usually the current quarter. The original grant is not edited. The member-facing total drops because the sum includes this row.

**End a grant** (the way to take unlimited away, and the way to end any whole grant early). Do not delete the row. Do not insert a cancel row. If `expiresAt` is null or still in the future, set `expiresAt` to now. Leave `originalExpiresAt` and `quantity` alone. If the grant has already reached its original end, do nothing.

The grant is then unusable because `expiresAt` is in the past. History shows an early end because `expiresAt` differs from `originalExpiresAt`. Upcoming reservations that already used the grant stay. Staff cancel those separately if the spot should be released. Replacing unlimited with a few classes is two actions: end the unlimited grant, then add a finite grant.

A negative count cannot end unlimited, because there is no count to subtract.

Notify the member on add, remove, and end (same path as other credit changes; Task 9.1).

---

## 7. Spending and giving a credit back

There is no `remaining` column. A stored balance would have to be updated in lockstep with every reserve and cancel, and it can drift from the reservations that actually hold the credits.

**Balance of one finite grant** (`quantity` is a number, including a negative staff removal):

`quantity − sum(allocation amounts still holding a credit on this grant)`

An allocation exists only while that reservation is holding the credit. Check-in, a no-show, and a late cancel all leave the allocation in place. The credit was taken at reserve. Attendance does not put it back and does not take another one.

**Unlimited** (`quantity` null) has no numeric balance. Allocations still record which reservation used it, so a cancel can find them. They do not reduce a count.

**Athlete total** for a class (or for “now” on the chip) sums those balances across finite grants whose window covers that moment, including negative staff-removal grants. Member-facing remaining is `max(0, that sum)`.

Dollar-only and free classes (`creditCost = 0`) do not create allocations.

For `creditCost >= 1`, inside a transaction that locks the athlete’s grants:

1. If the finite total `>= creditCost`, allocate from finite grants with balance `> 0`, soonest `expiresAt` first (null expirations last), then oldest `id`. One reservation may split across those grants.
2. If the finite total `< creditCost` and a spendable unlimited grant exists, allocate the **whole** cost to unlimited. Finite grants are left as they are. Pick the unlimited grant with the soonest `expiresAt`, then oldest `id`.
3. Otherwise the reserve fails (no usable credits).

Unlimited is last so a finite pack is used up before the open-ended one. A single reservation is not split across the finite pool and unlimited. Splits happen only inside the finite pool.

Task 7 persists allocations (`creditAllocations`: `reservationId`, `creditGrantId`, `amount`). Task 2.3 tests the function with an in-memory allocation list, before that table exists.

**Cancel inside the cutoff.** Delete that reservation’s allocations. The balance goes back up because the sum no longer includes them. If the grant has since been ended, the returned amount sits on a grant that is no longer spendable. Staff add a new grant if the member should be able to book again.

**Cancel after the cutoff.** Leave the allocations. Staff who excuse it add a grant.

---

## 8. What the member sees

No active unlimited grant:

`8 remaining · 3 reserved · 4 expire Sep 30`

`remaining` is `max(0, finite total)` for grants whose window covers now. `N expire [date]` is the sum of positive balances on grants that share the soonest `expiresAt`.

An active unlimited grant:

`Unlimited · 3 reserved · through Nov 30`

No remaining count, because they will not run out while that grant is live. Finite grants are still spent first and still listed in history. If the unlimited grant has no `expiresAt`, omit the through-date. Reserving animates the **reserved** count. The word Unlimited does not tick down.

The profile meter for a quarter covered by unlimited shows **Unlimited**, not a fraction. Attended count still shows.

History lines come from grants, not from edits to `quantity`:

- website purchase: `+8 · exp Sep 30` or `Unlimited · through Nov 30`
- staff add: `+1 · exp Sep 30`
- staff remove: `−1 · exp Sep 30`
- ended early: `Unlimited · ended Sep 27` (was through Nov 30, from `originalExpiresAt`)

---

## 9. Private lessons and other dollar classes

A private lesson is a normal class with a configuration: `creditCost = 0`, a dollar price, a small capacity, and notify-on-reserve. It does not draw group credits. There is no lesson-credit package in MVP.

Reserve shows a confirm sheet with the price, then saves the reservation. It does not call PayPal. Staff get the existing reserve notification and invoice outside the app. They can cancel the reservation with `manage_classes`. Real card charging at reserve is later; see the PRD Phase 2 list.

Task 7 stores a payment status on the reservation (`external` for this fake confirm). The credit deduct path is skipped when `creditCost` is 0.

Later lesson packs, if the website starts selling them: add `creditPool` (string, default `group`) on `classPackages`, `creditGrants`, and the class. Deduction filters on pool. Do not add that column in Task 2.2.

---

## 10. Active members

Unchanged. An athlete is active for the current quarter when `purchases` has a row for that quarter under the existing `isPurchaseActiveForCurrentYear` rule, or `alwaysActiveOverride` is set. Catalog checkout still writes `purchases`, so a new registration still flips active status. A staff grant alone does not.

---

## 11. Room for later products

Do not add these columns or tables in Task 2.2.

**Configurable quarter dates.** MVP hardcodes Dec–Feb, Mar–May, Jun–Aug, and Sep–Nov. Later, an admin sets each season’s start and end. Credit windows and the active-member quarter check must use that one configuration. Do not add it in Task 2.2.

**Weekly allotment.** Add `allotment` on `classPackages` (`total` default, or `weekly`) and a weekly class count. Each week is its own `creditGrant` whose `expiresAt` is the end of that week. Unused classes die because the grant expires. Deduction stays “soonest `expiresAt` first,” so a weekly grant is used before a quarter grant that ends later. No second balance engine.

**Auto-renewing memberships.** A future `membershipPlans` catalog (cadence chosen by an admin, price, grant template) and a `memberships` row per athlete (`active` / `canceled`, period bounds). Each period inserts a `creditGrant` with a new `source` string. Cancel stops future grants and leaves old ones. `creditGrants` already belongs to the athlete and already has start and expiration, so the renewal job is a new writer, not a new inventory model.

---

## 12. Who builds what

| Task | Implements |
| --- | --- |
| **2.2** | Models for `classPackages`, `creditGrants`, `registrationSettings`. Seed the nine packages and the settings row (`useClassPackageCatalog = false`). No weekly column, no `creditPool`, no backfill. |
| **2.3** | Add, remove, end-grant, quarter window resolver, deduct, return-on-cancel. Unit tests for soonest-expiring order, start and expiration, negative remove grants, unlimited last, end-by-expiration, and purchase idempotency. |
| **2.4** | Mobile package editor, `manage_classes`. Create and edit catalog rows, including invite level. Deactivate hides the product and leaves grants. |
| **3.1** | When the flag is on, registration lists the catalog (public, plus invite-level matches) and finalize creates one grant. Flag off: no grant. No backfill. |
| **7.x** | Persist allocations. Dollar classes use the fake price confirm and skip deduct. |
| **9.x** | Add, remove, and end-grant UI. Notify on all three. |
