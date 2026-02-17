const express = require('express');
const multer = require("multer");
const {
  deleteProfilePicture,
  deleteBackgroundImage,
  uploadProfileImage,
  uploadBackgroundImage,
  verifyImage,
  rejectImage,
  getAllUnverifiedImages,
  getPendingImagesForProfile,
  uploadConversationImage,
  deleteConversationImage
} = require('../controllers/imageUploadController');
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../controllers/cloudinaryConfig");
const { checkPermission } = require('../middlewares/mobileAuthMiddleware');


// Multer + Cloudinary Storage
const storage = (folder) => new CloudinaryStorage({
    cloudinary,
    params: {
      folder: folder,
      allowed_formats: ["jpg", "png", "jpeg"],
    },
});

const profileUpload = multer({ storage: storage("profile_pictures") });
const backgroundUpload = multer({ storage: storage("background_pictures") });
const conversationUpload = multer({ storage: storage("conversation_images") });

const imageUploadRoutes = (db) => {
  const router = express.Router();

  // TODO: permissions Middleware
  router.post('/profile/:athleteProfileId/headshot', profileUpload.single("image"), (req, res) => uploadProfileImage(req, res, db));
  router.post('/profile/:athleteProfileId/background', backgroundUpload.single("image"), (req, res) => uploadBackgroundImage(req, res, db));
  
  router.delete('/profile/:athleteProfileId/headshot', (req, res) => deleteProfilePicture(req, res, db));
  router.delete('/profile/:athleteProfileId/background', (req, res) => deleteBackgroundImage(req, res, db));

  router.post('/verify', checkPermission('verify_images'), (req, res) => verifyImage(req, res, db));
  router.post('/reject', checkPermission('verify_images'), (req, res) => rejectImage(req, res, db));
  router.get('/unverified', checkPermission('verify_images'), (req, res) => getAllUnverifiedImages(req, res, db));
  router.get('/profile/:athleteProfileId/pending', (req, res) => getPendingImagesForProfile(req, res, db));

  // Conversation image routes (protected by manage_conversations permission)
  router.post('/conversations/:conversationId',
    checkPermission('manage_conversations'), 
    conversationUpload.single("image"),
    (req, res) => uploadConversationImage(req, res, db)
  );
  router.delete('/conversations/:conversationId',
    checkPermission('manage_conversations'), 
    (req, res) => deleteConversationImage(req, res, db)
  );

  return router;
};

module.exports = imageUploadRoutes;