const db = require('../db/db')

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
                            attributes: ['heightInches', 'id'],
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

            const rankingList = activeProfiles
                .filter(profile => profile !== null)
                .map((athlete) => {
                    if (!athlete.personalRecords || athlete.personalRecords.length === 0) {
                        return { athleteProfileId: athlete.id, bestHeight: 0 };
                    }

                    const bestPr = athlete.personalRecords.reduce((bestSoFar, current) => {
                        return current.jump.heightInches > bestSoFar.jump.heightInches ? current : bestSoFar;
                    }, athlete.personalRecords[0]);

                    return {
                        athleteProfileId: athlete.id,
                        jumpId: bestPr.jump.id,
                        bestHeight: bestPr.jump.heightInches
                    };
                })
                .sort((a, b) => b.bestHeight - a.bestHeight)
                .map((athlete, index) => ({
                    ...athlete,
                    rank: index + 1,
                }));

            this.rankings[gender].active = rankingList;
        } else {
            // For all-time rankings, we don't need to check active status
            const results = await db.tables.AthleteProfiles.findAll(query);

            const rankingList = results
                .map((athlete) => {
                    if (!athlete.personalRecords || athlete.personalRecords.length === 0) {
                        return { athleteProfileId: athlete.id, bestHeight: 0 };
                    }

                    const bestPr = athlete.personalRecords.reduce((bestSoFar, current) => {
                        return current.jump.heightInches > bestSoFar.jump.heightInches ? current : bestSoFar;
                    }, athlete.personalRecords[0]);

                    return {
                        athleteProfileId: athlete.id,
                        jumpId: bestPr.jump.id,
                        bestHeight: bestPr.jump.heightInches
                    };
                })
                .sort((a, b) => b.bestHeight - a.bestHeight)
                .map((athlete, index) => ({
                    ...athlete,
                    rank: index + 1,
                }));

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