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
    
    const aEarliestDate = Math.min(...aBestJumps.map(pr => new Date(pr.jump.date)));
    const bEarliestDate = Math.min(...bBestJumps.map(pr => new Date(pr.jump.date)));
    
    return aEarliestDate - bEarliestDate;
  });
}

module.exports = {
  getBestOfPersonalRecords,
  sortProfilesByPR,
};
