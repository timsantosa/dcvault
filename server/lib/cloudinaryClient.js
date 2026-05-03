const cloudinary = require('cloudinary').v2;
const config = require('../config/config');

const primary = config.cloudinaryPrimary;

// Global SDK singleton: uploads → primary Cloudinary account only
cloudinary.config({
  cloud_name: primary.cloudName,
  api_key: primary.apiKey,
  api_secret: primary.apiSecret,
  secure: true,
});

module.exports = cloudinary;
