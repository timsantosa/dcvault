const express = require('express');
const multer = require("multer");
const { 
  deleteProfilePicture, 
  deleteBackgroundImage, 
  uploadProfileImage, 
  uploadBackgroundImage, 
  verifyImage,
  getAllUnverifiedImages
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

const imageUploadRoutes = (db) => {
  const router = express.Router();

  // TODO: permissions Middleware
  router.post('/headshot', profileUpload.single("image"), (req, res) => uploadProfileImage(req, res, db));
  router.post('/background', backgroundUpload.single("image"), (req, res) => uploadBackgroundImage(req, res, db));
  
  router.delete('/headshot', (req, res) => deleteProfilePicture(req, res, db));
  router.delete('/background', (req, res) => deleteBackgroundImage(req, res, db));

  router.post('/verify', checkPermission('verify_images'), (req, res) => verifyImage(req, res, db));
  router.get('/unverified', checkPermission('verify_images'), (req, res) => getAllUnverifiedImages(req, res, db));

  return router;
};

module.exports = imageUploadRoutes;