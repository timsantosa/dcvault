const cloudinary = require("cloudinary").v2;
const config = require('../config/config')

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true, // Ensures HTTPS URLs
});

module.exports = cloudinary;
