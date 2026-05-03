/**
 * Parsing + destroy helpers for Cloudinary delivery URLs and dual-account (legacy vs primary) credentials.
 */

const cloudinary = require('cloudinary').v2;
const config = require('../config/config');

/**
 * Segment that looks like a transformation token vs a folder/file path segment.
 * Stored upload URLs rarely include transformations; this covers common patterns.
 */
function looksLikeTransformationSegment(seg) {
  if (seg.includes(',')) return true;
  if (/^[a-z]{1,4}_/i.test(seg)) return true;
  return false;
}

/**
 * Strip format extension only for types where Cloudinary's public_id omits it.
 * Raw uploads keep their extension as part of the public_id (e.g. .pdf).
 */
function stripPublicIdTrailingExtension(segment, resourceType) {
  if (resourceType === 'raw') return segment;
  return segment.replace(/\.[^/.]+$/, '');
}

/**
 * Parses res.cloudinary.com delivery URLs → cloud name, resource type, public_id.
 * @returns {{ cloudName: string, resourceType: string, publicId: string } | null}
 */
function parseResCloudinaryUrl(secureUrl) {
  if (!secureUrl || typeof secureUrl !== 'string') return null;
  try {
    const u = new URL(secureUrl);
    const isCloudinaryDelivery =
      u.hostname === 'res.cloudinary.com' || u.hostname.endsWith('.res.cloudinary.com');
    if (!isCloudinaryDelivery) return null;

    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 4) return null;

    const cloudName = parts[0];
    const resourceType = parts[1] === 'fetch' ? 'image' : (parts[1] || 'image');
    const uploadIdx = parts.indexOf('upload');
    if (uploadIdx === -1 || uploadIdx >= parts.length - 1) return null;

    let rest = parts.slice(uploadIdx + 1);
    while (rest.length > 0 && looksLikeTransformationSegment(rest[0])) {
      rest.shift();
    }

    if (rest[0]?.match(/^v\d+$/i)) {
      rest = rest.slice(1);
    }

    if (rest.length === 0) return null;

    const publicSegments = [...rest];
    const lastIdx = publicSegments.length - 1;
    publicSegments[lastIdx] = stripPublicIdTrailingExtension(publicSegments[lastIdx], resourceType);

    return {
      cloudName,
      resourceType,
      publicId: publicSegments.join('/'),
    };
  } catch (_) {
    return null;
  }
}

function snakeCredentials(triple) {
  return {
    cloud_name: triple.cloudName,
    api_key: triple.apiKey,
    api_secret: triple.apiSecret,
  };
}

function primaryTriple() {
  return config.cloudinaryPrimary;
}

function legacyTripleOptional() {
  return config.cloudinaryLegacy || null;
}

/** Options passed into uploader.destroy so deletes hit the cloud that owns the asset. */
function credentialOptionsForCloudName(cloudName) {
  const primary = primaryTriple();
  const legacy = legacyTripleOptional();

  if (legacy && cloudName && legacy.cloudName === cloudName) {
    return snakeCredentials(legacy);
  }

  return snakeCredentials(primary);
}

function destroySucceeded(result) {
  return result && String(result.result) === 'ok';
}

async function invokeDestroy(publicId, baseOptions) {
  try {
    return await cloudinary.uploader.destroy(publicId, baseOptions);
  } catch (err) {
    if (err && (err.http_code === 404 || err.error?.http_code === 404)) {
      return { result: 'not found' };
    }
    throw err;
  }
}

/**
 * Fallback public_id extraction when transformations block full parse:
 * pathname after `/upload/`, strips optional leading `v123`.
 */
function naivePublicIdFromDeliveryUrl(imageUrl) {
  try {
    const pathname = new URL(imageUrl).pathname;
    const partsEarly = pathname.split('/').filter(Boolean);
    const resourceType =
      partsEarly[1] === 'fetch' ? 'image' : (partsEarly[1] || 'image');

    const marker = '/upload/';
    const idx = pathname.indexOf(marker);
    if (idx === -1) return null;
    let segmentList = pathname.slice(idx + marker.length).split('/').filter(Boolean);

    while (segmentList.length > 0 && looksLikeTransformationSegment(segmentList[0])) {
      segmentList.shift();
    }
    while (segmentList[0]?.match(/^v\d+$/i)) {
      segmentList = segmentList.slice(1);
    }
    if (segmentList.length === 0) return null;

    const lastIx = segmentList.length - 1;
    segmentList[lastIx] = stripPublicIdTrailingExtension(segmentList[lastIx], resourceType);
    return segmentList.join('/');
  } catch (_) {
    return null;
  }
}

/**
 * Delete by stored profile/background/conversation delivery URL.
 */
async function destroyByImageUrl(imageUrl) {
  if (!imageUrl) return;
  let parsed = parseResCloudinaryUrl(imageUrl);
  let publicId = parsed && parsed.publicId;
  let cloudFromUrl = parsed && parsed.cloudName;
  let resourceType = (parsed && parsed.resourceType) || 'image';

  if (!publicId) {
    publicId = naivePublicIdFromDeliveryUrl(imageUrl);
    try {
      cloudFromUrl = new URL(imageUrl).pathname.split('/').filter(Boolean)[0] || cloudFromUrl;
    } catch (_) {
      cloudFromUrl = cloudFromUrl || '';
    }
  }

  if (!publicId) {
    console.warn('[cloudinary] destroyByImageUrl: could not resolve public id', imageUrl);
    return;
  }

  const credentials = credentialOptionsForCloudName(cloudFromUrl || '');

  const result = await invokeDestroy(publicId, {
    resource_type: resourceType,
    ...credentials,
  });
  if (!destroySucceeded(result)) {
    console.warn('[cloudinary] destroyByImageUrl: non-ok result', imageUrl.slice(0, 120), result && result.result);
  }
}

/**
 * Delete persisted message attachment ({ publicId, resourceType?, url? }).
 * Uses URL’s cloud_name when possible; otherwise tries primary → legacy fallback.
 */
async function destroyStoredMessageAttachment(att) {
  if (!att || !att.publicId) return;
  const publicId = att.publicId;
  const resourceType = att.resourceType || 'image';

  if (typeof att.url === 'string' && att.url.includes('res.cloudinary.com')) {
    const parsed = parseResCloudinaryUrl(att.url);
    const cloudGuess = parsed && parsed.cloudName;
    const cred =
      typeof cloudGuess === 'string' ? credentialOptionsForCloudName(cloudGuess) : null;

    const rt =
      parsed && parsed.resourceType
        ? parsed.resourceType
        : resourceType || 'image';

    const result = cred
      ? await invokeDestroy(publicId, {
          resource_type: rt,
          ...cred,
        })
      : { result: 'not found' };

    if (destroySucceeded(result)) return;
  }

  await destroyPublicIdWithDualFallback(publicId, resourceType);
}

/**
 * Orphan compose-cancel uploads: try primary Cloud first, then legacy if configured.
 */
async function destroyPublicIdWithDualFallback(publicId, resourceType = 'image') {
  const primaryOpts = {
    resource_type: resourceType,
    ...snakeCredentials(primaryTriple()),
  };
  let r = await invokeDestroy(publicId, primaryOpts);

  const legacy = legacyTripleOptional();

  if (destroySucceeded(r) || !legacy) {
    if (!destroySucceeded(r) && !legacy) {
      console.warn('[cloudinary] destroyPublicId fallback: not ok', publicId.slice(0, 80), r && r.result);
    }
    return;
  }

  r = await invokeDestroy(publicId, {
    resource_type: resourceType,
    ...snakeCredentials(legacy),
  });
  if (!destroySucceeded(r)) {
    console.warn('[cloudinary] destroyPublicId legacy: not ok', publicId.slice(0, 80), r && r.result);
  }
}

/** Cloudinary folder for jump/drill log videos (must match upload folder). */
const JUMP_DRILL_VIDEO_FOLDER = 'jump_drill_video';

function isJumpDrillCloudinaryDeliveryUrl(imageUrl) {
  const parsed = parseResCloudinaryUrl(imageUrl);
  if (!parsed) return false;
  if (parsed.resourceType !== 'video') return false;
  const prefix = `${JUMP_DRILL_VIDEO_FOLDER}/`;
  return parsed.publicId.startsWith(prefix);
}

/** Safe delete only for app-owned jump/drill videos (ignored for external URLs). */
async function destroyJumpDrillCloudinaryAssetIfOwned(imageUrl) {
  if (!isJumpDrillCloudinaryDeliveryUrl(imageUrl)) return;
  await destroyByImageUrl(imageUrl);
}

module.exports = {
  destroyByImageUrl,
  destroyJumpDrillCloudinaryAssetIfOwned,
  destroyPublicIdWithDualFallback,
  destroyStoredMessageAttachment,
  parseResCloudinaryUrl,
  naivePublicIdFromDeliveryUrl,
  credentialOptionsForCloudName,
  JUMP_DRILL_VIDEO_FOLDER,
  isJumpDrillCloudinaryDeliveryUrl,
};
