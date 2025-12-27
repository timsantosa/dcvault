// import { Request, Response } from 'express';

const rankingCache = require("./athleteRankingCache");
const { validatePoleBrand } = require("../utils/poleBrandValidation");
const { getBestOfPersonalRecords } = require("../utils/rankingUtils");
const NotificationUtils = require("../utils/notificationUtils");
const { getOrCreateDirectConversation, sendMessageInConversation } = require("../utils/messagesUtils");

// Endpoints:
const addOrUpdateJump = async (req, res, db) => {
  try {
    const athleteProfileId = parseInt(req.query.athleteProfileId);
    const { id, date, hardMetrics, meetInfo, softMetrics, notes, videoLink } = req.body.jump;

    // Validate required fields
    if (!athleteProfileId || isNaN(athleteProfileId) || !date) {
      return res.status(400).json({ ok: false, message: 'Athlete ID and Date are required.' });
    }
    if (hardMetrics.setting === "Meet") {
      // Allow 0 for height in case of no height
      const jumpHeight = hardMetrics?.height?.inches;
      if (jumpHeight === undefined || jumpHeight === null || jumpHeight < 0 || !meetInfo) {
        return res.status(400).json({ ok: false, message: 'Missing height or meet info for meet jump' });
      }
      if (jumpHeight === 0 && meetInfo.records?.length > 0) {
        return res.status(400).json({ ok: false, message: 'No height for record jump' });
      }
    }

    // New jumps come in with an id of -1
    const jumpId = id > 0 ? id : undefined;

    // Flatten hardMetrics for upsert
    const flattenedHardMetrics = {
      focus: hardMetrics?.focus,
      setting: hardMetrics?.setting,
      stepNum: hardMetrics?.run?.stepNum,
      distanceInches: hardMetrics?.run?.distanceInches,
      midMarkInches: hardMetrics?.run?.midMarkInches,
      targetTakeOffInches: hardMetrics?.run?.targetTakeOffInches,
      actualTakeOffInches: hardMetrics?.run?.actualTakeOffInches,
      poleGripInches: hardMetrics?.pole?.gripInches,
      poleLengthInches: hardMetrics?.pole?.lengthInches,
      poleWeight: hardMetrics?.pole?.weight,
      poleBrand: validatePoleBrand(hardMetrics?.pole?.brand),
      poleFlex: hardMetrics?.pole?.flex,
      poleId: hardMetrics?.pole?.id,
      heightInches: hardMetrics?.height?.inches,
      heightIsBar: hardMetrics?.height?.isBar,
      standardsInches: hardMetrics?.height?.standardsInches,
      heightResult: hardMetrics?.height?.result,
      athleteHeightInches: hardMetrics?.athleteStats?.heightInches,
      athleteWeightPounds: hardMetrics?.athleteStats?.weightPounds,
    };

    // Flatten some meet info
    let flattenedMeetInfo = {}
    if (hardMetrics?.setting === "Meet") {
      flattenedMeetInfo.facilitySetting = meetInfo.facilitySetting;
      flattenedMeetInfo.meetType = meetInfo.championshipType || null; // Set to null if empty/undefined
      flattenedMeetInfo.division = meetInfo.division || null;
      flattenedMeetInfo.placement = meetInfo.placement || null;
      flattenedMeetInfo.recordType = meetInfo.records ? meetInfo.records.join(',') : null;
      flattenedMeetInfo.meetEventDetails = meetInfo.eventDetails;
    }

    // Maybe consider auto-verifying if admin made request. Need to update PRs then.
    var needsVerification = false;
    var originalJump = null;
    var wasPr = false;

    if (jumpId) {
      // Get the original jump if we're updating
      originalJump = await db.tables.Jumps.findByPk(jumpId);
      
      if (!originalJump) {
        return res.status(404).json({ ok: false, message: 'Jump not found.' });
      }

      // If this is an update by the athlete who owns the jump, remove from rejected jumps table
      if (originalJump.athleteProfileId === athleteProfileId) {
        await db.tables.RejectedJumps.destroy({
          where: { jumpId }
        });
      }

      if (!originalJump.verified) {
        // If original jump was unverified, just do normal verification check
        needsVerification = await requiresVerification(hardMetrics, meetInfo, athleteProfileId, db);
      } else if (hardMetrics?.setting === "Meet") {
        // Original jump was verified, check if any critical fields changed
        const criticalFieldsChanged = 
          (flattenedMeetInfo.recordType != originalJump.recordType ?? '') ||
          ((meetInfo?.championshipType || null) != (originalJump.meetType || null)) ||
          (meetInfo?.placement != originalJump.placement ?? '') ||
          (hardMetrics?.height?.inches != originalJump.heightInches) ||
          (hardMetrics?.setting != originalJump.setting);

        if (criticalFieldsChanged) {
          needsVerification = true;
          
          // Only check if it was a PR if we need to recalculate PRs
          const prRecord = await db.tables.PersonalRecords.findOne({
            where: { jumpId, athleteProfileId }
          });
          wasPr = !!prRecord;
        }
      }
    } else {
      // New jump, just do normal verification check
      needsVerification = await requiresVerification(hardMetrics, meetInfo, athleteProfileId, db);
    }
    
    const verified = !needsVerification;

    // Upsert jump
    const [jumpRow, created] = await db.tables.Jumps.upsert({
      id: jumpId,
      athleteProfileId,
      date,
      notes,
      videoLink,
      ...flattenedHardMetrics,
      softMetrics,
      ...flattenedMeetInfo,
      verified,
    });

    // If we're updating a verified PR and it needs re-verification, we need to recalculate PRs
    if (jumpId && wasPr && needsVerification) {
      await populatePRsForAthlete(athleteProfileId, db);
    }

    // If jump is already verified, check if we need to update the personal records table.
    // Otherwise it will get updated when it gets verified.
    if (verified) {
      checkIfJumpIsStepPr(jumpRow, db);
    }

    // Send notification to admins if this is a new meet jump that needs verification
    if (created && needsVerification && flattenedHardMetrics.setting === 'Meet') {
      try {
        await NotificationUtils.notifyAdminsOfPendingJump(jumpRow.id, athleteProfileId);
      } catch (notificationError) {
        console.error('Error sending jump verification notification:', notificationError);
        // Don't fail the jump creation if notification fails
      }
    }

    const jump = mapDbRowToJump(jumpRow);

    res.json({
      ok: true,
      message: created ? 'Jump successfully added.' : 'Jump successfully updated.',
      jump,
    });
  } catch (error) {
    console.error('Error in addOrUpdateJump:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};

// Verification helper (throws errors)
async function requiresVerification(hardMetrics, meetInfo, athleteProfileId, db) {
  // Auto verify practice jumps
  if (hardMetrics?.setting !== "Meet") {
    return false;
  }
  if (!meetInfo) { 
    console.error("Jump is a meet jump but has no meet info.");
    return true;
  }

  // If it's a championship placement, we need to verify it
  if (meetInfo.championshipType 
    && meetInfo.placement 
    && meetInfo.placement >= 1 && meetInfo.placement <= 3) {
    return true;
  }

  // If it's a record jump, we need to verify it
  if (meetInfo.records && meetInfo.records.length > 0) {
    return true;
  } 

  // If it's a PR jump, we need to verify it
  const athletesPr = await getPersonalBest(athleteProfileId, db);
  if (hardMetrics?.height?.inches > athletesPr.heightInches) {
    return true;
  }

  return false
}

// Used by admins to check other's jumps
const getJump = async (req, res, db) => {
  try {
    const { jumpId } = req.query;

    if (!jumpId) {
      return res.status(400).json({ ok: false, message: 'Jump ID is required.' });
    }

    const jumpRow = await db.tables.Jumps.findByPk(jumpId);

    if (!jumpRow) {
      return res.status(404).json({ ok: false, message: 'Jump not found.' });
    }

    // Check if this jump is favorited
    const favoriteJump = await db.tables.FavoriteJumps.findOne({
      where: { jumpId: jumpId }
    });

    let jump = mapDbRowToJump(jumpRow);
    jump.isFavorite = !!favoriteJump;

    // Add rejection info
    jump = await addRejectionInfoToJumps(jump, db);

    res.json({ ok: true, jump });
  } catch (error) {
    console.error('Error in getJump:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};


const deleteJump = async (req, res, db) => {
  try {
    const { jumpId, athleteProfileId } = req.query;

    if (!jumpId || !athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Missing jump ID or athlete profile id' });
    }

    // Start a transaction using the Jumps model's sequelize instance
    const transaction = await db.tables.Jumps.sequelize.transaction();

    try {
      const jump = await db.tables.Jumps.findByPk(jumpId, { transaction });

      if (!jump) {
        await transaction.rollback();
        return res.status(404).json({ ok: false, message: 'Jump not found.' });
      }

      // Check if jump was a PR
      const personalRecord = await db.tables.PersonalRecords.findOne({
        where: { jumpId, athleteProfileId },
        transaction
      });

      // If it was a PR, delete the PR record first
      if (personalRecord) {
        await personalRecord.destroy({ transaction });
      }

      // Check if this jump is favorited
      const favoriteJump = await db.tables.FavoriteJumps.findOne({
        where: { jumpId, athleteProfileId },
        transaction
      });

      // If it was a favorite, delete the favorite record
      if (favoriteJump) {
        await favoriteJump.destroy({ transaction });
      }

      // Then delete the jump
      await jump.destroy({ transaction });

      // Finally, if it was a PR, repopulate PRs
      if (personalRecord) {
        await populatePRsForAthlete(athleteProfileId, db, transaction);
      }

      // Commit the transaction
      await transaction.commit();

      res.json({ ok: true, message: 'Jump deletion successful.' });
    } catch (error) {
      // If anything fails, rollback the transaction
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteJump:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};


const fetchJumps = async (req, res, db) => {
  try {
    const { athleteProfileId, stepNum, medalType, page = 1, pageSize } = req.query;
    let setting = req.query.setting;

    if (!athleteProfileId) {
      console.error("No athlete id")
      return res.status(400).json({ ok: false, message: 'Athlete ID is required.' });
    }

    // Build query with filters
    const where = { athleteProfileId };
    if (stepNum) {
      where.stepNum = stepNum;
    }
    if (setting) {
      if (setting === 'meet' || setting === 'Meet') {
        where.setting = 'Meet';
        where.verified = true;
      } else if (setting === 'practice' || setting === 'Practice') {
        where.setting = 'Practice';
      } else {
        return res.status(400).json({ ok: false, message: 'Invalid setting.' });
      }
    }
    if (medalType) {
      // where meetType is not null and not empty (championship)
      where.meetType = {
        [db.tables.schema.Sequelize.Op.and]: [
          { [db.tables.schema.Sequelize.Op.ne]: null }, // meetType is not null
          { [db.tables.schema.Sequelize.Op.ne]: '' }    // meetType is not empty string
        ]
      };
      if (medalType === 'gold') {
        where.placement = 1;
      } else if (medalType === 'silver') {
        where.placement = 2;
      } else if (medalType === 'bronze') {
        where.placement = 3;
      } else {
        return res.status(400).json({ ok: false, message: 'Invalid medal type.' });
      }
    }

    // Fetch PRs for the athlete with jump data included
    const personalRecords = await db.tables.PersonalRecords.findAll({
      where: { athleteProfileId },
      attributes: ['stepNum', 'jumpId'],
      include: [
        {
          model: db.tables.Jumps,
          as: 'jump',
          attributes: ['id', 'heightInches'],
        },
      ],
    });

    // Fetch favorite jumps for the athlete
    const favoriteJumps = await db.tables.FavoriteJumps.findAll({
      where: { athleteProfileId },
      attributes: ['jumpId', 'stepNum'],
    });

    // Create a map of PR jump IDs for quick lookup
    const prMap = new Map();
    personalRecords.forEach(pr => {
      prMap.set(pr.stepNum, pr.jumpId);
    });

    // Create a map of favorite jump IDs for quick lookup
    const favoriteMap = new Map();
    favoriteJumps.forEach(fav => {
      favoriteMap.set(fav.jumpId, fav.stepNum);
    });

    // Find the overall PR (highest height among all PRs)
    const bestPr = getBestOfPersonalRecords(personalRecords);
    const overallPrJumpId = bestPr.jumpId;

    let limit = null;
    let offset = null;

    if (pageSize && parseInt(pageSize, 10) > 0) {
      limit = parseInt(pageSize, 10);
      offset = (parseInt(page, 10) - 1) * limit;
    }

    // Fetch jumps
    const { count, rows: jumps } = await db.tables.Jumps.findAndCountAll({
      where,
      order: [['date', 'DESC']], // Most recent first
      limit,
      offset,
    });

    let returnedJumps = jumps.map(mapDbRowToJump).map((jump => ({
      ...jump,
      isStepPr: prMap.get(jump.hardMetrics?.run?.stepNum) === jump.id,
      isPr: jump.id === overallPrJumpId,
      isFavorite: favoriteMap.has(jump.id),
    })));

    // Add rejection info to all jumps
    returnedJumps = await addRejectionInfoToJumps(returnedJumps, db);

    res.json({
      ok: true,
      jumps: returnedJumps,
      total: count,
      currentPage: limit ? parseInt(page, 10) : 1, // Default to page 1 if no pagination
      totalPages: limit ? Math.ceil(count / limit) : 1,
    });
  } catch (error) {
    console.error('Error in fetchJumps:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};

async function verifyJump(req, res, db) {
  const { jumpId, verify } = req.body;

  if (!jumpId) {
    return res.status(400).json({ message: 'Jump ID is required.' });
  }

  try {
    const jump = await db.tables.Jumps.findByPk(jumpId);

    if (!jump) {
      return res.status(404).json({ message: 'Jump not found.' });
    }

    var message = '';

    // if verifying a jump, check it against the existing PRs
    if (verify === true) {
      // Mark jump as verified
      jump.verified = true;
      await jump.save();

      await checkIfJumpIsStepPr(jump, db);

      // Send notification that jump was verified.
      try {
        await NotificationUtils.sendNotificationToAthleteProfiles(
          [jump.athleteProfileId],
          'Jump Verified',
          'Your jump has been verified',
          {
            type: 'jump_verification',
            jumpId,
          }
        );
      } catch (notificationError) {
        console.error('Error sending jump verification notification:', notificationError);
        // Don't fail the verification if notification fails
      }

      // TODO: If notifyOthers is true, notify other athletes of whatever reason they were notified (New PR, New Record, New Medal, etc.).

      message = 'Jump verified successfully.';
    } else {
      jump.verified = false;
      await jump.save();
      // If a jump was unverified, we just need to find the next best one
      await populatePRsForAthlete(jump.athleteProfileId, db)

      message = 'Jump unverified successfully.'
    }

    // Reorder ranks for that gender. Can probably be done asyncronusly if needed
    await rankingCache.regenerateAllRankings();

    res.json({ ok: true, message, jump });
  } catch (error) {
    console.error('Error verifying jump:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function rejectJumpVerification(req, res, db) {
  try {
    const { jumpId, message } = req.body;
    const { athleteProfileId: adminAthleteProfileIdString } = req.query;
    const adminAthleteProfileId = parseInt(adminAthleteProfileIdString);

    // Validate required fields
    if (!jumpId || !message || !adminAthleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Jump ID, message, and admin athlete profile ID are required.' });
    }

    // Find the jump
    const jump = await db.tables.Jumps.findByPk(jumpId);

    if (!jump) {
      return res.status(404).json({ ok: false, message: 'Jump not found.' });
    }

    // Only allow rejecting unverified jumps
    if (jump.verified) {
      return res.status(400).json({ ok: false, message: 'Cannot reject a verified jump. Please unverify it first.' });
    }

    // Start a transaction
    const transaction = await db.tables.Jumps.sequelize.transaction();

    try {
      // Get or create a direct conversation between admin and athlete
      const conversationId = await getOrCreateDirectConversation(adminAthleteProfileId, jump.athleteProfileId, db, transaction);

      // Send the rejection message using the messaging utility
      const rejectionMessage = await sendMessageInConversation(
        conversationId,
        adminAthleteProfileId,
        "Your jump was rejected for the following reason: \n" + message,
        db,
        { transaction }
      );

      // Check if jump is already rejected
      const existingRejection = await db.tables.RejectedJumps.findOne({
        where: { jumpId },
        transaction
      });

      if (existingRejection) {
        // Update the existing rejection with the new message
        await existingRejection.update({
          messageId: rejectionMessage.id,
          rejectedBy: adminAthleteProfileId,
        }, { transaction });
      } else {
        // Create a new rejection record
        await db.tables.RejectedJumps.create({
          jumpId,
          athleteProfileId: jump.athleteProfileId,
          messageId: rejectionMessage.id,
          rejectedBy: adminAthleteProfileId,
        }, { transaction });
      }

      // Commit the transaction
      await transaction.commit();

      // Send additional push notification about jump rejection (beyond the message notification)
      try {
        const adminProfile = await db.tables.AthleteProfiles.findByPk(adminAthleteProfileId);
        const adminName = `${adminProfile.firstName} ${adminProfile.lastName}`;
        
        await NotificationUtils.sendNotificationToAthleteProfiles(
          [jump.athleteProfileId],
          'Jump Rejected',
          `${adminName} has requested changes to your jump`,
          {
            type: 'jump_rejection',
            jumpId,
            conversationId,
          }
        );
      } catch (notificationError) {
        console.error('Error sending jump rejection notification:', notificationError);
        // Don't fail the rejection if notification fails
      }

      res.json({ 
        ok: true, 
        message: 'Jump rejected successfully.',
        conversationId,
        rejectionMessage
      });
    } catch (error) {
      // If anything fails, rollback the transaction
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error rejecting jump:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function checkIfJumpIsStepPr(jump, db) {
  // Check if it's a meet jump and update PR records if applicable
  if (jump.setting === 'Meet' && jump.heightInches) {

    // Check if this jump beats the current PR for its stepNum
    const currentPr = await db.tables.PersonalRecords.findOne({
      where: { athleteProfileId: jump.athleteProfileId, stepNum: jump.stepNum },
      include: {
        model: db.tables.Jumps,
        as: 'jump',
      },
    });

    if (!currentPr || jump.heightInches > currentPr.jump.heightInches) {
      // Update PR
      if (currentPr) {
        await currentPr.destroy(); // Remove old PR record //TODO: What does this destroy, both the jump and the prRow?
      }

      await db.tables.PersonalRecords.create({
        athleteProfileId: jump.athleteProfileId,
        stepNum: jump.stepNum,
        jumpId: jump.id,
      });
    }
  }
}

async function populatePRsForAthlete(athleteProfileId, db, transaction) {
  // Step 1: Get all verified "Meet" jumps for the athlete, grouped by stepNum
  const jumps = await db.tables.Jumps.findAll({
    where: {
      athleteProfileId: athleteProfileId,
      setting: 'Meet',
      verified: true,
    },
    attributes: [
      'id', 'stepNum', 'heightInches'
    ],
    order: [['stepNum', 'ASC'], ['heightInches', 'DESC']], // Order by stepNum, then highest height
    transaction
  });

  if (!jumps.length) {
    console.log(`No verified meet jumps found for athlete ${athleteProfileId}`);
    return;
  }

  // Step 2: Get the best jump for each stepNum
  const bestJumps = {};
  jumps.forEach(jump => {
    if (!bestJumps[jump.stepNum]) {
      bestJumps[jump.stepNum] = jump; // First jump per stepNum will be the best
    }
  });

  // Step 3: Delete all existing PRs for this athlete
  await db.tables.PersonalRecords.destroy({
    where: { athleteProfileId },
    transaction
  });

  // Step 4: Create new PRs for each stepNum using upsert
  for (const stepNum in bestJumps) {
    const bestJump = bestJumps[stepNum];
    await db.tables.PersonalRecords.upsert({
      athleteProfileId: athleteProfileId,
      stepNum: bestJump.stepNum,
      jumpId: bestJump.id,
      uniqueStep: athleteProfileId, // This will enforce uniqueness
    }, {
      transaction,
      fields: ['jumpId'], // Only update the jumpId if record exists
    });
  }

  console.log(`Personal records updated for athlete ${athleteProfileId}`);
}

async function getUnverifiedMeetJumps(req, res, db) {
  try {
    const jumps = await db.tables.Jumps.findAll({
      where: {
        setting: 'Meet',
        verified: false,
      },
      // attributes: [
      //   'id', 'stepNum', 'heightInches', 'poleLengthInches', 'poleWeight', 'meetType',
      //   'division',
      //   'placement',
      //   'recordType',
      //   'meetEventDetails', 'date',
      // ],
      include: [
        {
          model: db.tables.AthleteProfiles,
          as: 'athleteProfile',
          attributes: ['id', 'firstName', 'lastName', 'profileImage', 'profileImageVerified'],
        },
      ],
      order: [['date', 'ASC']], // Earlier dates should be first
    });

    let returnedJumps = jumps.map((row) => {
      return {
        jump: mapDbRowToJump(row),
        athlete: {
          id: row.athleteProfile.id,
          name: row.athleteProfile.firstName + ' ' + row.athleteProfile.lastName,
          profileImage: row.athleteProfile.profileImageVerified ? row.athleteProfile.profileImage : undefined,
        },
      }
    });

    // Add rejection info to all jumps
    const allJumps = returnedJumps.map(item => item.jump);
    const jumpsWithRejection = await addRejectionInfoToJumps(allJumps, db);
    
    returnedJumps = returnedJumps.map((item, index) => ({
      ...item,
      jump: jumpsWithRejection[index]
    }));

    res.json({
      ok: true,
      unverifiedJumps: returnedJumps,
    });
  } catch (err) {
    console.error('Error getting unverified jumps jump:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}


async function getPersonalBest(athleteProfileId, db) {
  try {
    const prs = await db.tables.PersonalRecords.findAll({
      where: { athleteProfileId },
      include: [
        {
          model: db.tables.Jumps,
          as: 'jump',
          attributes: ['heightInches', 'id'],
        },
      ],
    });

    return getBestOfPersonalRecords(prs);
  } catch (err) {
    console.error(`Error fetching PR for athleteId ${athleteProfileId}:`, err);
    return { heightInches: 0, jumpId: null };
  }
}

// async function getPersonalBest(athleteProfileId, db) {
//   try {
//     const result = await db.tables.Jumps.findOne({
//       attributes: [[db.tables.schema.fn('MAX', db.tables.schema.col('heightInches')), 'pr']], // Calculate the max jump height
//       include: [
//         {
//           model: db.tables.PersonalRecords,
//           attributes: [],
//           where: { athleteProfileId }, // Filter by athlete profile ID
//           as: 'personalRecord'
//         },
//       ],
//       raw: true, // Return plain data instead of Sequelize model instances
//     });

//     return result.pr || 0; // Return the PR or 0 if no records found
//   } catch (err) {
//     console.error(`Error fetching PR for athleteId ${athleteProfileId}:`, err);
//     // throw new Error('Failed to fetch PR');
//   }
// };

async function getLargestPole(athleteProfileId, db) {
  // TODO: Base on athlete's jumps

  return {
    lengthInches: 187,
    weight: 180,
    brand: 'UCS',
    flex: null,
  };
}

async function pinOrUnpinJump(req, res, db) {
  try {
    const { athleteProfileId, jumpId, stepNum, pin } = req.body;

    // Validate required fields
    if (!athleteProfileId || !stepNum || !jumpId || pin === undefined) {
      return res.status(400).json({ ok: false, message: 'Missing required attributes.' });
    }

    // If pin is true, pin the jump, otherwise unpin any jump of this step.
    if (pin) {
      // First, verify the jump exists and belongs to the athlete
      const jump = await db.tables.Jumps.findOne({
        where: { 
          id: jumpId, 
          athleteProfileId: athleteProfileId,
          stepNum: stepNum // Ensure the jump matches the step number
        }
      });

      if (!jump) {
        return res.status(404).json({ ok: false, message: 'Jump not found or does not match the specified step number.' });
      }

      // Check if it's a practice jump (only practice jumps can be favorited)
      if (jump.setting !== 'Practice') {
        return res.status(400).json({ ok: false, message: 'Only practice jumps can be favorited.' });
      }

      // Start transaction only for the destructive/creative operations
      const transaction = await db.tables.Jumps.sequelize.transaction();

      try {
        // Remove any existing favorite for this step number
        await db.tables.FavoriteJumps.destroy({
          where: { athleteProfileId, stepNum },
          transaction
        });

        // Create new favorite
        const favoriteJump = await db.tables.FavoriteJumps.create({
          athleteProfileId,
          jumpId,
          stepNum
        }, { transaction });

        // Commit the transaction
        await transaction.commit();

        res.json({
          ok: true,
          message: 'Jump pinned as favorite successfully.',
          favoriteJump: {
            id: favoriteJump.id,
            jumpId: favoriteJump.jumpId,
            stepNum: favoriteJump.stepNum
          }
        });
      } catch (error) {
        // If anything fails, rollback the transaction
        await transaction.rollback();
        throw error;
      }
    } else {
      // Unpin any existing favorite for this step number
      const deletedCount = await db.tables.FavoriteJumps.destroy({
        where: { athleteProfileId, stepNum }
      });

      if (deletedCount > 0) {
        res.json({
          ok: true,
          message: 'Jump unpinned successfully.'
        });
      } else {
        res.json({
          ok: true,
          message: 'No favorite jump found for this step number.'
        });
      }
    }
  } catch (error) {
    console.error('Error in pinOrUnpinJump:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function getFavoriteJumps(req, res, db) {
  try {
    const { athleteProfileId } = req.query;

    if (!athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Athlete ID is required.' });
    }

    const favoriteJumps = await db.tables.FavoriteJumps.findAll({
      where: { athleteProfileId },
      include: [
        {
          model: db.tables.Jumps,
          as: 'jump',
          attributes: ['id', 'date', 'stepNum', 'heightInches', 'poleLengthInches', 'poleWeight', 'poleBrand', 'notes', 'videoLink', 'softMetrics']
        }
      ],
      order: [['stepNum', 'ASC']]
    });

    const formattedFavorites = favoriteJumps.map(fav => {
      const jump = mapDbRowToJump(fav.jump);  
      jump.isFavorite = true;
      return {
        id: fav.id,
        stepNum: fav.stepNum,
        jump: jump,
      }
    });

    res.json({
      ok: true,
      favoriteJumps: formattedFavorites
    });
  } catch (error) {
    console.error('Error in getFavoriteJumps:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function getTopMeetJumps(req, res, db) {
  try {
    const { athleteProfileId, howMany = 5 } = req.query;
    if (!athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Athlete ID is required.' });
    }

    const limit = Math.min(parseInt(howMany,10), 100);
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid howMany parameter.' });
    }

    // Fetch PRs for the athlete with jump data included
    const personalRecords = await db.tables.PersonalRecords.findAll({
      where: { athleteProfileId },
      attributes: ['stepNum', 'jumpId'],
      include: [
        {
          model: db.tables.Jumps,
          as: 'jump',
          attributes: ['id', 'heightInches'],
        },
      ],
    });

    // Create a map of PR jump IDs for quick lookup
    const prMap = new Map();
    personalRecords.forEach(pr => {
      prMap.set(pr.stepNum, pr.jumpId);
    });

    // Find the overall PR (highest height among all PRs)
    const bestPr = getBestOfPersonalRecords(personalRecords);
    const overallPrJumpId = bestPr.jumpId;

    // Get the top jumps by height, ordered by height descending, then by date descending
    // Only include Meet jumps
    const jumps = await db.tables.Jumps.findAll({
      where: {
        athleteProfileId,
        verified: true,
        setting: 'Meet',
        heightInches: {
          [db.tables.schema.Sequelize.Op.ne]: null, // Only get jumps with a height
        },
      },
      order: [
        ['heightInches', 'DESC'],
        ['date', 'DESC'],
      ],
      limit,
    });

    const formattedJumps = jumps.map(mapDbRowToJump).map((jump => ({
      ...jump,
      isStepPr: prMap.get(jump.hardMetrics?.run?.stepNum) === jump.id,
      isPr: jump.id === overallPrJumpId,
    })));

    res.json({
      ok: true,
      jumps: formattedJumps,
    });
  } catch (error) {
    console.error('Error in getTopMeetJumps:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}


module.exports = {
  addOrUpdateJump,
  getJump,
  deleteJump,
  fetchJumps,
  verifyJump,
  rejectJumpVerification,
  // populatePRsForAthlete,
  getUnverifiedMeetJumps,
  getPersonalBest,
  pinOrUnpinJump,
  getFavoriteJumps,
  getTopMeetJumps,
  // getPersonalBests,
  // getLargestPole,
}



// Helpers

async function getRejectionInfo(jumpIds, db) {
  // Accept single jumpId or array of jumpIds
  const ids = Array.isArray(jumpIds) ? jumpIds : [jumpIds];
  
  if (ids.length === 0) {
    return new Map();
  }

  const rejections = await db.tables.RejectedJumps.findAll({
    where: { jumpId: ids },
    include: [{
      model: db.tables.Messages,
      as: 'message',
      attributes: ['id', 'content', 'createdAt'],
    }]
  });
  
  // Return a map: jumpId -> rejection info
  return new Map(rejections.map(r => [r.jumpId, {
    messageId: r.messageId,
    message: r.message?.content,
    rejectedAt: r.createdAt,
    rejectedBy: r.rejectedBy
  }]));
}

/**
 * Adds rejection info to a single jump or array of jumps
 * @param {Object|Array} jumps - Single jump object or array of jump objects
 * @param {Object} db - Database instance
 * @returns {Object|Array} - Jump(s) with rejection info added
 */
async function addRejectionInfoToJumps(jumps, db) {
  const isArray = Array.isArray(jumps);
  const jumpArray = isArray ? jumps : [jumps];
  
  if (jumpArray.length === 0) {
    return isArray ? [] : null;
  }

  // Get rejection info for all jumps at once
  const jumpIds = jumpArray.map(j => j.id);
  const rejectionMap = await getRejectionInfo(jumpIds, db);

  const jumpsWithRejection = jumpArray.map(jump => {
    const rejectionInfo = rejectionMap.get(jump.id);
    return {
      ...jump,
      isRejected: !!rejectionInfo,
      rejectionMessage: rejectionInfo?.message,
      rejectedAt: rejectionInfo?.rejectedAt,
    };
  });

  return isArray ? jumpsWithRejection : jumpsWithRejection[0];
}

// async function getPrJumps(athleteProfileId) {
//   const prJumps = await db.tables.PrRecords.findAll({
//     where: { athleteProfileId },
//     include: [
//       {
//         model: Jumps,
//         as: 'jump', // Alias if needed
//         attributes: [
//           'id',
//           'date',
//           'stepNum',
//           'heightInches',
//           'verified',
//           'softMetrics',
//           'hardMetrics',
//           'meetInfo',
//           'notes',
//           'videoLink',
//         ],
//       },
//     ],
//   });

//   return prJumps.map(pr => ({
//     stepNum: pr.stepNum,
//     jump: mapDbRowToJump(pr.jump), // Convert to the Jump interface
//   }));
// }

function mapDbRowToJump(dbRow) {
  return {
    id: dbRow.id,
    athleteProfileId: dbRow.athleteProfileId,
    date: dbRow.date,
    softMetrics: dbRow.softMetrics ? {
      mentalRating: dbRow.softMetrics.mentalRating,
      physicalRating: dbRow.softMetrics.physicalRating,
      weatherRating: dbRow.softMetrics.weatherRating,
    } : undefined,
    hardMetrics: {
      setting: dbRow.setting,
      focus: dbRow.focus ?? undefined,
      run: {
        stepNum: dbRow.stepNum,
        distanceInches: dbRow.distanceInches,
        midMarkInches: dbRow.midMarkInches ?? undefined,
        targetTakeOffInches: dbRow.targetTakeOffInches,
        actualTakeOffInches: dbRow.actualTakeOffInches ?? undefined,
      },
      pole: {
        id: dbRow.poleId,
        lengthInches: dbRow.poleLengthInches,
        weight: dbRow.poleWeight,
        brand: dbRow.poleBrand,
        flex: dbRow.poleFlex ?? undefined,
        gripInches: dbRow.poleGripInches ?? undefined,
      },
      height: dbRow.heightInches !== undefined ? {
        isBar: dbRow.heightIsBar,
        inches: dbRow.heightInches,
        standardsInches: dbRow.standardsInches ?? undefined,
        result: dbRow.heightResult ?? undefined,
      } : undefined,
      athleteStats: {
        heightInches: dbRow.athleteHeightInches ?? undefined,
        weightPounds: dbRow.athleteWeightPounds ?? undefined,
      },
    },
    meetInfo: {
      facilitySetting: dbRow.facilitySetting ?? undefined,
      eventDetails: dbRow.meetEventDetails ? { // maybe don't need to copy here?
        meetName: dbRow.meetEventDetails.meetName,
        facility: dbRow.meetEventDetails.facility,
        location: dbRow.meetEventDetails.location,
        organization: dbRow.meetEventDetails.organization,
        meetResultsLink: dbRow.meetEventDetails.meetResultsLink,
      } : undefined,
      championshipType: dbRow.meetType || undefined, // Convert empty string to undefined
      division: dbRow.division || undefined,
      placement: dbRow.placement || undefined,
      records: dbRow.recordType ? dbRow.recordType.split(',') : [],
    },
    notes: dbRow.notes || undefined,
    videoLink: dbRow.videoLink || undefined,
    verified: dbRow.verified,
  };
}