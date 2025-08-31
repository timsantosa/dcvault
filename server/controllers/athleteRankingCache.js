const db = require('../db/db');
const { getBestOfPersonalRecords, sortProfilesByPR } = require('../utils/rankingUtils');

class RankingCache {
    constructor() {
        // Structure: { gender: { allTime: [...], active: [...] } }
        this.rankings = {
            male: { allTime: null, active: null },
            female: { allTime: null, active: null },
            other: { allTime: null, active: null }
        };
    }

    async generateRanking(gender, type = 'active') {
        console.log(`Generating ${type} ranking for ${gender} athletes...`);

        // Base query for athlete profiles
        const query = {
            where: { gender },
            include: [
                {
                    model: db.tables.PersonalRecords,
                    as: 'personalRecords',
                    include: [
                        {
                            model: db.tables.Jumps,
                            as: 'jump',
                            attributes: ['heightInches', 'id', 'date'],
                        },
                    ],
                },
            ],
        };

        // If generating active rankings, we need to check active status
        if (type === 'active') {
            const results = await db.tables.AthleteProfiles.findAll(query);
            
            // Filter for active members and create rankings
            const activeProfiles = await Promise.all(
                results.map(async (profile) => {
                    const isActive = await require('./athletesController').isAthleteProfileActive(profile, db);
                    return isActive ? profile : null;
                })
            );

            const filteredProfiles = activeProfiles.filter(profile => profile !== null);
            
            // Sort using the same logic as getRankedAthleteProfiles
            sortProfilesByPR(filteredProfiles);

            const rankingList = filteredProfiles.map((athlete, index) => {
                // Get the best PR using the helper function
                const bestPr = getBestOfPersonalRecords(athlete.personalRecords);

                return {
                    athleteProfileId: athlete.id,
                    jumpId: bestPr.jumpId,
                    bestHeight: bestPr.heightInches,
                    rank: index + 1,
                };
            });

            this.rankings[gender].active = rankingList;
        } else {
            // For all-time rankings, we don't need to check active status
            const results = await db.tables.AthleteProfiles.findAll(query);

            // Sort using the same logic as getRankedAthleteProfiles
            sortProfilesByPR(results);

            const rankingList = results.map((athlete, index) => {
                // Get the best PR using the helper function
                const bestPr = getBestOfPersonalRecords(athlete.personalRecords);

                return {
                    athleteProfileId: athlete.id,
                    jumpId: bestPr.jumpId,
                    bestHeight: bestPr.heightInches,
                    rank: index + 1,
                };
            });

            this.rankings[gender].allTime = rankingList;
        }

        console.log(`${type} ranking generated for ${gender}.`);
    }

    async getRankingForAthlete(athleteProfileId, gender, type = 'active') {
        if (!gender) {
            return null;
        }

        if (!this.rankings[gender][type]) {
            await this.generateRanking(gender, type);
        }

        const rankEntry = this.rankings[gender][type].find(
            (entry) => entry.athleteProfileId === athleteProfileId
        );

        // If the rankEntry is not found, they may have recently registered, so we need to re-generate the ranking for the athlete
        if (!rankEntry) {
            await this.generateRanking(gender, type);
            // This may cause an infinite loop if for some reason the athlete
            // is never in the rankings.
            // return this.getRankingForAthlete(athleteProfileId, gender, type);
        }

        return rankEntry ? rankEntry.rank : null;
    }

    async regenerateAllRankings() {
        console.log('Regenerating all rankings...');
        const genders = ['male', 'female', 'other'];
        const types = ['allTime', 'active'];
        
        await Promise.all(
            genders.flatMap(gender => 
                types.map(type => this.generateRanking(gender, type))
            )
        );
        console.log('All rankings updated.');
    }
}

// Singleton instance
const rankingCache = new RankingCache();
module.exports = rankingCache;