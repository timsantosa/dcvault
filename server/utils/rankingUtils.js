const helpers = require('../lib/helpers');

/**
 * Get the best personal record from a collection of personal records
 * @param {Array} personalRecords - Array of personal record objects with jump data
 * @returns {Object} Object containing heightInches and jumpId of the best PR
 */
function getBestOfPersonalRecords(personalRecords) {
  if (!personalRecords || personalRecords.length === 0) {
    return { heightInches: 0, jumpId: null };
  }

  // Find the PR with the highest height
  const bestPr = personalRecords.reduce((best, current) => {
    const currentHeight = current.jump ? current.jump.heightInches ?? 0 : 0;
    const bestHeight = best.jump ? best.jump.heightInches ?? 0 : 0;
    return currentHeight > bestHeight ? current : best;
  });

  return {
    heightInches: Math.max(bestPr.jump ? bestPr.jump.heightInches ?? 0 : 0, 0),
    jumpId: bestPr.jump ? bestPr.jump.id : null
  };
}

/**
 * Sort athlete profiles by their personal records (height descending, date ascending for ties)
 * @param {Array} profiles - Array of athlete profile objects with personalRecords with jump data
 * @returns {Array} Sorted array of profiles
 */
function sortProfilesByPR(profiles) {
  return profiles.sort((a, b) => {
    // Get the best PR for each athlete
    const aPr = getBestOfPersonalRecords(a.personalRecords);
    const bPr = getBestOfPersonalRecords(b.personalRecords);
    
    // Compare heights first (descending)
    if (aPr.heightInches !== bPr.heightInches) {
      return bPr.heightInches - aPr.heightInches;
    }
    
    // If heights are equal, compare dates (ascending - earlier date wins)
    // Find the earliest date among jumps with the best height for each athlete
    const aBestJumps = a.personalRecords.filter(pr => 
      pr.jump && pr.jump.heightInches === aPr.heightInches
    );
    const bBestJumps = b.personalRecords.filter(pr => 
      pr.jump && pr.jump.heightInches === bPr.heightInches
    );
    
    // If both athletes have no PRs (heightInches = 0 and no actual jumps),
    // sort by ID (creation order) for deterministic ordering
    if (aBestJumps.length === 0 && bBestJumps.length === 0) {
      return a.id - b.id;
    }
    
    // If one has jumps and the other doesn't, the one with jumps wins
    if (aBestJumps.length === 0) return 1;
    if (bBestJumps.length === 0) return -1;
    
    const aEarliestDate = Math.min(...aBestJumps.map(pr => new Date(pr.jump.date)));
    const bEarliestDate = Math.min(...bBestJumps.map(pr => new Date(pr.jump.date)));
    
    // If dates are equal, fall back to ID for deterministic ordering
    const dateDiff = aEarliestDate - bEarliestDate;
    return dateDiff !== 0 ? dateDiff : a.id - b.id;
  });
}

// TODO: this will change once we are counting classes.
async function isAthleteProfileActive(athleteProfile, db) {
  // If marked as always active, return true
  if (athleteProfile.alwaysActiveOverride) {
    return true;
  }

  // If no associated athlete, return false
  if (!athleteProfile.athleteId) {
    return false;
  }

  // Get current quarter info
  const currentQuarter = helpers.getCurrentQuarter();
  const currentYear = new Date().getFullYear();

  // Check for active purchase - get the latest one for this quarter
  const activePurchase = await db.tables.Purchases.findOne({
    where: {
      athleteId: athleteProfile.athleteId,
      quarter: currentQuarter
    },
    order: [['createdAt', 'DESC']] // Get the most recent purchase
  });

  if (!activePurchase) {
    return false;
  }

  // Check if purchase is for current year
  return isPurchaseActiveForCurrentYear(activePurchase, currentQuarter, currentYear);
}

/**
 * Helper function to check if a purchase is active for the current year/quarter
 * @param {Object} purchase - Purchase object
 * @param {string} currentQuarter - Current quarter ('winter', 'spring', 'summer', 'fall')
 * @param {number} currentYear - Current year
 * @returns {boolean} Whether the purchase is active for the current year
 */
function isPurchaseActiveForCurrentYear(purchase, currentQuarter, currentYear) {
  const purchaseYear = new Date(purchase.createdAt).getFullYear();
  
  // Special handling for winter quarter which spans years
  if (currentQuarter === 'winter') {
    return purchaseYear === currentYear || purchaseYear + 1 === currentYear;
  }
  
  return purchaseYear === currentYear;
}

module.exports = {
  getBestOfPersonalRecords,
  sortProfilesByPR,
  isAthleteProfileActive,
  isPurchaseActiveForCurrentYear,
};
