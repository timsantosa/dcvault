-- Add World Athletics athlete ID to athlete profiles (8-digit number).
ALTER TABLE athleteProfiles
  ADD COLUMN worldAthleticsNumber VARCHAR(8) NULL
  AFTER vaultAssociationId;
