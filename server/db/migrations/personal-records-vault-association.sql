-- MySQL 5.7: Personal records scoped by vault association (per plan).
-- Run after deploying Sequelize model changes.
-- Sentinel: vaultAssociationId = 0 means unassociated (jump had NULL vault); no FK for 0.

-- 1. Add column (temporary default aligns with legacy single-vault rows before backfill)
ALTER TABLE personalRecords
  ADD COLUMN vaultAssociationId INT NOT NULL DEFAULT 1
  AFTER jumpId;

-- 2. Backfill from winning jump (0 = unassociated)
UPDATE personalRecords pr
INNER JOIN jumps j ON pr.jumpId = j.id
SET pr.vaultAssociationId = IFNULL(j.vaultAssociationId, 0);

-- 3. Add the NEW unique index BEFORE dropping the old one.
--    InnoDB uses unique_step_per_athlete to support the FK on athleteProfileId; dropping it first fails with ERROR 1553.
--    The new index leads with athleteProfileId, so it satisfies the FK once the old index is gone.
ALTER TABLE personalRecords
  ADD UNIQUE INDEX unique_step_vault_per_athlete (athleteProfileId, stepNum, vaultAssociationId);

-- 4. Drop the old uniqueness (safe now that unique_step_vault_per_athlete exists)
ALTER TABLE personalRecords DROP INDEX unique_step_per_athlete;
