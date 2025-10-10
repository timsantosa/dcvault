const cloudinary = require("./cloudinaryConfig");
const { Op } = require('sequelize');

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

// Must be behind multer middleware
async function uploadProfileImage(req, res, db) {
  try {
    const { athleteProfileId } = req.body;
    if (!athleteProfileId) return res.status(400).json({ error: "User ID is required" });

    const newImageUrl = req.file.path;

    // Fetch the existing athlete's profile
    const athlete = await db.tables.AthleteProfiles.findByPk(athleteProfileId);
    if (!athlete) { return res.status(404).json({ error: "Athlete not found" }); }

    // Delete the old profile picture from Cloudinary
    if (athlete.profileImage) {
      const oldPublicId = getCloudinaryPublicId(athlete.profileImage);
      if (oldPublicId) await cloudinary.uploader.destroy(oldPublicId);
    }

    // Update the database with the new profile picture URL
    // athlete.profileImage = cloudinaryResponse.secure_url;
    athlete.profileImage = newImageUrl;
    athlete.profileImageVerified = req.user?.permissions?.includes('verify_images');
    await athlete.save();

    res.json({
      ok: true,
      imageUrl: newImageUrl,
      imageVerified: athlete.profileImageVerified,
      message: "Profile picture updated successfully."
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ error: "Failed to update profile picture" });
  }
};

// TODO: Identical, combine with profileImage
async function uploadBackgroundImage(req, res, db) {
  try {
    const { athleteProfileId } = req.body;
    if (!athleteProfileId) return res.status(400).json({ error: "Athlete Profile ID is required" });

    // Get the uploaded image URL from Multer
    const newImageUrl = req.file.path;

    // Fetch the athlete profile
    const athlete = await db.tables.AthleteProfiles.findByPk(athleteProfileId);
    if (!athlete) return res.status(404).json({ error: "Athlete not found" });

    // Delete old background image from Cloudinary
    if (athlete.backgroundImage) {
      const oldPublicId = getCloudinaryPublicId(athlete.backgroundImage);
      if (oldPublicId) await cloudinary.uploader.destroy(oldPublicId);
    }

    // Update the database
    athlete.backgroundImage = newImageUrl;
    athlete.backgroundImageVerified = req.user?.permissions?.includes('verify_images');
    await athlete.save();

    res.json({
      ok: true,
      imageUrl: newImageUrl,
      imageVerified: athlete.backgroundImageVerified,
      message: "Background picture updated successfully."
    });
  } catch (error) {
    console.error("Error updating background picture:", error);
    res.status(500).json({ error: "Failed to update background picture" });
  }
}

async function deleteProfilePicture(req, res, db) {
  try {
    const { athleteProfileId } = req.query;
    if (!athleteProfileId) return res.status(400).json({ error: "Athlete Profile ID is required" });

    const athlete = await db.tables.AthleteProfiles.findByPk(athleteProfileId);
    if (!athlete) return res.status(404).json({ error: "Athlete not found" });

    if (athlete.profileImage) {
      const oldPublicId = getCloudinaryPublicId(athlete.profileImage);
      if (oldPublicId) await cloudinary.uploader.destroy(oldPublicId);
      athlete.profileImage = null;
      athlete.profileImageVerified = false;
      await athlete.save();
    }

    res.json({ ok: true, message: "Profile picture deleted successfully." });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    res.status(500).json({ error: "Failed to delete profile picture" });
  }
}

async function deleteBackgroundImage(req, res, db) {
  try {
    const { athleteProfileId } = req.query;
    if (!athleteProfileId) return res.status(400).json({ error: "Athlete Profile ID is required" });

    const athlete = await db.tables.AthleteProfiles.findByPk(athleteProfileId);
    if (!athlete) return res.status(404).json({ error: "Athlete not found" });

    if (athlete.backgroundImage) {
      const oldPublicId = getCloudinaryPublicId(athlete.backgroundImage);
      if (oldPublicId) await cloudinary.uploader.destroy(oldPublicId);
      athlete.backgroundImage = null;
      athlete.backgroundImageVerified = false;
      await athlete.save();
    }

    res.json({ ok: true, message: "Background picture deleted successfully." });
  } catch (error) {
    console.error("Error deleting background picture:", error);
    res.status(500).json({ error: "Failed to delete background picture" });
  }
}

async function verifyImage(req, res, db) {
  try {
    const { athleteProfileId, forProfileImage } = req.body;
    if (!athleteProfileId) return res.status(400).json({ error: "Athlete Profile ID is required" });

    const athlete = await db.tables.AthleteProfiles.findByPk(athleteProfileId);
    if (!athlete) return res.status(404).json({ error: "Athlete not found" });

    if (forProfileImage) {
      athlete.profileImageVerified = true;
      await athlete.save();
    } else { // Then veriy background image
      athlete.backgroundImageVerified = true;
      await athlete.save();
    }

    res.json({ ok: true, message: `${forProfileImage ? 'Profile' : 'Background'} picture verified successfully.` });
  } catch (error) {
    console.error("Error verifying image:", error);
    res.status(500).json({ ok: false, error: "Failed to verify image." });
  }
}

async function getAllUnverifiedImages(req, res, db) {
  try {
    const unverifiedProfiles = await db.tables.AthleteProfiles.findAll({
      where: {
        [Op.or]: [
          {
            profileImage: { [Op.ne]: null },
            profileImageVerified: false
          },
          {
            backgroundImage: { [Op.ne]: null },
            backgroundImageVerified: false
          }
        ]
      },
      attributes: ['id', 'firstName', 'lastName', 'profileImage', 'backgroundImage', 'profileImageVerified', 'backgroundImageVerified']
    });

    res.json({ ok: true, profiles: unverifiedProfiles });
  } catch (error) {
    console.error("Error fetching unverified images:", error);
    res.status(500).json({ error: "Failed to fetch unverified images" });
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
      const oldPublicId = getCloudinaryPublicId(conversation.imageUrl);
      if (oldPublicId) await cloudinary.uploader.destroy(oldPublicId); 
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
      const oldPublicId = getCloudinaryPublicId(conversation.imageUrl);
      if (oldPublicId) await cloudinary.uploader.destroy(oldPublicId);
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
  getAllUnverifiedImages,
  uploadConversationImage,
  deleteConversationImage
};
