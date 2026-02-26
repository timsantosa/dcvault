const { isAthleteProfileActive } = require('../utils/rankingUtils');

const getPoles = async (req, res, db) => {
  try {
    const poles = await db.tables.Poles.findAll({
        attributes: ['id', 'brand', 'feet', 'inches', 'weight', 'location', 'damaged', 'missing', 'needsTip', 'broken', 'note', 'rented'],
      order: [['feet', 'ASC'], ['inches', 'ASC'], ['weight', 'ASC']],
    });

    const allPolls = poles.map(pole => ({
        id: pole.id,
        brand: pole.brand,
        feet: pole.feet,
        inches: pole.inches,
        weight: pole.weight,
        location: pole.location,
        damaged: pole.damaged,
        missing: pole.missing,
        needsTip: pole.needsTip,
        broken: pole.broken,
        note: pole.note,
        rented: pole.rented
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
    const { lefts, athleteProfileIds, activeProfiles } = req.query;

    // Parse lefts (step numbers) - default to 1-10 if not provided
    let stepNums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    if (lefts) {
      stepNums = lefts.split(',').map(num => parseInt(num.trim(), 10)).filter(num => !isNaN(num));
      if (stepNums.length === 0) {
        return res.status(400).json({ ok: false, message: 'Invalid lefts parameter.' });
      }
    }

    // Determine which profiles to include
    let profileIdsToInclude = null;
    
    if (athleteProfileIds) {
      // If specific IDs are provided, use them
      const ids = athleteProfileIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
      if (ids.length === 0) {
        return res.status(400).json({ ok: false, message: 'Invalid athleteProfileIds parameter.' });
      }
      profileIdsToInclude = ids;
    } else {
      
      // Fetch all profiles first
      const allProfiles = await db.tables.AthleteProfiles.findAll({
        attributes: ['id', 'firstName', 'lastName', 'alwaysActiveOverride', 'athleteId']
      });

      // If activeProfiles is true, filter to only active profiles
      if (activeProfiles === 'true') {
        const activeProfileIds = [];
        for (const profile of allProfiles) {
          const isActive = await isAthleteProfileActive(profile, db);
          if (isActive) {
            activeProfileIds.push(profile.id);
          }
        }
        profileIdsToInclude = activeProfileIds;
      } else {
        // Include all profiles
        profileIdsToInclude = allProfiles.map(p => p.id);
      }
    }

    // Handle empty profileIdsToInclude to avoid MySQL 5.7 issues with Op.in on empty arrays
    if (!profileIdsToInclude || profileIdsToInclude.length === 0) {
      return res.json({
        ok: true,
        profiles: []
      });
    }

    // Build where clause for FavoriteJumps
    const whereClause = {
      stepNum: {
        [db.tables.schema.Sequelize.Op.in]: stepNums
      },
      athleteProfileId: {
        [db.tables.schema.Sequelize.Op.in]: profileIdsToInclude
      }
    };

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

    // Get all profiles that should be included (to ensure we return all, even without pinned jumps)
    const allProfilesToReturn = await db.tables.AthleteProfiles.findAll({
      where: {
        id: {
          [db.tables.schema.Sequelize.Op.in]: profileIdsToInclude
        }
      },
      attributes: ['id', 'firstName', 'lastName']
    });

    // Initialize profilesMap with all profiles (empty poles object)
    const profilesMap = new Map();
    allProfilesToReturn.forEach(profile => {
      profilesMap.set(profile.id, {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        poles: {}
      });
    });

    // Populate poles data from favoriteJumps
    favoriteJumps.forEach(fav => {
      const profileId = fav.athleteProfileId;
      const stepNum = fav.stepNum;
      
      const profile = profilesMap.get(profileId);
      
      // Add pole data for this step number
      if (profile && fav.jump) {
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

    // Convert map to array and sort alphabetically by first name
    const profiles = Array.from(profilesMap.values()).sort((a, b) => {
      const firstNameA = (a.firstName || '').toLowerCase();
      const firstNameB = (b.firstName || '').toLowerCase();
      return firstNameA.localeCompare(firstNameB);
    });

    res.json({
      ok: true,
      profiles: profiles
    });
  } catch (error) {
    console.error('Error in getPolesPerProfile:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};

const createPole = async (req, res, db) => {
  try {
    const { brand, feet, inches, weight, location, damaged, missing, needsTip, broken, note, rented } = req.body;
    
    // Validate required fields
    if (!brand || typeof brand !== 'string' || !brand.trim()) {
      return res.status(400).json({ ok: false, message: 'Brand is required and must be non-empty.' });
    }
    if (feet === undefined || feet === null || typeof feet !== 'number' || feet < 0) {
      return res.status(400).json({ ok: false, message: 'Feet is required and must be a non-negative number.' });
    }
    if (inches === undefined || inches === null || typeof inches !== 'number' || inches < 0 || inches >= 12) {
      return res.status(400).json({ ok: false, message: 'Inches is required and must be a number between 0 and 11.' });
    }
    if (weight === undefined || weight === null || typeof weight !== 'number' || weight < 0) {
      return res.status(400).json({ ok: false, message: 'Weight is required and must be a non-negative number.' });
    }

    const poleData = {
      brand: brand.trim(),
      feet: Math.floor(feet),
      inches: Math.floor(inches),
      weight: Math.floor(weight),
      location: location ? location.trim() : null,
      damaged: damaged === true,
      missing: missing === true,
      needsTip: needsTip === true,
      broken: broken === true,
      note: note ? note.trim() : null,
      rented: rented === true,
    };

    const pole = await db.tables.Poles.create(poleData);
    res.status(201).json({
      ok: true,
      pole: {
        id: pole.id,
        brand: pole.brand,
        feet: pole.feet,
        inches: pole.inches,
        weight: pole.weight,
        location: pole.location,
        damaged: pole.damaged,
        missing: pole.missing,
        needsTip: pole.needsTip,
        broken: pole.broken,
        note: pole.note,
        rented: pole.rented,
      },
    });
  } catch (error) {
    console.error('Error in createPole:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};

const updatePole = async (req, res, db) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid pole ID.' });
    }

    const { brand, feet, inches, weight, location, damaged, missing, needsTip, broken, note, rented } = req.body;

    const pole = await db.tables.Poles.findByPk(id);
    if (!pole) {
      return res.status(404).json({ ok: false, message: 'Pole not found.' });
    }

    const updateData = {};
    
    if (brand !== undefined) {
      if (typeof brand !== 'string' || !brand.trim()) {
        return res.status(400).json({ ok: false, message: 'Brand must be a non-empty string.' });
      }
      updateData.brand = brand.trim();
    }
    
    if (feet !== undefined) {
      if (typeof feet !== 'number' || feet < 0) {
        return res.status(400).json({ ok: false, message: 'Feet must be a non-negative number.' });
      }
      updateData.feet = Math.floor(feet);
    }
    
    if (inches !== undefined) {
      if (typeof inches !== 'number' || inches < 0 || inches >= 12) {
        return res.status(400).json({ ok: false, message: 'Inches must be a number between 0 and 11.' });
      }
      updateData.inches = Math.floor(inches);
    }
    
    if (weight !== undefined) {
      if (typeof weight !== 'number' || weight < 0) {
        return res.status(400).json({ ok: false, message: 'Weight must be a non-negative number.' });
      }
      updateData.weight = Math.floor(weight);
    }
    
    if (location !== undefined) {
      updateData.location = location ? location.trim() : null;
    }
    
    if (damaged !== undefined) {
      updateData.damaged = damaged === true;
    }
    
    if (missing !== undefined) {
      updateData.missing = missing === true;
    }
    
    if (needsTip !== undefined) {
      updateData.needsTip = needsTip === true;
    }
    
    if (broken !== undefined) {
      updateData.broken = broken === true;
    }
    
    if (note !== undefined) {
      updateData.note = note ? note.trim() : null;
    }
    
    if (rented !== undefined) {
      updateData.rented = rented === true;
    }

    await pole.update(updateData);
    res.json({
      ok: true,
      pole: {
        id: pole.id,
        brand: pole.brand,
        feet: pole.feet,
        inches: pole.inches,
        weight: pole.weight,
        location: pole.location,
        damaged: pole.damaged,
        missing: pole.missing,
        needsTip: pole.needsTip,
        broken: pole.broken,
        note: pole.note,
        rented: pole.rented,
      },
    });
  } catch (error) {
    console.error('Error in updatePole:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};

const deletePole = async (req, res, db) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid pole ID.' });
    }

    const pole = await db.tables.Poles.findByPk(id);
    if (!pole) {
      return res.status(404).json({ ok: false, message: 'Pole not found.' });
    }

    await pole.destroy();
    res.json({ ok: true, message: 'Pole deleted successfully.' });
  } catch (error) {
    console.error('Error in deletePole:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};

module.exports = {
  getPoles,
  getPinnedPolesPerProfile,
  createPole,
  updatePole,
  deletePole,
};
