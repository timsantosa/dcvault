// Valid pole brand enum values from the database
const VALID_POLE_BRANDS = ['UCS', 'Altius', 'Dynasty', 'ESSX', 'Nordic', 'Pacer', 'Sky Pole', 'KIDS', 'Other'];

/**
 * Validates and normalizes pole brand values
 * @param {string} brand - The pole brand to validate
 * @returns {string|null} - The validated brand or 'Other' if invalid, null if no brand provided
 */
function validatePoleBrand(brand) {
  if (!brand) return null;
  
  // Check if the brand is already a valid enum value (case-sensitive check first for performance)
  if (VALID_POLE_BRANDS.includes(brand)) {
    return brand;
  }
  
  // Case-insensitive check: find matching brand from VALID_POLE_BRANDS
  const normalizedInput = brand.trim();
  const matchedBrand = VALID_POLE_BRANDS.find(
    validBrand => validBrand.toLowerCase() === normalizedInput.toLowerCase()
  );
  
  if (matchedBrand) {
    return matchedBrand; // Return the properly cased version from the enum
  }
  
  // If not valid, return 'Other' as fallback
  console.warn(`Invalid pole brand "${brand}" provided, defaulting to "Other"`);
  return 'Other';
}

module.exports = {
  VALID_POLE_BRANDS,
  validatePoleBrand
}; 