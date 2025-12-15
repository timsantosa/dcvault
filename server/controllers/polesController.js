const getPoles = async (req, res, db) => {
  try {
    const poles = await db.tables.Poles.findAll({
        attributes: ['id', 'brand', 'feet', 'inches', 'weight'],
      order: [['feet', 'ASC'], ['inches', 'ASC'], ['weight', 'ASC']],
    });

    const allPolls = poles.map(pole => ({
        id: pole.id,
        brand: pole.brand,
        feet: pole.feet,
        inches: pole.inches,
        weight: pole.weight,
        // location: pole.location,
        // damaged: pole.damaged,
        // missing: pole.missing,
        // needsTip: pole.needsTip,
        // broken: pole.broken,
        // note: pole.note,
        // rented: pole.rented
    }));
    res.json({
      ok: true,
      poles: allPolls,
    });
  } catch (error) {
    console.error('Error in getPoles:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};

const getPinnedPolesPerProfile = async (req, res, db) => {
  try {
    const { lefts, athleteProfileIds } = req.query;

    // Parse lefts (step numbers) - default to 1-10 if not provided
    let stepNums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    if (lefts) {
      stepNums = lefts.split(',').map(num => parseInt(num.trim(), 10)).filter(num => !isNaN(num));
      if (stepNums.length === 0) {
        return res.status(400).json({ ok: false, message: 'Invalid lefts parameter.' });
      }
    }

    // Build where clause for FavoriteJumps
    const whereClause = {
      stepNum: {
        [db.tables.schema.Sequelize.Op.in]: stepNums
      }
    };

    // If athleteProfileIds is provided, filter by them
    if (athleteProfileIds) {
      const ids = athleteProfileIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
      if (ids.length === 0) {
        return res.status(400).json({ ok: false, message: 'Invalid athleteProfileIds parameter.' });
      }
      whereClause.athleteProfileId = {
        [db.tables.schema.Sequelize.Op.in]: ids
      };
    }

    // Query FavoriteJumps with includes for Jumps (pole data) and AthleteProfiles
    const favoriteJumps = await db.tables.FavoriteJumps.findAll({
      where: whereClause,
      include: [
        {
          model: db.tables.Jumps,
          as: 'jump',
          attributes: [
            'id',
            'poleId',
            'poleLengthInches',
            'poleWeight',
            'poleBrand',
            'poleFlex',
            'poleGripInches'
          ]
        },
        {
          model: db.tables.AthleteProfiles,
          as: 'athleteProfile',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [
        ['athleteProfileId', 'ASC'],
        ['stepNum', 'ASC']
      ]
    });

    // Group by athlete profile and structure the response
    const profilesMap = new Map();

    favoriteJumps.forEach(fav => {
      const profileId = fav.athleteProfileId;
      const stepNum = fav.stepNum;
      
      if (!profilesMap.has(profileId)) {
        profilesMap.set(profileId, {
          id: fav.athleteProfile.id,
          firstName: fav.athleteProfile.firstName,
          lastName: fav.athleteProfile.lastName,
          poles: {}
        });
      }

      const profile = profilesMap.get(profileId);
      
      // Add pole data for this step number
      if (fav.jump) {
        profile.poles[stepNum] = {
          poleId: fav.jump.poleId,
          poleLengthInches: fav.jump.poleLengthInches,
          poleWeight: fav.jump.poleWeight,
          poleBrand: fav.jump.poleBrand,
          poleFlex: fav.jump.poleFlex,
          poleGripInches: fav.jump.poleGripInches
        };
      }
    });

    // Convert map to array
    const profiles = Array.from(profilesMap.values());

    res.json({
      ok: true,
      profiles: profiles
    });
  } catch (error) {
    console.error('Error in getPolesPerProfile:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};

module.exports = {
  getPoles,
  getPinnedPolesPerProfile
};
