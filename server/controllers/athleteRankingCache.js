const db = require('../db/db')

class RankingCache {
    constructor() {
        this.rankings = { male: null, female: null };
        // this.rankMap = { male: new Map(), female: new Map() }; // For quick lookup
      }

  async generateRanking(gender) {
    console.log(`Generating ranking for ${gender} athletes...`);

//     const sql = `
//       SELECT 
//           ap.id AS athleteProfileId,
//           MAX(j.heightInches) AS bestHeight
//       FROM 
//           athleteProfiles ap
//       JOIN 
//           personalRecords pr ON pr.athleteProfileId = ap.id
//       JOIN 
//           jumps j ON j.id = pr.jumpId
//       WHERE 
//           ap.gender = :gender
//       GROUP BY 
//           ap.id
//       ORDER BY 
//           bestHeight DESC;
//   `;

//     const [results] = await sequelize.query(sql, {
//       type: sequelize.QueryTypes.SELECT,
//       replacements: { gender },
//     });

    // // Attach ranks to results
    // this.rankings[gender] = results.map((athlete, index) => ({
    //   athleteProfileId: athlete.athleteProfileId,
    //   bestHeight: athlete.bestHeight,
    //   rank: index + 1, // 1-based ranking
    // }));

    // Get best heights from personalRecords for active athletes
    const results = await db.tables.AthleteProfiles.findAll({
        where: { gender, isActiveMember: true },
        include: [
          {
            model: db.tables.PersonalRecords,
            as: 'personalRecords',
            include: [
              {
                model: db.tables.Jumps,
                as: 'jump',
                attributes: ['heightInches', 'id'],
              },
            ],
          },
        ],
      });
  
      // Convert to ranking list
      const rankingList = results
        .map((athlete) => {

          if (!athlete.personalRecords || athlete.personalRecords.length === 0) {
            return { athleteProfileId: athlete.id, bestHeight: 0 }; // Handle empty array case
          }
        
          const bestPr = athlete.personalRecords.reduce((bestSoFar, current) => {
            return current.jump.heightInches > bestSoFar.jump.heightInches ? current : bestSoFar;
          }, athlete.personalRecords[0]);

          // const bestHeight = athlete.personalRecords.length
          //   ? Math.max(...athlete.personalRecords.map((pr) => pr.jump.heightInches))
          //   : 0; // Default to 0 if no PRs
  
          return { 
            athleteProfileId: athlete.id, 
            jumpId: bestPr.jump.id, 
            bestHeight: bestPr.jump.heightInches
          };
        })
        .sort((a, b) => b.bestHeight - a.bestHeight) // Sort descending
        .map((athlete, index) => ({
          ...athlete,
          rank: index + 1,
        }));

    // Store rankings and create quick lookup map
    this.rankings[gender] = rankingList;
    // this.rankMap[gender].clear();
    // rankingList.forEach((athlete) => {
    //   this.rankMap[gender].set(athlete.athleteProfileId, athlete.rank);
    // });

    console.log(`Ranking generated for ${gender}.`);
  }

  async getRankingForAthlete(athleteProfileId, gender) {
    if(!gender) {
        return null;
    }

    if (!this.rankings[gender]) {
      await this.generateRanking(gender);
    }

    const rankEntry = this.rankings[gender].find(
      (entry) => entry.athleteProfileId === athleteProfileId
    );

      return rankEntry ? rankEntry.rank : null; // Returns rank or null if not found

    // return this.rankMap[gender].get(athleteProfileId) || null;
  }

  async regenerateAllRankings() {
    console.log('Regenerating all rankings...');
    await Promise.all([this.generateRanking('male'), this.generateRanking('female'), this.generateRanking('other')]);
    console.log('Rankings updated.');
  }
}

// Singleton instance
const rankingCache = new RankingCache();
module.exports = rankingCache;