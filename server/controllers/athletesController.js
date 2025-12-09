const helpers = require('../lib/helpers');
const rankingCache = require('./athleteRankingCache');
const { getPersonalBest } = require('./jumpsController');
const { getBestOfPersonalRecords, sortProfilesByPR, isAthleteProfileActive, isPurchaseActiveForCurrentYear } = require('../utils/rankingUtils');
const { athleteProfileBelongsToUser } = require('../middlewares/mobileAuthMiddleware');
const NotificationUtils = require('../utils/notificationUtils');

async function createProfile(req, res, db) {
  try {
    const userSendingRequest = req.user;
    const newProfileData = req.body.athleteProfile;
    const userIdToCreateFor = req.query.userId;

    if (!userIdToCreateFor) {
      return res.status(400).json({ ok: false, message: 'User ID is required for creating a profile' });
    }

    // Handle -1 as null userId for standalone profiles
    const actualUserId = userIdToCreateFor === '-1' ? null : userIdToCreateFor;

    // Check for required fields
    if (!newProfileData || !newProfileData.firstName || !newProfileData.lastName || !newProfileData.dob || !newProfileData.gender) {
      return res.status(400).json({ ok: false, message: 'Missing required fields' });
    }

    // Check if there's already a profile with the same first name, last name, and birthday for this user (case-insensitive for names)
    const existingProfile = await db.tables.AthleteProfiles.findOne({
      where: {
        // userId: actualUserId, // TODO: Should we check for the same user?
        dob: newProfileData.dob,
        [db.tables.schema.Sequelize.Op.and]: [
          db.tables.schema.Sequelize.where(
            db.tables.schema.Sequelize.fn('LOWER', db.tables.schema.Sequelize.col('firstName')),
            (newProfileData.firstName || '').toLowerCase()
          ),
          db.tables.schema.Sequelize.where(
            db.tables.schema.Sequelize.fn('LOWER', db.tables.schema.Sequelize.col('lastName')),
            (newProfileData.lastName || '').toLowerCase()
          )
        ]
      }
    });

    if (existingProfile) {
      return res.status(400).json({ 
        ok: false, 
        message: 'A profile with the same first name, last name, and birthday already exists for this user' 
      });
    }

    if (newProfileData.associatedAthleteId) {
      const existingProfile = await db.tables.AthleteProfiles.findOne({
        where: { athleteId: newProfileData.associatedAthleteId }
      });
      if (existingProfile) {
        return res.status(400).json({ 
          ok: false, 
          message: 'The athleteId is already associated with another profile' 
        });
      }
    }

    let athleteProfileData = {
      firstName: newProfileData.firstName.trim(),
      lastName: newProfileData.lastName.trim(),
      dob: newProfileData.dob,
      nationality: newProfileData.nationality ?? 'US',
      height: newProfileData.height,
      weight: newProfileData.weight,
      gender: newProfileData.gender,
      athleteId: newProfileData.associatedAthleteId,
      alwaysActiveOverride: newProfileData.alwaysActiveOverride ?? false, // TODO: This is flawed logic, should be removed.
      userId: actualUserId
    }

    if (userSendingRequest.permissions?.includes('manage_active_profiles')) {
      athleteProfileData.alwaysActiveOverride = newProfileData.alwaysActiveOverride;
    }

    const newProfile = await db.tables.AthleteProfiles.create(athleteProfileData);
    console.log(`Profile created successfully with id ${newProfile.id}`);
    
    // Notify users with manage_roles permission about the new profile
    try {
      const profileName = `${newProfile.firstName} ${newProfile.lastName}`;
      await NotificationUtils.notifyAdminsOfNewProfile(
        newProfile.id,
        userSendingRequest.id,
        profileName
      );
    } catch (notificationError) {
      // Log error but don't fail profile creation if notification fails
      console.error('Error sending notification for new profile:', notificationError);
    }
    
    return res.status(201).json({ ok: true, message: "Profile Created", athleteProfileId: newProfile.id });

  } catch (error) {
    console.error('Error in createProfile:', error);
    return res.status(500).json({ ok: false, message: 'Server error', error: error.message });
  }
}

async function updateProfile(req, res, db) {
  try {
    const userSendingRequest = req.user;
    const newProfileData = req.body.athleteProfile;
    const athleteProfileIdToUpdate = parseInt(req.query.athleteProfileId);

    if (!athleteProfileIdToUpdate) {
      return res.status(400).json({ ok: false, message: 'Athlete profile ID is required for updating a profile' });
    }

    // Check for required fields
    if (!newProfileData || !newProfileData.firstName || !newProfileData.lastName || !newProfileData.dob || !newProfileData.gender) {
      return res.status(400).json({ ok: false, message: 'Missing required fields' });
    }

    const existingProfile = await db.tables.AthleteProfiles.findOne({
      where: { id: athleteProfileIdToUpdate }
    });

    if (!existingProfile) {
      return res.status(404).json({ ok: false, message: 'Athlete profile not found' });
    }

    if (newProfileData.associatedAthleteId) {
      const existingProfile = await db.tables.AthleteProfiles.findOne({
        where: { athleteId: newProfileData.associatedAthleteId }
      });
      if (existingProfile && existingProfile.id !== athleteProfileIdToUpdate) {
        return res.status(400).json({ 
          ok: false, 
          message: 'The athleteId is already associated with another profile' 
        });
      }
    }

    let athleteProfileData = {
      firstName: newProfileData.firstName.trim(),
      lastName: newProfileData.lastName.trim(),
      dob: newProfileData.dob,
      nationality: newProfileData.nationality ?? 'US',
      height: newProfileData.height,
      weight: newProfileData.weight,
      gender: newProfileData.gender,
      athleteId: newProfileData.associatedAthleteId,
      alwaysActiveOverride: newProfileData.alwaysActiveOverride ?? false, // TODO: This is flawed logic, should be removed.
    }

    if (userSendingRequest.permissions?.includes('manage_active_profiles')) {
      athleteProfileData.alwaysActiveOverride = newProfileData.alwaysActiveOverride;
    }

    // Update existing profile
    await existingProfile.update(athleteProfileData);

    console.log(`Profile updated successfully with id ${existingProfile.id}`);
    return res.status(200).json({
      ok: true,
      message: "Profile updated.",
    });

  } catch (error) {
    console.error('Error in updateProfile:', error);
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
    const userHasFullAccess = athleteProfileBelongsToUser(athleteProfileId, user) || user.permissions?.includes('view_contact_info');
    if (userHasFullAccess) {
      // attributes.push('email', ) //TODO: add any restricted columns here
    }

    const profile = await db.tables.AthleteProfiles.findByPk(athleteProfileId, {
      attributes: attributes,
    });

    if (!profile) {
      return res.status(404).json({ ok: false, message: 'Athlete profile not found.' });
    }

    // Before checking if profile is active, try to auto assign an athleteId if it doesn't have one
    if (!profile.athleteId) {
      await autoAssignAthleteId(profile, db);
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
        pr: highestPr, // Object containing height and jump id
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
      athleteProfile.email = foundAthlete.email;
      athleteProfile.notificationsEmail = foundAthlete.notifications;
      athleteProfile.usatf = foundAthlete.usatf;
      athleteProfile.emergencyContactMDN = foundAthlete.emergencyContactMDN;
      athleteProfile.emergencyContactRelation = foundAthlete.emergencyContactRelation;
      athleteProfile.emergencyContactName = foundAthlete.emergencyContactName;
    }

    res.json({ ok: true, athleteProfile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Failed to fetch athlete profile.' });
  }
};

const deleteProfile = async (req, res, db) => {
  try {
    const userSendingRequest = req.user;
    const athleteProfileId = parseInt(req.query.athleteProfileId);

    if (!athleteProfileId || !helpers.isValidId(athleteProfileId)) {
      return res.status(400).json({ ok: false, message: 'Invalid athlete profile ID' });
    }

    // Check if the profile exists
    const existingProfile = await db.tables.AthleteProfiles.findByPk(athleteProfileId);
    if (!existingProfile) {
      return res.status(404).json({ ok: false, message: 'Athlete profile not found' });
    }

    // Use a transaction to ensure all deletions happen atomically
    const transaction = await db.tables.schema.transaction();

    try {
      // Delete in the correct order to avoid foreign key constraint violations
      
      // 1. Delete PersonalRecords first (they reference both Jumps and AthleteProfiles)
      await db.tables.PersonalRecords.destroy({
        where: { athleteProfileId },
        transaction
      });

      // 2. Delete Jumps (they reference AthleteProfiles)
      await db.tables.Jumps.destroy({
        where: { athleteProfileId },
        transaction
      });

      // 3. Delete Drills (they reference AthleteProfiles)
      await db.tables.Drills.destroy({
        where: { athleteProfileId },
        transaction
      });

      // 4. Finally delete the AthleteProfile
      await db.tables.AthleteProfiles.destroy({
        where: { id: athleteProfileId },
        transaction
      });

      // Commit the transaction
      await transaction.commit();

      // Regenerate rankings since an athlete profile was deleted
      try {
        await rankingCache.regenerateAllRankings();
        console.log('Rankings regenerated after athlete profile deletion');
      } catch (rankingError) {
        console.error('Error regenerating rankings after profile deletion:', rankingError);
        // Don't fail the deletion if ranking regeneration fails
      }

      console.log(`Athlete profile ${athleteProfileId} deleted successfully`);
      return res.status(200).json({ 
        ok: true, 
        message: 'Athlete profile deleted successfully' 
      });

    } catch (error) {
      // Rollback the transaction if any error occurs
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error in deleteProfile:', error);
    return res.status(500).json({ ok: false, message: 'Server error', error: error.message });
  }
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

// For now, we do the sorting in JavaScript. If we need to be more efficient,
// we should upgrade MySQL from 5.7 and do the sorting in SQL.
const getRankedProfiles = async (req, res, db) => {
  const user = req.user;

  try {
    const { gender, allTime: allTimeStr, offset: offsetStr = '0', limit: limitStr = '20', search } = req.query;
    const allTime = allTimeStr !== 'false'; // Convert string to boolean
    const offset = parseInt(offsetStr, 10);
    const limit = parseInt(limitStr, 10);

    // Helper function to build base where clause (without search filters)
    const buildBaseWhereClause = (athleteActiveStatus) => {
      const baseWhereClause = {};
      if (gender) {
        baseWhereClause.gender = gender;
      }
      
      if (!allTime) {
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
        Object.assign(baseWhereClause, activeMemberConditions);
      }
      return baseWhereClause;
    };

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

      // TODO: maybe get rid of this map and instead find distinct latest purchases for each athlete in sql?
      // Create a map of athleteId to active status
      // Group by athleteId and keep only the latest purchase for each athlete
      const latestPurchasesByAthlete = new Map();
      purchases.forEach(purchase => {
        const existing = latestPurchasesByAthlete.get(purchase.athleteId);
        if (!existing || new Date(purchase.createdAt) > new Date(existing.createdAt)) {
          latestPurchasesByAthlete.set(purchase.athleteId, purchase);
        }
      });

      // Check if each latest purchase is active for current year
      latestPurchasesByAthlete.forEach((purchase, athleteId) => {
        if (isPurchaseActiveForCurrentYear(purchase, currentQuarter, currentYear)) {
          athleteActiveStatus.set(athleteId, true);
        }
      });
    }

    // Build base where clause
    const baseWhereClause = buildBaseWhereClause(athleteActiveStatus);

    // Add search conditions if search term exists
    let whereClause = { ...baseWhereClause };
    if (search) {
      const searchTerm = search.toLowerCase();
      const searchConditions = [
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

      // Combine base conditions with search conditions using AND
      whereClause[db.tables.schema.Sequelize.Op.and] = [
        baseWhereClause,
        { [db.tables.schema.Sequelize.Op.or]: searchConditions }
      ];
    }

    // First, get all profiles that match the base criteria (without search) to calculate global rankings
    const allProfilesForRanking = await db.tables.AthleteProfiles.findAll({
      where: baseWhereClause,
      attributes: [
        'id', 'firstName', 'lastName',
        'nationality', 'dob', 'height',
        'weight', 'profileImage', 'backgroundImage',
        'gender', 'profileImageVerified', 'backgroundImageVerified',
        'alwaysActiveOverride', 'athleteId', 'userId',
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
              attributes: ['heightInches', 'date'],
            },
          ],
        },
      ],
    });

    // Sort the profiles in JavaScript to avoid MySQL 5.7 compatibility issues
    sortProfilesByPR(allProfilesForRanking);

    // Calculate global rankings
    const globalRankings = new Map();
    allProfilesForRanking.forEach((profile, index) => {
      globalRankings.set(profile.id, index + 1);
    });

    // Now get the profiles that match search criteria (if any)
    const { count: totalCount, rows: profilesWithPRs } = await db.tables.AthleteProfiles.findAndCountAll({
      where: whereClause,
      attributes: [
        'id', 'firstName', 'lastName',
        'nationality', 'dob', 'height',
        'weight', 'profileImage', 'backgroundImage',
        'gender', 'profileImageVerified', 'backgroundImageVerified',
        'alwaysActiveOverride', 'athleteId', 'userId',
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
              attributes: ['heightInches', 'date'],
            },
          ],
        },
      ],
      limit: null, // Get all matching results first
      offset: 0,
    });

    // Sort the search results by the same criteria as global rankings
    sortProfilesByPR(profilesWithPRs);

    // Apply pagination after sorting
    const paginatedProfiles = profilesWithPRs.slice(offset, offset + limit);

    // Get medal counts for all profiles in bulk
    const profileIdsForMedals = paginatedProfiles.map(profile => profile.id);
    const medalCountsMap = await getMedalCountsForProfiles(profileIdsForMedals, db);

    // Map the data into a structured response
    const athletes = paginatedProfiles.map((profile, index) => {
      // Find the best PR from the included personalRecords and jumps
      const pr = getBestOfPersonalRecords(profile.personalRecords);

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
          rank: globalRankings.get(profile.id) || 1,
          pr,
          largestPole: undefined,
          medalCounts,
        },
        isActiveMember,
        userId: profile.userId,
        athleteId: profile.athleteId,
        alwaysActiveOverride: profile.alwaysActiveOverride,
      };
    });

    // Get the total count for the base criteria (without search filters)
    const { count: accurateTotalCount } = await db.tables.AthleteProfiles.findAndCountAll({
      where: baseWhereClause,
    });
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


/**
 * Auto-assigns an athleteId to a profile if it doesn't have one.
 * Matches by userId, firstName, lastName, and dob to find a suitable athlete.
 * @param {Object} profile - The athlete profile to assign an athleteId to
 * @param {Object} db - Database connection object
 * @returns {Promise<Object>} - The updated profile (or original if no match found)
 */
async function autoAssignAthleteId(profile, db) {
  // Only proceed if profile has userId but no athleteId
  if (!profile.userId || profile.athleteId) {
    return profile;
  }

  try {
    // Find athletes with matching userId, firstName (case-insensitive), lastName (case-insensitive), and dob
    const matchingAthletes = await db.tables.Athletes.findAll({
      where: {
        userId: profile.userId,
        dob: profile.dob,
        [db.tables.schema.Sequelize.Op.and]: [
          db.tables.schema.Sequelize.where(
            db.tables.schema.Sequelize.fn('LOWER', db.tables.schema.Sequelize.col('firstName')),
            (profile.firstName || '').toLowerCase()
          ),
          db.tables.schema.Sequelize.where(
            db.tables.schema.Sequelize.fn('LOWER', db.tables.schema.Sequelize.col('lastName')),
            (profile.lastName || '').toLowerCase()
          )
        ]
      }
    });

    if (matchingAthletes.length === 0) {
      return profile;
    }

    // Check which athletes are already associated with other profiles
    const usedAthleteIds = await db.tables.AthleteProfiles.findAll({
      where: {
        athleteId: { [db.tables.schema.Sequelize.Op.not]: null },
        id: { [db.tables.schema.Sequelize.Op.ne]: profile.id } // Exclude current profile
      },
      attributes: ['athleteId']
    });

    const usedIds = new Set(usedAthleteIds.map(p => p.athleteId));

    // Find the first available athlete that matches
    const availableAthlete = matchingAthletes.find(athlete => !usedIds.has(athlete.id));

    if (availableAthlete) {
      // Update the profile with the athleteId
      await profile.update({ athleteId: availableAthlete.id });
      console.log(`Auto-assigned athleteId ${availableAthlete.id} to profile ${profile.id}`);
      // Reload to get updated data
      await profile.reload();
    }

    return profile;
  } catch (error) {
    console.error('Error in autoAssignAthleteId:', error);
    // Return original profile if there's an error
    return profile;
  }
}

// Helper function to get medal counts for multiple athlete profiles
async function getMedalCountsForProfiles(athleteProfileIds, db) {
  if (!athleteProfileIds || athleteProfileIds.length === 0) {
    return new Map();
  }

  const medalCounts = await db.tables.Jumps.findAll({
    where: {
      athleteProfileId: { [db.tables.schema.Sequelize.Op.in]: athleteProfileIds },
      meetType: { 
        [db.tables.schema.Sequelize.Op.and]: [
          { [db.tables.schema.Sequelize.Op.ne]: null }, // meetType is not null
          { [db.tables.schema.Sequelize.Op.ne]: '' }    // meetType is not empty string
        ]
      }, // meetType is not null and not empty (championship)
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

const refreshRankingCache = async (req, res, db) => {
  try {
    await rankingCache.regenerateAllRankings();
    return res.status(200).json({ 
      ok: true, 
      message: 'Ranking cache refreshed successfully' 
    });
  } catch (error) {
    console.error('Error refreshing ranking cache:', error);
    return res.status(500).json({ 
      ok: false, 
      message: 'Failed to refresh ranking cache', 
      error: error.message 
    });
  }
};

module.exports = {
  createProfile,
  updateProfile,
  getProfile, 
  deleteProfile, 
  getRankedProfiles,
  getProfiles,
  getRegisteredAthletesForUser,
  getMedalCountsForProfile,
  getRegisteredAthlete,
  getMedalCountsForProfiles,
  refreshRankingCache,
};