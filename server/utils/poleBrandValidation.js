// Valid pole brand enum values from the database
const VALID_POLE_BRANDS = ['UCS', 'Altius', 'Dynasty', 'ESSX', 'Nordic', 'Pacer', 'Sky Pole', 'KIDS', 'Other'];

/**
 * Validates and normalizes pole brand values
 * @param {string} brand - The pole brand to validate
 * @returns {string|null} - The validated brand or 'Other' if invalid, null if no brand provided
 */
function validatePoleBrand(brand) {
  if (!brand) return null;
  
  // Check if the brand is already a valid enum value
  if (VALID_POLE_BRANDS.includes(brand)) {
    return brand;
  }
  
  // If not valid, return 'Other' as fallback
  console.warn(`Invalid pole brand "${brand}" provided, defaulting to "Other"`);
  return 'Other';
}

module.exports = {
  VALID_POLE_BRANDS,
  validatePoleBrand
}; 