const { uploadBufferToCloudinary } = require('../lib/cloudinaryUploadFromBuffer');
const { JUMP_DRILL_VIDEO_FOLDER, destroyJumpDrillCloudinaryAssetIfOwned } = require('../lib/cloudinaryMedia');

async function uploadLogVideo(req, res) {
  try {
    const { athleteProfileId } = req.query;
    if (!athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Missing athleteProfileId' });
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
    res.json({
      ok: true,
      url: secure_url,
      publicId: public_id,
      resourceType,
    });
  } catch (e) {
    console.error('uploadLogVideo', e);
    res.status(502).json({ ok: false, message: 'Failed to upload video to storage' });
  }
}

/** Remove an app-owned log video before save (cancel flow / replace draft). Uses folder guard inside destroy. */
async function deleteLogVideo(req, res) {
  try {
    const { athleteProfileId } = req.query;
    const { url } = req.body || {};
    if (!athleteProfileId || !url || typeof url !== 'string') {
      return res.status(400).json({ ok: false, message: 'Missing athleteProfileId or url' });
    }
    await destroyJumpDrillCloudinaryAssetIfOwned(url.trim());
    res.json({ ok: true });
  } catch (e) {
    console.error('deleteLogVideo', e);
    res.status(500).json({ ok: false, message: 'Failed to delete video' });
  }
}

module.exports = { uploadLogVideo, deleteLogVideo };
