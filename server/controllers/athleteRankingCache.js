const db = require('../db/db');
const {
  getBestOfPersonalRecords,
  sortProfilesByPR,
  isAthleteProfileActive,
  assignRanksWithTies,
  cloneProfilesForRanking,
} = require('../utils/rankingUtils');
const { DC_VAULT_ASSOCIATION_ID } = require('../constants/vaultAssociations');

function vaultKeyFromScope(vaultScope) {
  if (vaultScope === null || vaultScope === undefined || vaultScope === 'global') {
    return 'global';
  }
  return String(vaultScope);
}

/** Stored `athleteProfiles.gender` values that belong in each ranking bucket (lowercase + common variants). */
const DB_GENDERS_BY_RANKING_BUCKET = {
  male: ['male', 'Male', 'm', 'M'],
  female: ['female', 'Female', 'f', 'F'],
  other: ['other', 'Other', 'non-binary', 'Non-binary', 'nonbinary', 'Nonbinary', 'U', ''],
};

/** Map a profile gender to a cache bucket; unknown / empty → other. */
function canonicalRankingGender(gender) {
  const s = gender === null || gender === undefined ? '' : String(gender).trim().toLowerCase();
  if (!s) {
    return 'other';
  }
  if (s === 'male' || s === 'm') {
    return 'male';
  }
  if (s === 'female' || s === 'f') {
    return 'female';
  }
  return 'other';
}

class RankingCache {
  constructor() {
    // rankings[gender][type][vaultKey] = ranking list or null
    this.rankings = {
      male: { allTime: {}, active: {} },
      female: { allTime: {}, active: {} },
      other: { allTime: {}, active: {} },
    };
  }

  async generateRanking(gender, type = 'active', vaultKey = 'global') {
    gender = canonicalRankingGender(gender);
    if (type !== 'active' && type !== 'allTime') {
      return;
    }

    const rankingVaultId = vaultKey === 'global' ? undefined : parseInt(vaultKey, 10);
    console.log(`Generating ${type} ranking for ${gender} athletes (vault=${vaultKey})...`);

    const Op = db.tables.schema.Sequelize.Op;
    const query = {
      where: { gender: { [Op.in]: DB_GENDERS_BY_RANKING_BUCKET[gender] } },
      include: [
        {
          model: db.tables.PersonalRecords,
          as: 'personalRecords',
          attributes: ['stepNum', 'vaultAssociationId'],
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

    if (type === 'active') {
      const results = await db.tables.AthleteProfiles.findAll(query);

      const activeProfiles = await Promise.all(
        results.map(async (profile) => {
          const isActive = await isAthleteProfileActive(profile, db);
          return isActive ? profile : null;
        })
      );

      const filteredProfiles = activeProfiles.filter((profile) => profile !== null);
      const forRanking = cloneProfilesForRanking(filteredProfiles, rankingVaultId);
      sortProfilesByPR(forRanking);
      const rankings = assignRanksWithTies(forRanking);

      const rankingList = forRanking.map((athlete) => {
        const bestPr = getBestOfPersonalRecords(athlete.personalRecords);
        return {
          athleteProfileId: athlete.id,
          jumpId: bestPr.jumpId,
          bestHeight: bestPr.heightInches,
          rank: rankings.get(athlete.id) || 1,
        };
      });

      this.rankings[gender].active[vaultKey] = rankingList;
    } else {
      const results = await db.tables.AthleteProfiles.findAll(query);
      const forRanking = cloneProfilesForRanking(results, rankingVaultId);
      sortProfilesByPR(forRanking);
      const rankings = assignRanksWithTies(forRanking);

      const rankingList = forRanking.map((athlete) => {
        const bestPr = getBestOfPersonalRecords(athlete.personalRecords);
        return {
          athleteProfileId: athlete.id,
          jumpId: bestPr.jumpId,
          bestHeight: bestPr.heightInches,
          rank: rankings.get(athlete.id) || 1,
        };
      });

      this.rankings[gender].allTime[vaultKey] = rankingList;
    }

    console.log(`${type} ranking generated for ${gender} (vault=${vaultKey}).`);
  }

  async getRankingForAthlete(athleteProfileId, gender, type = 'active', vaultScope = 'global') {
    const canonicalGender = canonicalRankingGender(gender);
    if (type !== 'active' && type !== 'allTime') {
      return null;
    }

    const vaultKey = vaultKeyFromScope(vaultScope);

    const list = this.rankings[canonicalGender][type][vaultKey];
    if (!list) {
      await this.generateRanking(canonicalGender, type, vaultKey);
    }

    const rankingList = this.rankings[canonicalGender][type][vaultKey];
    let rankEntry = rankingList.find((entry) => entry.athleteProfileId === athleteProfileId);

    if (!rankEntry) {
      await this.generateRanking(canonicalGender, type, vaultKey);
      rankEntry = this.rankings[canonicalGender][type][vaultKey].find(
        (entry) => entry.athleteProfileId === athleteProfileId
      );
    }

    return rankEntry ? rankEntry.rank : null;
  }

  async regenerateAllRankings() {
    console.log('Regenerating all rankings...');
    const genders = ['male', 'female', 'other'];
    const types = ['allTime', 'active'];
    const vaultKeys = ['global', String(DC_VAULT_ASSOCIATION_ID)];

    await Promise.all(
      genders.flatMap((gender) =>
        types.flatMap((type) => vaultKeys.map((vk) => this.generateRanking(gender, type, vk)))
      )
    );
    console.log('All rankings updated.');
  }
}

// Singleton instance
const rankingCache = new RankingCache();
module.exports = rankingCache;
