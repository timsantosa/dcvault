-- Class reservation schema for an existing database.
--
-- Server startup calls schema.sync(). That creates a missing table. It does
-- not add a column to a table that already exists. Run this file once before
-- deploying the class-reservation code. New tables below are created by sync
-- on startup; they are listed so the deploy set is in one place. The ALTER is
-- the statement sync will not do.
--
-- Tables sync creates:
--   classPackages
--   creditGrants
--   registrationSettings
--   trainingGroups
--   athleteProfileTrainingGroups
--   classSeries
--   classSeriesSlots
--   classSeriesTrainingGroups
--   classSeriesCoaches
--   classOccurrences
--   classOccurrenceTrainingGroups
--   classOccurrenceCoaches
--   classReservations
--   classConversations
--   creditAllocations
--
-- After the server has started (so those tables exist), from dcvault/:
--   node server/db/seedTrainingGroups.js
--   node server/db/seedClassPackages.js
-- Permissions, including the class-reservation keys, are seeded by server startup.
--
-- The Google Calendar sync table is Phase 2. It is not in this file.

ALTER TABLE conversations
  ADD COLUMN noticesForAthleteProfileId INT NULL UNIQUE
  AFTER imageUrl,
  ADD CONSTRAINT conversations_notices_athlete_profile
    FOREIGN KEY (noticesForAthleteProfileId) REFERENCES athleteProfiles(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
