'use strict';

/** DC Vault row in `vaultAssociations` (prod seed uses id 1). */
const DC_VAULT_ASSOCIATION_ID = 1;

/**
 * Stored on `personalRecords.vaultAssociationId` when the jump has no vault (NULL).
 * Not a foreign key — avoids MySQL UNIQUE(NULL) issues.
 */
const UNASSOCIATED_VAULT_ASSOCIATION_ID = 0;

function normalizeJumpVaultAssociationId(vaultAssociationId) {
  if (vaultAssociationId === null || vaultAssociationId === undefined) {
    return UNASSOCIATED_VAULT_ASSOCIATION_ID;
  }
  return vaultAssociationId;
}

module.exports = {
  DC_VAULT_ASSOCIATION_ID,
  UNASSOCIATED_VAULT_ASSOCIATION_ID,
  normalizeJumpVaultAssociationId,
};
