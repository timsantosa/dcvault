const cloudinary = require("./cloudinaryConfig");
const NotificationUtils = require('../utils/notificationUtils');
const { athleteProfileBelongsToUser } = require('../middlewares/mobileAuthMiddleware');

// Configure Cloudinary
// const cloudConfig = cloudinary.config({
//   cloud_name: config.cloudinary.cloudName,
//   api_key: config.cloudinary.apiKey,
//   api_secret: config.cloudinary.apiSecret,
//   secure: true, // Ensures HTTPS URLs
// });


// Function to extract Cloudinary public ID from the stored URL
const getCloudinaryPublicId = (imageUrl) => {
  if (!imageUrl) return null;
  const parts = imageUrl.split("/");
  return parts[parts.length - 1].split(".")[0]; // Extracts "filename" from ".../profile_abc123.jpg"
};

// Function to delete an image from Cloudinary
const deleteCloudinaryImage = async (imageUrl) => {
  if (!imageUrl) return;
  const publicId = getCloudinaryPublicId(imageUrl);
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
};

const IMAGE_TYPE_PROFILE = 'profile';
const IMAGE_TYPE_BACKGROUND = 'background';

function getProfileImageField(imageType) {
  return imageType === IMAGE_TYPE_PROFILE ? 'profileImage' : 'backgroundImage';
}

function getImageTypeLabel(imageType) {
  return imageType === IMAGE_TYPE_PROFILE ? 'Profile' : 'Background';
}

async function uploadProfileOrBackgroundImage(req, res, db, imageType) {
  const athleteProfileId = req.body.athleteProfileId || req.params.athleteProfileId;
  if (!athleteProfileId) return res.status(400).json({ error: "Athlete Profile ID is required" });

  const newImageUrl = req.file.path;
  const canVerifyImages = req.user?.permissions?.includes('verify_images');
  const profileField = getProfileImageField(imageType);
  const label = getImageTypeLabel(imageType);

  const athlete = await db.tables.AthleteProfiles.findByPk(athleteProfileId);
  if (!athlete) return res.status(404).json({ error: "Athlete not found" });

  if (canVerifyImages) {
    const currentUrl = athlete[profileField];
    if (currentUrl) await deleteCloudinaryImage(currentUrl);
    athlete[profileField] = newImageUrl;
    await athlete.save();
    const existingPending = await db.tables.PendingImages.findOne({
      where: { athleteProfileId, imageType }
    });
    if (existingPending) {
      await deleteCloudinaryImage(existingPending.imageUrl);
      await existingPending.destroy();
    }
    return res.json({
      ok: true,
      imageUrl: newImageUrl,
      message: `${label} picture updated successfully.`
    });
  }

  let pending = await db.tables.PendingImages.findOne({
    where: { athleteProfileId, imageType, rejected: false }
  });
  if (pending) {
    await deleteCloudinaryImage(pending.imageUrl);
    pending.imageUrl = newImageUrl;
    pending.rejectionMessage = null;
    await pending.save();
  } else {
    pending = await db.tables.PendingImages.create({
      athleteProfileId,
      imageUrl: newImageUrl,
      imageType
    });
  }
  res.json({
    ok: true,
    imageUrl: newImageUrl,
    pending: true,
    message: "Image submitted for verification."
  });
}

async function deleteProfileOrBackgroundImage(req, res, db, imageType) {
  const athleteProfileId = req.query.athleteProfileId || req.params.athleteProfileId;
  if (!athleteProfileId) return res.status(400).json({ error: "Athlete Profile ID is required" });

  const athlete = await db.tables.AthleteProfiles.findByPk(athleteProfileId);
  if (!athlete) return res.status(404).json({ error: "Athlete not found" });

  const profileField = getProfileImageField(imageType);
  const pending = await db.tables.PendingImages.findOne({
    where: { athleteProfileId, imageType }
  });
  if (pending) {
    await deleteCloudinaryImage(pending.imageUrl);
    await pending.destroy();
  }
  if (athlete[profileField]) {
    await deleteCloudinaryImage(athlete[profileField]);
    athlete[profileField] = null;
    await athlete.save();
  }

  const label = getImageTypeLabel(imageType);
  res.json({ ok: true, message: `${label} picture deleted successfully.` });
}

async function uploadProfileImage(req, res, db) {
  try {
    await uploadProfileOrBackgroundImage(req, res, db, IMAGE_TYPE_PROFILE);
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ error: "Failed to update profile picture" });
  }
}

async function uploadBackgroundImage(req, res, db) {
  try {
    await uploadProfileOrBackgroundImage(req, res, db, IMAGE_TYPE_BACKGROUND);
  } catch (error) {
    console.error("Error updating background picture:", error);
    res.status(500).json({ error: "Failed to update background picture" });
  }
}

async function deleteProfilePicture(req, res, db) {
  try {
    await deleteProfileOrBackgroundImage(req, res, db, IMAGE_TYPE_PROFILE);
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    res.status(500).json({ error: "Failed to delete profile picture" });
  }
}

async function deleteBackgroundImage(req, res, db) {
  try {
    await deleteProfileOrBackgroundImage(req, res, db, IMAGE_TYPE_BACKGROUND);
  } catch (error) {
    console.error("Error deleting background picture:", error);
    res.status(500).json({ error: "Failed to delete background picture" });
  }
}

async function verifyImage(req, res, db) {
  try {
    const { pendingImageId } = req.body;
    if (!pendingImageId) return res.status(400).json({ error: "Pending image ID is required" });

    const pending = await db.tables.PendingImages.findByPk(pendingImageId);
    if (!pending) return res.status(404).json({ error: "Pending image not found" });
    if (pending.rejected) return res.status(400).json({ error: "Cannot verify a rejected image." });

    const athlete = await db.tables.AthleteProfiles.findByPk(pending.athleteProfileId);
    if (!athlete) return res.status(404).json({ error: "Athlete profile not found" });

    const profileField = getProfileImageField(pending.imageType);
    if (athlete[profileField]) await deleteCloudinaryImage(athlete[profileField]);
    athlete[profileField] = pending.imageUrl;
    await athlete.save();
    await pending.destroy();

    const label = getImageTypeLabel(pending.imageType);
    res.json({ ok: true, message: `${label} picture verified successfully.` });
  } catch (error) {
    console.error("Error verifying image:", error);
    res.status(500).json({ ok: false, error: "Failed to verify image." });
  }
}

async function rejectImage(req, res, db) {
  try {
    const { pendingImageId, message } = req.body;
    if (!pendingImageId || message == null || message === '') {
      return res.status(400).json({ error: "Pending image ID and rejection message are required" });
    }

    const pending = await db.tables.PendingImages.findByPk(pendingImageId);
    if (!pending) return res.status(404).json({ error: "Pending image not found" });
    if (pending.rejected) return res.status(400).json({ error: "Image is already rejected." });

    pending.rejected = true;
    pending.rejectionMessage = message;
    await pending.save();

    // TODO: Maybe send message instead of just a notification.
    const imageLabel = getImageTypeLabel(pending.imageType).toLowerCase();
    const body = `Your ${imageLabel} image was rejected: ${message}`;
    try {
      await NotificationUtils.sendNotificationToAthleteProfiles(
        [pending.athleteProfileId],
        'Image Rejected',
        body,
        { type: 'image_rejection', pendingImageId: pending.id, rejectionMessage: message }
      );
    } catch (notificationError) {
      console.error('Error sending image rejection notification:', notificationError);
    }

    res.json({ ok: true, message: "Image rejected successfully." });
  } catch (error) {
    console.error("Error rejecting image:", error);
    res.status(500).json({ ok: false, error: "Failed to reject image." });
  }
}

async function getAllUnverifiedImages(req, res, db) {
  try {
    const pendingImages = await db.tables.PendingImages.findAll({
      where: { rejected: false },
      include: [{
        model: db.tables.AthleteProfiles,
        as: 'athleteProfile',
        attributes: ['id', 'firstName', 'lastName']
      }]
    });

    res.json({ ok: true, pendingImages });
  } catch (error) {
    console.error("Error fetching unverified images:", error);
    res.status(500).json({ error: "Failed to fetch unverified images" });
  }
}

async function getPendingImagesForProfile(req, res, db) {
  try {
    const athleteProfileId = req.params.athleteProfileId || req.query.athleteProfileId;
    if (!athleteProfileId) return res.status(400).json({ error: "Athlete Profile ID is required" });

    const canAccess = req.user?.permissions?.includes('verify_images') || athleteProfileBelongsToUser(parseInt(athleteProfileId, 10), req.user);
    if (!canAccess) return res.status(403).json({ error: "You can only view pending images for your own profile." });

    const pendingImages = await db.tables.PendingImages.findAll({
      where: { athleteProfileId },
      order: [['createdAt', 'DESC']]
    });

    res.json({ ok: true, pendingImages });
  } catch (error) {
    console.error("Error fetching pending images for profile:", error);
    res.status(500).json({ error: "Failed to fetch pending images" });
  }
}

async function uploadConversationImage(req, res, db) {
  try {
    const { conversationId } = req.params;
    if (!conversationId) return res.status(400).json({ error: "Conversation ID is required" });

    const newImageUrl = req.file.path;

    // Fetch the existing conversation
    const conversation = await db.tables.Conversations.findByPk(conversationId);
    if (!conversation) { 
      return res.status(404).json({ error: "Conversation not found" }); 
    }

    // Delete the old conversation image from Cloudinary
    if (conversation.imageUrl) {
      await deleteCloudinaryImage(conversation.imageUrl);
    }

    // Update the database with the new conversation image URL
    conversation.imageUrl = newImageUrl;
    await conversation.save();

    res.json({
      ok: true,
      imageUrl: newImageUrl,
      message: "Conversation image updated successfully."
    });
  } catch (error) {
    console.error("Error updating conversation image:", error);
    res.status(500).json({ error: "Failed to update conversation image" });
  }
}

async function deleteConversationImage(req, res, db) {
  try {
    const { conversationId } = req.params;
    if (!conversationId) return res.status(400).json({ error: "Conversation ID is required" });

    const conversation = await db.tables.Conversations.findByPk(conversationId);
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    if (conversation.imageUrl) {
      await deleteCloudinaryImage(conversation.imageUrl);
      conversation.imageUrl = null;
      await conversation.save();
    }

    res.json({ ok: true, message: "Conversation image deleted successfully." });
  } catch (error) {
    console.error("Error deleting conversation image:", error);
    res.status(500).json({ error: "Failed to delete conversation image" });
  }
}

module.exports = {
  uploadProfileImage,
  uploadBackgroundImage,
  deleteProfilePicture,
  deleteBackgroundImage,
  verifyImage,
  rejectImage,
  getAllUnverifiedImages,
  getPendingImagesForProfile,
  uploadConversationImage,
  deleteConversationImage,
  deleteCloudinaryImage
};
