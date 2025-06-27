const helpers = require('../lib/helpers');
const rankingCache = require('./athleteRankingCache');
const { getPersonalBest } = require('./jumpsController');

async function upsertProfile(req, res, db) {
  try {
    const userSendingRequest = req.user;
    const newProfileData = req.body.athleteProfile;
    const athleteProfileIdToUpdate = req.query.athleteProfileId;
    const userIdToCreateFor = req.query.userId;


    // either an athleteProfId needs to passed in for updating, or 
    // a userId must be used for creating new profiles
    if (!athleteProfileIdToUpdate && !userIdToCreateFor) {
      return res.status(400).json({ ok: false, message: 'User or athlete not specified' });
    }

    // Check for required fields
    if (!newProfileData || !newProfileData.firstName || !newProfileData.lastName || !newProfileData.dob || !newProfileData.gender) {
      return res.status(400).json({ ok: false, message: 'Missing required fields' });
    }

    const query = athleteProfileIdToUpdate
      ? { where: { id: athleteProfileIdToUpdate } } // Find profile by athleteProfileId (for updates)
      : { where: { userId: userIdToCreateFor } }; // Find profile by userId (for creation)

    // Maybe consider using upsert?
    const existingProfile = await db.tables.AthleteProfiles.findOne(query);

    let athleteProfileData = {
      firstName: newProfileData.firstName,
      lastName: newProfileData.lastName,
      dob: newProfileData.dob,
      nationality: newProfileData.nationality ?? 'US',
      height: newProfileData.height,
      weight: newProfileData.weight,
      gender: newProfileData.gender,
      athleteId: newProfileData.associatedAthleteId, // TODO: check if athleteId is already associated with another profile
      alwaysActiveOverride: newProfileData.alwaysActiveOverride ?? false,
    }

    if (userSendingRequest.permissions?.includes('manage_active_profiles')) {
      athleteProfileData.alwaysActiveOverride = newProfileData.alwaysActiveOverride;
    }

    if (existingProfile) {
      // Update existing profile
      await existingProfile.update(athleteProfileData);

      console.log(`Profile updated successfully with id ${existingProfile.id}`);
      return res.status(200).json({
        ok: true,
        message: "Profile updated.",
      });
    }

    // If profile does not exist, create a new one
    athleteProfileData.userId = userIdToCreateFor;
    if (!athleteProfileData.nationality) {
      athleteProfileData.nationality = 'US';
    }

    const newProfile = await db.tables.AthleteProfiles.create(athleteProfileData);
    console.log(`Profile created successfully with id ${newProfile.id}`);
    return res.status(200).json({ ok: true, message: "Profile Created", athleteProfileId: newProfile.id });

  } catch (error) {
    console.error('Error in upsertProfile:', error);
    return res.status(500).json({ ok: false, message: 'Server error', error: error.message });
  }
}

const getProfile = async (req, res, db) => {
  const user = req.user;

  try {
    const athleteProfileId = parseInt(req.query.athleteProfileId);
    if (!helpers.isValidId(athleteProfileId)) {
      return res.status(400).json({ ok: false, message: 'Invalid athlete profile ID.' });
    }

    let attributes = [
      'id', 'firstName', 'lastName',
      'nationality', 'dob', 'height', 
      'weight', 'profileImage', 'backgroundImage', 
      'gender', 'profileImageVerified', 'backgroundImageVerified',
      'alwaysActiveOverride', 'userId', 'athleteId'];
    const userHasFullAccess = user.isAdmin || user.athleteProfileIds?.includes(athleteProfileId);
    if (userHasFullAccess) {
      // attributes.push('email', ) //TODO: add any restricted columns here
    }

    const profile = await db.tables.AthleteProfiles.findByPk(athleteProfileId, {
      attributes: attributes,
    });

    if (!profile) {
      return res.status(404).json({ ok: false, message: 'Athlete profile not found.' });
    }

    const isActiveMember = await isAthleteProfileActive(profile, db);

    // Get the appropriate ranking based on active status
    const cachedRank = await rankingCache.getRankingForAthlete(
      profile.id, 
      profile.gender, 
      isActiveMember ? 'active' : 'allTime'
    ) || undefined;
    
    // Get the highest PR using the dedicated function
    const highestPr = await getPersonalBest(profile.id, db);
    
    // Get the largest pole used in PRs
    const largestPole = await db.tables.PersonalRecords.findOne({
      where: { athleteProfileId: profile.id },
      include: [
        {
          model: db.tables.Jumps,
          as: 'jump',
          attributes: ['poleLengthInches', 'poleWeight'],
        },
      ],
      order: [[{ model: db.tables.Jumps, as: 'jump' }, 'poleLengthInches', 'DESC']],
    });

    // Get medal counts for this profile
    const medalCountsMap = await getMedalCountsForProfiles([profile.id], db);
    const medalCounts = medalCountsMap.get(profile.id) || { gold: 0, silver: 0, bronze: 0 };

    const athleteProfile = {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      gender: profile.gender,
      dob: profile.dob,
      profileImage: profile.profileImageVerified ? profile.profileImage : undefined,
      backgroundImage: profile.backgroundImageVerified ? profile.backgroundImage : undefined,
      nationality: profile.nationality,
      stats: {
        height: profile.height,
        weight: profile.weight,
        age: helpers.calculateAge(profile.dob),
        rank: cachedRank,
        pr: highestPr,
        largestPole: largestPole?.jump ? {
          lengthInches: largestPole.jump.poleLengthInches,
          weight: largestPole.jump.poleWeight,
        } : undefined,
        medalCounts,
      },
      isActiveMember,
      userId: profile.userId,
      athleteId: profile.athleteId,
      alwaysActiveOverride: profile.alwaysActiveOverride, // Only used for editing profile.
    };

    // Only query for athlete if we have an athleteId
    const foundAthlete = profile.athleteId 
      ? await db.tables.Athletes.findByPk(profile.athleteId)
      : null;

    if (!foundAthlete) {
      res.json({ok: true, message: 'found athlete profile', athleteProfile});
      return;
    }
    if (userHasFullAccess) {
      athleteProfile.contactInfo = foundAthlete.email;
      athleteProfile.emrgencyContactInfo = foundAthlete.emergencyContactMDN;
    }

    res.json({ ok: true, athleteProfile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Failed to fetch athlete profile.' });
  }
};

const deleteProfile = async (req, res, db) => {
  console.log('delete profile');
  res.status(500).json({ ok: false, message: 'Not implemented' });
};

const getProfiles = async (req, res, db) => {
  try {
    const { userId, athleteProfileIds, search } = req.query;
    
    // Validate inputs
    if (userId && !helpers.isValidId(parseInt(userId))) {
      return res.status(400).json({ ok: false, message: 'Invalid user ID' });
    }

    if (athleteProfileIds) {
      const ids = athleteProfileIds.split(',').map(id => parseInt(id, 10));
      if (ids.some(id => !helpers.isValidId(id))) {
        return res.status(400).json({ ok: false, message: 'Invalid athlete profile ID in list' });
      }
    }

    // Build where clause
    let whereClause = {};
    if (userId) {
      whereClause.userId = parseInt(userId);
    }
    if (athleteProfileIds) {
      const ids = athleteProfileIds.split(',').map(id => parseInt(id, 10));
      whereClause.id = {
        [db.tables.schema.Sequelize.Op.in]: ids
      };
    }

    // Add search conditions if search term exists
    if (search) {
      const searchTerm = search.toLowerCase();
      whereClause[db.tables.schema.Sequelize.Op.or] = [
        db.tables.schema.Sequelize.where(
          db.tables.schema.Sequelize.fn('LOWER', db.tables.schema.Sequelize.col('firstName')),
          { [db.tables.schema.Sequelize.Op.like]: `%${searchTerm}%` }
        ),
        db.tables.schema.Sequelize.where(
          db.tables.schema.Sequelize.fn('LOWER', db.tables.schema.Sequelize.col('lastName')),
          { [db.tables.schema.Sequelize.Op.like]: `%${searchTerm}%` }
        ),
        // Search in full name (for cases like "John Do")
        db.tables.schema.Sequelize.where(
          db.tables.schema.Sequelize.fn(
            'LOWER',
            db.tables.schema.Sequelize.fn(
              'concat',
              db.tables.schema.Sequelize.col('firstName'),
              ' ',
              db.tables.schema.Sequelize.col('lastName')
            )
          ),
          { [db.tables.schema.Sequelize.Op.like]: `%${searchTerm}%` }
        )
      ];
    }

    const profiles = await db.tables.AthleteProfiles.findAll({
      where: whereClause,
    });

    // Get medal counts for all profiles in bulk
    // const profileIdsForMedals = profiles.map(profile => profile.id);
    // const medalCountsMap = await getMedalCountsForProfiles(profileIdsForMedals, db);

    const athleteProfiles = profiles.map(profile => {
      // const medalCounts = medalCountsMap.get(profile.id) || { gold: 0, silver: 0, bronze: 0 };
      
      return {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        gender: profile.gender,
        dob: profile.dob,
        profileImage: profile.profileImageVerified ? profile.profileImage : undefined,
        backgroundImage: profile.backgroundImageVerified ? profile.backgroundImage : undefined,
        nationality: profile.nationality,
        stats: {
          height: profile.height,
          weight: profile.weight,
          age: helpers.calculateAge(profile.dob),
          // medalCounts,
        },
        alwaysActiveOverride: profile.alwaysActiveOverride,
        userId: profile.userId,
        athleteId: profile.athleteId
      };
    });

    res.json({ ok: true, athleteProfiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Failed to fetch athlete profiles' });
  }
};

const getRankedProfiles = async (req, res, db) => {
  const user = req.user;

  try {
    const { gender, allTime: allTimeStr, offset: offsetStr = '0', limit: limitStr = '20', search } = req.query;
    const allTime = allTimeStr !== 'false'; // Convert string to boolean
    const offset = parseInt(offsetStr, 10);
    const limit = parseInt(limitStr, 10);

    // Base where clause
    let whereClause = {};
    if (gender) {
      whereClause.gender = gender;
    }

    // Add search conditions if search term exists
    if (search) {
      const searchTerm = search.toLowerCase();
      whereClause[db.tables.schema.Sequelize.Op.or] = [
        db.tables.schema.Sequelize.where(
          db.tables.schema.Sequelize.fn('LOWER', db.tables.schema.Sequelize.col('firstName')),
          { [db.tables.schema.Sequelize.Op.like]: `%${searchTerm}%` }
        ),
        db.tables.schema.Sequelize.where(
          db.tables.schema.Sequelize.fn('LOWER', db.tables.schema.Sequelize.col('lastName')),
          { [db.tables.schema.Sequelize.Op.like]: `%${searchTerm}%` }
        ),
        // Search in full name (for cases like "John Do")
        db.tables.schema.Sequelize.where(
          db.tables.schema.Sequelize.fn(
            'LOWER',
            db.tables.schema.Sequelize.fn(
              'concat',
              db.tables.schema.Sequelize.col('firstName'),
              ' ',
              db.tables.schema.Sequelize.col('lastName')
            )
          ),
          { [db.tables.schema.Sequelize.Op.like]: `%${searchTerm}%` }
        )
      ];
    }

    // Only query purchases and add active status conditions if not requesting all time
    let athleteActiveStatus = new Map();
    if (!allTime) {
      // Get current quarter info
      const currentQuarter = helpers.getCurrentQuarter();
      const currentYear = new Date().getFullYear();

      // Get all purchases for the current quarter
      const purchases = await db.tables.Purchases.findAll({
        where: {
          quarter: currentQuarter
        }
      });

      // Create a map of athleteId to active status
      purchases.forEach(purchase => {
        const purchaseYear = new Date(purchase.createdAt).getFullYear();
        let isActive = false;

        // Special handling for winter quarter which spans years
        if (currentQuarter === 'winter') {
          isActive = purchaseYear === currentYear || purchaseYear + 1 === currentYear;
        } else {
          isActive = purchaseYear === currentYear;
        }

        if (isActive) {
          athleteActiveStatus.set(purchase.athleteId, true);
        }
      });

      // Define active member conditions
      const activeMemberConditions = {
        [db.tables.schema.Sequelize.Op.or]: [
          { alwaysActiveOverride: true },
          {
            athleteId: {
              [db.tables.schema.Sequelize.Op.in]: Array.from(athleteActiveStatus.keys())
            }
          }
        ]
      };

      // If we already have search conditions, we need to combine them with active status
      if (whereClause[db.tables.schema.Sequelize.Op.or]) {
        whereClause[db.tables.schema.Sequelize.Op.and] = [
          { [db.tables.schema.Sequelize.Op.or]: whereClause[db.tables.schema.Sequelize.Op.or] },
          activeMemberConditions
        ];
        delete whereClause[db.tables.schema.Sequelize.Op.or];
      } else {
        whereClause[db.tables.schema.Sequelize.Op.or] = activeMemberConditions[db.tables.schema.Sequelize.Op.or];
      }
    }

    // Build the rank subquery to get actual global rank
    const activeAthleteIds = Array.from(athleteActiveStatus.keys());
    const activeAthleteIdsClause = activeAthleteIds.length > 0 
      ? `OR ap2.athleteId IN (${activeAthleteIds.join(',')})` 
      : '';

    const rankSubquery = `
      (SELECT COUNT(*) + 1
       FROM athleteProfiles AS ap2
       WHERE ap2.id != athleteProfile.id
       AND (
         SELECT COALESCE(MAX(j2.heightInches), 0)
         FROM personalRecords AS pr2
         INNER JOIN jumps AS j2 ON pr2.jumpId = j2.id
         WHERE pr2.athleteProfileId = ap2.id
       ) > (
         SELECT COALESCE(MAX(j1.heightInches), 0)
         FROM personalRecords AS pr1
         INNER JOIN jumps AS j1 ON pr1.jumpId = j1.id
         WHERE pr1.athleteProfileId = athleteProfile.id
       )
       ${gender ? `AND ap2.gender = '${gender}'` : ''}
       ${!allTime ? `
       AND (ap2.alwaysActiveOverride = true ${activeAthleteIdsClause})` : ''}
      )`;

    // Build total count subquery (without search filters)
    const totalCountSubquery = `
      (SELECT COUNT(*)
       FROM athleteProfiles AS ap3
       WHERE 1=1
       ${gender ? `AND ap3.gender = '${gender}'` : ''}
       ${!allTime ? `
       AND (ap3.alwaysActiveOverride = true ${activeAthleteIdsClause})` : ''}
      )`;

    // Use findAndCountAll instead of separate queries
    const { count: totalCount, rows: profilesWithPRs } = await db.tables.AthleteProfiles.findAndCountAll({
      where: whereClause,
      attributes: [
        'id', 'firstName', 'lastName',
        'nationality', 'dob', 'height',
        'weight', 'profileImage', 'backgroundImage',
        'gender', 'profileImageVerified', 'backgroundImageVerified',
        'alwaysActiveOverride', 'athleteId', 'userId',
        [db.tables.schema.literal(rankSubquery), 'actualRank'],
        [db.tables.schema.literal(totalCountSubquery), 'totalCount']
      ],
      include: [
        {
          model: db.tables.PersonalRecords,
          as: 'personalRecords',
          attributes: ['stepNum'],
          include: [
            {
              model: db.tables.Jumps,
              as: 'jump',
              attributes: ['heightInches'],
            },
          ],
        },
      ],
      order: [
        [
          db.tables.schema.literal(`
            (SELECT MAX(j.heightInches)
             FROM personalRecords AS pr
             INNER JOIN jumps AS j ON pr.jumpId = j.id
             WHERE pr.athleteProfileId = athleteProfile.id)`),
          'DESC',
        ],
      ],      
      limit,
      offset,
    });

    // Get medal counts for all profiles in bulk
    const profileIdsForMedals = profilesWithPRs.map(profile => profile.id);
    const medalCountsMap = await getMedalCountsForProfiles(profileIdsForMedals, db);

    // Map the data into a structured response
    const athletes = profilesWithPRs.map((profile, index) => {
      // Find the best PR from the included personalRecords and jumps
      const bestPR = profile.personalRecords.reduce((max, record) => {
        const jumpHeight = record.jump ? record.jump.heightInches : 0;
        return jumpHeight > max ? jumpHeight : max;
      }, 0);

      // Determine active status
      const isActiveMember = profile.alwaysActiveOverride || 
                      (profile.athleteId && athleteActiveStatus.get(profile.athleteId));

      // Get medal counts for this profile
      const medalCounts = medalCountsMap.get(profile.id) || { gold: 0, silver: 0, bronze: 0 };

      return {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        gender: profile.gender,
        nationality: profile.nationality,
        dob: profile.dob,
        profileImage: profile.profileImageVerified ? profile.profileImage : undefined,
        backgroundImage: profile.backgroundImage ? profile.backgroundImage : undefined,
        stats: {
          height: profile.height,
          weight: profile.weight,
          age: helpers.calculateAge(profile.dob),
          rank: profile.getDataValue('actualRank') || 1,
          pr: bestPR,
          largestPole: undefined,
          medalCounts,
        },
        isActiveMember,
        userId: profile.userId,
        athleteId: profile.athleteId,
        alwaysActiveOverride: profile.alwaysActiveOverride,
      };
    });

    // Get the total count from the first result (all results will have the same value)
    const accurateTotalCount = profilesWithPRs.length > 0 ? profilesWithPRs[0].getDataValue('totalCount') : 0;
    const hasMore = offset + athletes.length < accurateTotalCount;

    res.json({ 
      ok: true, 
      athletes,
      hasMore,
      totalCount: accurateTotalCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Failed to fetch athlete profiles' });
  }
};

const getRegisteredAthletesForUser = async (req, res, db) => {
  try {
    const userId = parseInt(req.query.userId);
    if (!helpers.isValidId(userId)) {
      return res.status(400).json({ ok: false, message: 'Invalid user ID' });
    }

    // Get all athletes belonging to this user
    const athletes = await db.tables.Athletes.findAll({
      where: { userId },
      attributes: [
        'id', 'firstName', 'lastName', 'email',
        'emergencyContactName', 'emergencyContactRelation',
        'emergencyContactMDN', 'school', 'state',
        'usatf', 'gender', 'medConditions', 'dob', 'userId'
      ]
    });

    // If available=true in query, filter out athletes already associated with profiles
    if (req.query.available === 'true') {
      const athleteProfileId = parseInt(req.query.includingProfileId);
      
      // Get the athlete ID associated with the specified profile if it exists
      let currentProfileAthleteId = null;
      if (helpers.isValidId(athleteProfileId)) {
        const currentProfile = await db.tables.AthleteProfiles.findByPk(athleteProfileId, {
          attributes: ['athleteId']
        });
        if (currentProfile) {
          currentProfileAthleteId = currentProfile.athleteId;
        }
      }

      const usedAthleteIds = await db.tables.AthleteProfiles.findAll({
        where: { 
          userId,
          athleteId: { [db.tables.schema.Sequelize.Op.not]: null }
        },
        attributes: ['athleteId']
      });

      const usedIds = new Set(usedAthleteIds.map(p => p.athleteId));
      // If there's a current profile athlete ID, remove it from the usedIds set
      if (currentProfileAthleteId) {
        usedIds.delete(currentProfileAthleteId);
      }
      
      const availableAthletes = athletes.filter(athlete => !usedIds.has(athlete.id));
      return res.json({ ok: true, athletes: availableAthletes });
    }

    res.json({ ok: true, athletes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Failed to fetch registered athletes' });
  }
};

const getMedalCountsForProfile = async (req, res, db) => {
  try {
    const athleteProfileId = parseInt(req.query.athleteProfileId);
    if (!helpers.isValidId(athleteProfileId)) {
      return res.status(400).json({ ok: false, message: 'Invalid athlete profile ID' });
    }

    // Use the helper function to get medal counts
    const medalCountsMap = await getMedalCountsForProfiles([athleteProfileId], db);
    const counts = medalCountsMap.get(athleteProfileId) || { gold: 0, silver: 0, bronze: 0 };

    res.json({ ok: true, medalCounts: counts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Failed to fetch medal counts' });
  }
};

async function getRegisteredAthlete(req, res, db) {
  try {
    const athleteId = parseInt(req.query.athleteId);
    if (!helpers.isValidId(athleteId)) {
      return res.status(400).json({ ok: false, message: 'Invalid athlete ID' });
    }

    const athlete = await db.tables.Athletes.findByPk(athleteId);
    if (!athlete) {
      return res.status(404).json({ ok: false, message: 'Athlete not found' });
    }

    res.json({ ok: true, athlete, message: 'found athlete' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Failed to fetch athlete' });
  }
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

  // Check for active purchase
  const activePurchase = await db.tables.Purchases.findOne({
    where: {
      athleteId: athleteProfile.athleteId,
      quarter: currentQuarter
    }
  });

  if (!activePurchase) {
    return false;
  }

  // Check if purchase is for current year
  const purchaseYear = new Date(activePurchase.createdAt).getFullYear();
  
  // Special handling for winter quarter which spans years
  if (currentQuarter === 'winter') {
    return purchaseYear === currentYear || purchaseYear + 1 === currentYear;
  }
  
  return purchaseYear === currentYear;
}

// Helper function to get medal counts for multiple athlete profiles
async function getMedalCountsForProfiles(athleteProfileIds, db) {
  if (!athleteProfileIds || athleteProfileIds.length === 0) {
    return new Map();
  }

  const medalCounts = await db.tables.Jumps.findAll({
    where: {
      athleteProfileId: { [db.tables.schema.Sequelize.Op.in]: athleteProfileIds },
      meetType: { [db.tables.schema.Sequelize.Op.ne]: null }, // meetType is not null (championship)
      placement: { [db.tables.schema.Sequelize.Op.in]: [1, 2, 3] }, // Only count placements 1, 2, or 3
      verified: true // Only count verified jumps
    },
    attributes: [
      'athleteProfileId',
      [db.tables.schema.Sequelize.fn('COUNT', db.tables.schema.Sequelize.col('id')), 'count'],
      'placement'
    ],
    group: ['athleteProfileId', 'placement']
  });

  // Create a map of athleteProfileId to medal counts
  const medalCountsMap = new Map();
  
  // Initialize all profiles with zero counts
  athleteProfileIds.forEach(id => {
    medalCountsMap.set(id, { gold: 0, silver: 0, bronze: 0 });
  });

  // Update counts based on query results
  medalCounts.forEach(medal => {
    const profileId = medal.athleteProfileId;
    const count = parseInt(medal.getDataValue('count'));
    const currentCounts = medalCountsMap.get(profileId) || { gold: 0, silver: 0, bronze: 0 };
    
    switch (medal.placement) {
      case 1:
        currentCounts.gold = count;
        break;
      case 2:
        currentCounts.silver = count;
        break;
      case 3:
        currentCounts.bronze = count;
        break;
    }
    
    medalCountsMap.set(profileId, currentCounts);
  });

  return medalCountsMap;
}

module.exports = { 
  upsertProfile, 
  getProfile, 
  deleteProfile, 
  getRankedProfiles,
  getProfiles,
  getRegisteredAthletesForUser,
  getMedalCountsForProfile,
  isAthleteProfileActive,
  getRegisteredAthlete,
  getMedalCountsForProfiles,
};