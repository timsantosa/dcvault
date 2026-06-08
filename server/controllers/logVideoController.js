const NotificationUtils = require('../utils/notificationUtils');
const { uploadBufferToCloudinary } = require('../lib/cloudinaryUploadFromBuffer');
const { JUMP_DRILL_VIDEO_FOLDER, destroyJumpDrillCloudinaryAssetIfOwned } = require('../lib/cloudinaryMedia');
const {
  userCanVerifyLogVideoMedia,
  normalizeStoredVideoLink,
} = require('../utils/pendingLogVideo');

async function uploadLogVideo(req, res, db) {
  try {
    const { athleteProfileId, entityKind } = req.query;
    if (!athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Missing athleteProfileId' });
    }
    if (entityKind !== 'jump' && entityKind !== 'drill') {
      return res.status(400).json({ ok: false, message: 'entityKind must be jump or drill' });
    }
    const file = req.file;
    if (!file) {
      return res.status(400).json({ ok: false, message: 'Video file required' });
    }
    if (!file.mimetype || !file.mimetype.startsWith('video/')) {
      return res.status(400).json({ ok: false, message: 'File must be a video' });
    }
    const { secure_url, public_id, resourceType } = await uploadBufferToCloudinary({
      buffer: file.buffer,
      mimetype: file.mimetype,
      folder: JUMP_DRILL_VIDEO_FOLDER,
    });

    if (userCanVerifyLogVideoMedia(req.user)) {
      return res.json({
        ok: true,
        url: secure_url,
        publicId: public_id,
        resourceType,
        pending: false,
      });
    }

    const pending = await db.tables.PendingLogVideos.create({
      athleteProfileId: parseInt(athleteProfileId, 10),
      videoUrl: secure_url,
      entityKind,
    });

    try {
      await NotificationUtils.notifyAdminsOfPendingLogVideo(pending.id, pending.athleteProfileId, entityKind);
    } catch (notificationError) {
      console.error('Error sending log video verification notification:', notificationError);
    }

    return res.json({
      ok: true,
      url: secure_url,
      publicId: public_id,
      resourceType,
      pending: true,
      pendingLogVideoId: pending.id,
    });
  } catch (e) {
    console.error('uploadLogVideo', e);
    res.status(502).json({ ok: false, message: 'Failed to upload video to storage' });
  }
}

/** Remove an app-owned log video before save (cancel flow / replace draft). Uses folder guard inside destroy. */
async function deleteLogVideo(req, res, db) {
  try {
    const { athleteProfileId } = req.query;
    const { url } = req.body || {};
    if (!athleteProfileId || !url || typeof url !== 'string') {
      return res.status(400).json({ ok: false, message: 'Missing athleteProfileId or url' });
    }
    const trimmed = url.trim();
    const pending = await db.tables.PendingLogVideos.findOne({
      where: {
        athleteProfileId: parseInt(athleteProfileId, 10),
        videoUrl: trimmed,
      },
    });
    try {
      await destroyJumpDrillCloudinaryAssetIfOwned(trimmed);
    } catch (cloudErr) {
      console.error('deleteLogVideo cloudinary:', cloudErr);
      return res.status(500).json({ ok: false, message: 'Failed to delete video' });
    }

    const athleteId = parseInt(athleteProfileId, 10);
    await db.tables.Jumps.update(
      { videoLink: null },
      { where: { athleteProfileId: athleteId, videoLink: trimmed } },
    );
    await db.tables.Drills.update(
      { videoLink: null },
      { where: { athleteProfileId: athleteId, videoLink: trimmed } },
    );

    if (pending) {
      await pending.destroy();
    }
    res.json({ ok: true });
  } catch (e) {
    console.error('deleteLogVideo', e);
    res.status(500).json({ ok: false, message: 'Failed to delete video' });
  }
}

async function verifyPendingLogVideo(req, res, db) {
  try {
    const { pendingLogVideoId } = req.body;
    if (!pendingLogVideoId) {
      return res.status(400).json({ ok: false, message: 'pendingLogVideoId is required' });
    }

    const pending = await db.tables.PendingLogVideos.findByPk(pendingLogVideoId);
    if (!pending) {
      return res.status(404).json({ ok: false, message: 'Pending log video not found' });
    }

    if (pending.entityKind === 'jump') {
      if (!pending.jumpId) {
        return res.status(400).json({ ok: false, message: 'Pending video is not linked to a jump yet.' });
      }
      const jump = await db.tables.Jumps.findByPk(pending.jumpId);
      if (!jump) {
        return res.status(404).json({ ok: false, message: 'Jump not found' });
      }
      const previous = normalizeStoredVideoLink(jump.videoLink);
      if (previous && previous !== pending.videoUrl) {
        await destroyJumpDrillCloudinaryAssetIfOwned(previous);
      }
      jump.videoLink = pending.videoUrl;
      await jump.save();
    } else if (pending.entityKind === 'drill') {
      if (!pending.drillId) {
        return res.status(400).json({ ok: false, message: 'Pending video is not linked to a drill yet.' });
      }
      const drill = await db.tables.Drills.findByPk(pending.drillId);
      if (!drill) {
        return res.status(404).json({ ok: false, message: 'Drill not found' });
      }
      const previous = normalizeStoredVideoLink(drill.videoLink);
      if (previous && previous !== pending.videoUrl) {
        await destroyJumpDrillCloudinaryAssetIfOwned(previous);
      }
      drill.videoLink = pending.videoUrl;
      await drill.save();
    } else {
      return res.status(400).json({ ok: false, message: 'Invalid entity kind' });
    }

    await pending.destroy();
    res.json({ ok: true, message: 'Log video verified successfully.' });
  } catch (error) {
    console.error('verifyPendingLogVideo', error);
    res.status(500).json({ ok: false, message: 'Failed to verify log video.' });
  }
}

async function rejectPendingLogVideo(req, res, db) {
  try {
    const { pendingLogVideoId, message } = req.body;
    if (!pendingLogVideoId || message == null || message === '') {
      return res.status(400).json({ ok: false, message: 'pendingLogVideoId and message are required' });
    }

    const pending = await db.tables.PendingLogVideos.findByPk(pendingLogVideoId);
    if (!pending) {
      return res.status(404).json({ ok: false, message: 'Pending log video not found' });
    }

    const athleteProfileId = pending.athleteProfileId;
    const entityKind = pending.entityKind;
    const videoUrl = pending.videoUrl;

    try {
      await destroyJumpDrillCloudinaryAssetIfOwned(videoUrl);
    } catch (cloudErr) {
      console.error('rejectPendingLogVideo cloudinary:', cloudErr);
      return res.status(500).json({ ok: false, message: 'Failed to remove video from storage.' });
    }

    const kindLabel = entityKind === 'drill' ? 'drill' : 'jump';
    const body = `Your ${kindLabel} log video was rejected: ${message}`;
    try {
      await NotificationUtils.sendNotificationToAthleteProfiles(
        [athleteProfileId],
        'Log Video Rejected',
        body,
        {
          type: 'log_video_rejection',
          pendingLogVideoId: pending.id,
          rejectionMessage: message,
          entityKind,
        }
      );
    } catch (notificationError) {
      console.error('Error sending log video rejection notification:', notificationError);
    }

    await pending.destroy();

    res.json({ ok: true, message: 'Log video rejected successfully.' });
  } catch (error) {
    console.error('rejectPendingLogVideo', error);
    res.status(500).json({ ok: false, message: 'Failed to reject log video.' });
  }
}

async function getAllUnverifiedLogVideos(req, res, db) {
  try {
    const pendingLogVideos = await db.tables.PendingLogVideos.findAll({
      order: [['createdAt', 'ASC']],
      include: [{
        model: db.tables.AthleteProfiles,
        as: 'athleteProfile',
        attributes: ['id', 'firstName', 'lastName'],
      }],
    });
    res.json({ ok: true, pendingLogVideos });
  } catch (error) {
    console.error('getAllUnverifiedLogVideos', error);
    res.status(500).json({ ok: false, message: 'Failed to fetch pending log videos' });
  }
}

module.exports = {
  uploadLogVideo,
  deleteLogVideo,
  verifyPendingLogVideo,
  rejectPendingLogVideo,
  getAllUnverifiedLogVideos,
};
