const helpers = require('../lib/helpers');
const { getPersonalBest } = require('./jumpsController');

// TODO: Combine update and create better
function updateProfile(athleteProfileId, req, res, db) {
  const userSendingRequest = req.user;

  let newProfileData = req.body.athleteProfile;
  // Check for required fields
  if (!newProfileData || !athleteProfileId) {
    res.status(403).json({ok: false, message: 'Missing required fields'});
    return;
  }
  
  db.tables.AthleteProfiles.findOne({where: {id: athleteProfileId}}).then((profileFound) => {
    // If no profile to update, return an error
    if (!profileFound) {
      res.status(403).send(JSON.stringify({ok: false, message: 'Athlete profile does not exist.'}));
      return;
    }

    let athleteProfileData = {
      firstName: newProfileData.firstName,
      lastName: newProfileData.lastName,
      dob: newProfileData.dob,
      nationality: newProfileData.nationality,
      height: newProfileData.height,
      weight: newProfileData.weight,
      gender: newProfileData.gender,
    };

    if (userSendingRequest.isAdmin) {

      // Admin can update anyone's profile
      profileFound.update(athleteProfileData).then(updatedProfile => {
        if (!updatedProfile) {
          res.status(500).send(JSON.stringify({ok: false, message: 'Failed to update athlete profile.'}));
          return 
        }
        console.log(`Profile updated successfully with id ${updatedProfile.id}`);
        res.status(200).send(JSON.stringify({ok: true, message: "Profile updated."}));
      }).catch(error => {
        console.log('Error while tryin to update profile:', error);
        res.status(500).send(JSON.stringify({ok: false, message: 'Failed to update athlete profile.'}));
      });
      return;
    }

    // If user sending request is not admin, then the user ids must match
    if (userSendingRequest.id != profileFound.userId) {
      let errorString = `User ${userSendingRequest.id} does not have permission to create an athleteProfile for user ${profileFound.userId}.`;
      console.log("Error: " + errorString);
      res.status(403).send(JSON.stringify({ok: false, message: errorString}));
      return;
    }
    // Otherwise, update athlete profile.
    profileFound.update(athleteProfileData).then(updatedProfile => {
      if (!updatedProfile) {
        res.status(500).send(JSON.stringify({ok: false, message: 'Failed to update athlete profile.'}));
        return 
      }
      console.log(`Profile updated successfully with id ${updatedProfile.id}`);
      res.status(200).send(JSON.stringify({ok: true, message: "Profile updated."}));
    }).catch(error => {
      console.log('Error while tryin to update profile:', error);
      res.status(500).send(JSON.stringify({ok: false, message: 'Failed to update athlete profile.'}));
    });
  });
}

function createProfile(userId, req, res, db) {
  const userSendingRequest = req.user;
  let associatedUserIdForAthleteProfile = userId;
  let newProfile = req.body.athleteProfile;
  // Check for required fields
  if (!newProfile || !newProfile.firstName || !newProfile.lastName || !newProfile.dob || !associatedUserIdForAthleteProfile || newProfile.gender) {
    res.status(403).send(JSON.stringify({ok: false, message: 'Missing required fields'}));
    return;
  }
  
  db.tables.AthleteProfiles.findOne({where: {userId: associatedUserIdForAthleteProfile}}).then((profileFoundForUser) => {
    // For now, only one athlete profile per user.
    if (profileFoundForUser) {
      res.status(403).send(JSON.stringify({ok: false, message: 'Athlete profile already exists for that user.'}));
      return;
    }

    let athleteProfileData = {
      firstName: newProfile.firstName,
      lastName: newProfile.lastName,
      dob: newProfile.dob,
      nationality: newProfile.nationality ?? 'US',
      height: newProfile.height,
      weight: newProfile.weight,
      userId: associatedUserIdForAthleteProfile,
      gender: newProfile.gender,
    };

    if (userSendingRequest.isAdmin) {
      // Admin can make a profile for any user, or no user
      
      db.tables.AthleteProfiles.create(athleteProfileData).then(newProfile => {
        if (!newProfile) {
          res.status(403).send(JSON.stringify({ok: false, message: 'Failed to create athlete profile.'}));
          return 
        }
        res.status(200).send(JSON.stringify({ok: true, message: "Profile Created", athleteProfileId: newProfile.id}));
      }).catch(err => {
        res.status(500).send({ok: false, message: 'Server error', error: err.message});
      });;
      return;
    }

    // If user sending request is not admin, then the user ids must match
    if (userSendingRequest.id != associatedUserIdForAthleteProfile) {
      let errorString = `User ${userSendingRequest.id} does not have permission to create an athleteProfile for user ${associatedUserIdForAthleteProfile}.`;
      console.log("Error: " + errorString);
      res.status(403).send(JSON.stringify({ok: false, message: errorString}));
      return;
    }
    // Otherwise, create new athlete profile.
    db.tables.AthleteProfiles.create(athleteProfileData).then(newAthlete => {
      if (!newAthlete) {
        res.status(403).send(JSON.stringify({ok: false, message: 'Failed to create athlete profile.'}));
        return 
      }
      console.log(`Profile created successfully with id ${newAthlete.id}`);
      res.status(200).send(JSON.stringify({ok: true, message: "Profile Created", athleteProfileId: profile.id}));
    }).catch(err => {
      res.status(500).send({ok: false, message: 'Server error', error: err.message});
    });
  });
}

// TODO: combine with update profile
const addOrUpdateProfile = (req, res, db) => {
  console.log('Add or update profile');
  if (req.body.athleteProfileId) {
    updateProfile(req.body.athleteProfileId, req, res, db);
  } else if (req.body.userId) {
    createProfile(req.body.userId, req, res,db);
  } else {
    res.status(403).json({ok: false, message: 'Missing required fields'});
  }
};

const getProfile = async (req, res, db) => {
  const user = req.user;

  try {
    const athleteProfileId = parseInt(req.query.athleteId);
    if (!helpers.isValidId(athleteProfileId)) {
      return res.status(403).json({ ok: false, message: 'Invalid athlete profile ID.' });
    }

    let attributes = ['id', 'firstName', 'lastName', 'nationality', 'dob', 'height', 'weight', 'profileImage', 'backgroundImage', 'gender'];
    const userHasFullAccess = user.isAdmin || user.athleteId == athleteProfileId;
    if (userHasFullAccess) {
      // attributes.push('email', ) //TODO: add any restricted columns here
    }

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

    const athleteProfile = {
      id: profileWithPR.id,
      firstName: profileWithPR.firstName,
      lastName: profileWithPR.lastName,
      gender: profileWithPR.gender,
      dob: profileWithPR.dob,
      profileImage: profileWithPR.profileImage,
      backgroundImage: profileWithPR.backgroundImage,
      nationality: profileWithPR.nationality,
      stats: {
        height: profileWithPR.height,
        weight: profileWithPR.weight,
        age: helpers.calculateAge(profileWithPR.dob),
        rank: profileWithPR.rank, // TODO: add rank to athlete profile?
        pr: profileWithPR.heightInches,
        largestPole: {
          lengthInches: profileWithPR.poleLengthInches,
          weight: profileWithPR.poleWeight,
        },
      },
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
    const { gender, page = 1, limit } = req.query; // Optional filters and pagination
    var offset = 0;
    if (limit) {
      offset = (page - 1) * limit;
    }

    // Query to fetch AthleteProfiles with their best PR
    const profilesWithPRs = await db.tables.AthleteProfiles.findAll({
      where: gender ? { gender } : {}, // Filter by gender if provided
      attributes: ['id', 'firstName', 'lastName', 'nationality', 'dob', 'height', 'weight', 'profileImage', 'gender'],
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
        profileImage: profile.profileImage,
        backgroundImage: profile.backgroundImage,
        stats: {
          height: profile.height,
          weight: profile.weight,
          age: helpers.calculateAge(profile.dob),
          rank: offset + index + 1, // Rank within the current page
          pr: bestPR,
          largestPole: undefined, // TODO: Add this if needed
        },
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

module.exports = { addOrUpdateProfile, getProfile, deleteProfile, getProfiles, getLatestAthlete }