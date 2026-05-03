const cloudinary = require('./cloudinaryClient');

function getCloudinaryResourceType(mimetype) {
  if (!mimetype) return 'raw';
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return 'raw';
}

/**
 * Upload a file buffer to Cloudinary (primary account).
 * @param {{ buffer: Buffer, mimetype?: string, folder: string }} opts
 * @returns {Promise<{ secure_url: string, public_id: string, resourceType: string }>}
 */
async function uploadBufferToCloudinary({ buffer, mimetype, folder }) {
  const resourceType = getCloudinaryResourceType(mimetype);
  const dataUri = `data:${mimetype || 'application/octet-stream'};base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    resource_type: resourceType,
    folder,
  });
  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    resourceType,
  };
}

module.exports = {
  getCloudinaryResourceType,
  uploadBufferToCloudinary,
};
