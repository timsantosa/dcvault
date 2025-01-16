const helpers = require('../lib/helpers');

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
  if (!newProfile || !newProfile.firstName || !newProfile.lastName || !newProfile.dob || !associatedUserIdForAthleteProfile) {
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

const getProfile = (req, res, db) => {
  const user = req.user;

  // Get profile id
  const id = req.query.athleteId
  console.log(`Getting athlete profile for id: ${id}`);
  if (helpers.isValidId(id)) {
    res.status(403).json({ok: false, message: 'no athlete profile id specified.'});
    return
  }

  // TODO: Convert to async/await
  db.tables.AthleteProfiles.findOne({where: {id: id}}).then((profileData) => {
    if (!profileData) {
      res.status(400).send(JSON.stringify({ok: false, message: 'profile not created yet!'}));
      return;
    } 
    let athleteProfile = {
      id: id,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      nationality: profileData.nationality,
      dob: profileData.dob,
      profileImage: '',
      backgroundImage: '',
      stats: {
        height: profileData.height,
        weight: profileData.weight,
        age: helpers.calculateAge(profileData.dob),
        rank: 12, // TODO: Calculate based on jumps
        pr: 4.5, // TODO: Calculate based on jumps
        largestPole: '', // TODO: Calculate based on jumps
      },
    }

    let userId = profileData.userId;
    if (!userId) {
      // TODO: Indicate no associated user id
      res.json({ok: true, message: 'found athlete profile', athleteProfile});
      return;
    }
    db.tables.Athletes.findOne({where: {userId: userId}}).then((foundAthlete) => {
      if (!foundAthlete) {
        // TODO: Indicate athlete is not currently signed up
        res.status(200).send({ok: true, message: 'found athlete profile', athleteProfile});
        return;
      }
      // TODO: Check if user has permission to see athlete profile, self or is admin
      if (user.isAdmin) {
        console.log('User is admin');
      }
      athleteProfile.contactInfo = foundAthlete.email; // TODO: only if admin or user is athlete user
        // emrgencyContactInfo: '', // TODO: only if admin

      res.status(200).send({ok: true, message: 'found athlete profile', athleteProfile});
    });
  });
};

const deleteProfile = (req, res, db) => {
  console.log('delete profile');
  res.json({ ok: false, message: 'Not implemented' });
};

const getProfiles = (req, res, db) => {
  // User should have been added to request via JWT Authentication
  const user = req.user;
  // TODO: Filter based on request
  db.tables.AthleteProfiles.findAll().then(athleteProfileRows => {
    let athletes = athleteProfileRows.map(athleteProfileRow => {
      let athleteProfile = {
        id: athleteProfileRow.id,
        firstName: athleteProfileRow.firstName,
        lastName: athleteProfileRow.lastName,
        nationality: athleteProfileRow.nationality,
        dob: athleteProfileRow.dob,
        profileImage: '',
        backgroundImage: '',
        stats: {
          height: athleteProfileRow.height,
          weight: athleteProfileRow.weight,
          age: 21, // TODO: Calculate based on DOB
          rank: 12, // TODO: Calculate based on jumps
          pr: 4.5, // TODO: Calculate based on jumps
          largestPole: '', // TODO: Calculate based on jumps
        },
      }
      return athleteProfile;
    });
    res.json({ok: true, athletes});
  });
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