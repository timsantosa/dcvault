const helpers = require('../lib/helpers');
const rankingCache = require('./athleteRankingCache');
const { getPersonalBest } = require('./jumpsController');


async function upsertProfile(req, res, db) {
  try {
    const userSendingRequest = req.user;
    const newProfileData = req.body.athleteProfile;
    const athleteIdToUpdate = req.body.athleteProfileId;
    const userIdToCreateFor = req.body.userId;


    // either an athleteProfId needs to passed in for updating, or 
    // a userId must be used for creating new profiles
    if (!athleteIdToUpdate && !userIdToCreateFor) {
      return res.status(400).json({ ok: false, message: 'User or athlete not specified' });
    }

    // Check for required fields
    if (!newProfileData || !newProfileData.firstName || !newProfileData.lastName || !newProfileData.dob || !newProfileData.gender) {
      return res.status(400).json({ ok: false, message: 'Missing required fields' });
    }

    const query = athleteIdToUpdate
      ? { where: { id: athleteIdToUpdate } } // Find profile by athleteProfileId (for updates)
      : { where: { userId: userIdToCreateFor } }; // Find profile by userId (for creation)

    // Maybe consider using upsert?
    const existingProfile = await db.tables.AthleteProfiles.findOne(query);

    if (existingProfile) {
      // Update existing profile
      await existingProfile.update({
        firstName: newProfileData.firstName,
        lastName: newProfileData.lastName,
        dob: newProfileData.dob,
        nationality: newProfileData.nationality,
        height: newProfileData.height,
        weight: newProfileData.weight,
        gender: newProfileData.gender,
      });

      console.log(`Profile updated successfully with id ${existingProfile.id}`);
      return res.status(200).json({
        ok: true,
        message: "Profile updated.",
      });
    }

    // If profile does not exist, create a new one
    const athleteProfileData = {
      firstName: newProfileData.firstName,
      lastName: newProfileData.lastName,
      dob: newProfileData.dob,
      nationality: newProfileData.nationality ?? 'US',
      height: newProfileData.height,
      weight: newProfileData.weight,
      userId: userIdToCreateFor,
      gender: newProfileData.gender,
    };

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
      return res.status(403).json({ ok: false, message: 'Invalid athlete profile ID.' });
    }

    let attributes = ['id', 'firstName', 'lastName', 'nationality', 'dob', 'height', 'weight', 'profileImage', 'backgroundImage', 'gender', 'profileImageVerified', 'backgroundImageVerified', 'isActiveMember'];
    const userHasFullAccess = user.isAdmin || user.athleteProfileId == athleteProfileId;
    if (userHasFullAccess) {
      // attributes.push('email', ) //TODO: add any restricted columns here
    }

    // TODO: Don't need all this, can use cache to retrieve the PR
    // Query to fetch AthleteProfile with their best PR
    const profileWithPR = await db.tables.AthleteProfiles.findOne({
      where: { id: athleteProfileId },
      attributes: attributes,
      include: [
        {
          model: db.tables.PersonalRecords,
          as: 'personalRecords',
          attributes: ['stepNum'],
          required: false, // Ensures athleteProfile is returned even if no personalRecords exist
          include: [
            {
              model: db.tables.Jumps,
              as: 'jump',
              attributes: ['heightInches', 'poleLengthInches', 'poleWeight'],
            },
          ],
          where: db.tables.schema.literal(
            `(personalRecords.jumpId IS NULL OR personalRecords.jumpId = (
              SELECT id FROM jumps 
              WHERE jumps.id = personalRecords.jumpId 
              ORDER BY jumps.heightInches DESC 
              LIMIT 1
            ))`
          ),
        },
      ],
    });



    // const profileWithPRs = await db.tables.AthleteProfiles.findOne({
    //   where: { id: athleteProfileId },
    //   attributes: attributes,
    //   include: [
    //     {
    //       model: db.tables.PersonalRecords,
    //       as: 'personalRecords',
    //       attributes: ['stepNum'],
    //       include: [
    //         {
    //           model: db.tables.Jumps,
    //           as: 'jump',
    //           attributes: ['heightInches', 'poleLengthInches', 'poleWeight'], // Include the PR height and pole
    //         },
    //       ],
    //     },
    //   ],
    //   order: [
    //     [db.tables.schema.literal(
    //       `(SELECT MAX(jumps.heightInches) 
    //         FROM personalRecords AS pr 
    //         INNER JOIN jumps ON pr.jumpId = jumps.id 
    //         WHERE pr.athleteProfileId = AthleteProfile.id)`
    //     ),
    //     'DESC'],
    //   ],
    // });

    if (!profileWithPR) {
      return res.status(404).json({ ok: false, message: 'Athlete profile not found.' });
    }

    const cachedRank = await rankingCache.getRankingForAthlete(profileWithPR.id, profileWithPR.gender) || undefined;
    
    const largestPole = (profileWithPR.poleLengthInches && profileWithPR.poleWeight) ? {
      lengthInches: profileWithPR.poleLengthInches,
      weight: profileWithPR.poleWeight,
    } : undefined

    const athleteProfile = {
      id: profileWithPR.id,
      firstName: profileWithPR.firstName,
      lastName: profileWithPR.lastName,
      gender: profileWithPR.gender,
      dob: profileWithPR.dob,
      profileImage: profileWithPR.profileImageVerified ? profileWithPR.profileImage : undefined,
      backgroundImage: profileWithPR.backgroundImageVerified ? profileWithPR.backgroundImage : undefined,
      nationality: profileWithPR.nationality,
      stats: {
        height: profileWithPR.height,
        weight: profileWithPR.weight,
        age: helpers.calculateAge(profileWithPR.dob),
        rank: cachedRank,
        pr: profileWithPR.heightInches,
        largestPole,
      },
      isActiveMember: profileWithPR.isActiveMember,
    };

    // TODO: Get from athlete table
    const foundAthlete = await db.tables.Athletes.findOne({where: {userId: user.id}});
    if (!foundAthlete) {
      // TODO: Indicate athlete is not currently signed up
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
  res.json({ ok: false, message: 'Not implemented' });
};

const getProfiles = async (req, res, db) => {
  // User should have been added to request via JWT Authentication
  const user = req.user;

  try {
    const { gender, allTime, page = 1, limit } = req.query; // Optional filters and pagination
    var offset = 0;
    if (limit) {
      offset = (page - 1) * limit;
    }

    // Query to fetch AthleteProfiles with their best PR
    let whereClause = gender ? { gender: gender } : {}; // Filter by gender if provided
    if (gender) {
      whereClause.gender = gender;
    }
    if (!allTime) {
      where.isActiveMember = true
    }
    const profilesWithPRs = await db.tables.AthleteProfiles.findAll({
      where: whereClause,
      attributes: ['id', 'firstName', 'lastName', 'nationality', 'dob', 'height', 'weight', 'profileImage', 'backgroundImage', 'gender', 'profileImageVerified', 'backgroundImageVerified', 'isActiveMember'],
      include: [
        {
          model: db.tables.PersonalRecords,
          as: 'personalRecords',
          attributes: ['stepNum'],
          include: [
            {
              model: db.tables.Jumps,
              as: 'jump',
              attributes: ['heightInches'], // Include the PR height
            },
          ],
        },
      ],
      order: [
        [db.tables.schema.literal(`
          (SELECT MAX(jumps.heightInches)
          FROM personalRecords AS pr 
          INNER JOIN jumps ON pr.jumpId = jumps.id 
          WHERE pr.athleteProfileId = AthleteProfile.id)`), 'DESC'],
      ],
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: parseInt(offset, 10),
    });

    // Map the data into a structured response
    const athletes = profilesWithPRs.map((profile, index) => {
      // Find the best PR from the included personalRecords and jumps
      const bestPR = profile.personalRecords.reduce((max, record) => {
        const jumpHeight = record.jump ? record.jump.heightInches : 0;
        return jumpHeight > max ? jumpHeight : max;
      }, 0);

      return {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        nationality: profile.nationality,
        dob: profile.dob,
        profileImage: profile.profileImageVerified ? profile.profileImage : undefined,
        backgroundImage: profile.backgroundImage ? profile.backgroundImage : undefined,
        stats: {
          height: profile.height,
          weight: profile.weight,
          age: helpers.calculateAge(profile.dob),
          rank: offset + index + 1, // Rank within the current page
          pr: bestPR,
          largestPole: undefined, // TODO: Add this if needed
        },
        isActiveMember: profile.isActiveMember,
      };
    });

    res.json({ ok: true, athletes, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Failed to fetch athlete profiles' });
  }
};

const getLatestAthlete = (req, res, db) => {
  const user = req.user;
  // If no user id is specified, default to the user sending the request.
  let userId = req.query.userId ?? user.id;
  if (!userId) {
    res.status(403).json({ok: false, message: 'Invalid user.'});
    return
  }

  db.tables.Athletes.findOne({where: {userId: userId}}).then((athlete) => {
    if (!athlete) {
      res.json({ok: true, message: 'No athlete found associated with user'});
      return;
    }
    res.json({ok: true, message: 'found athlete', athlete});
  }).catch(err => {
    res.status(500).json({ok: false, message: 'Server error', error: err.message});
  });
};

module.exports = { upsertProfile, getProfile, deleteProfile, getProfiles, getLatestAthlete }