const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");
const getSupabaseClient = require("../config/supabase");

const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "property-images";

function sanitizeFilename(filename) {
  const basename = path.basename(filename, path.extname(filename));
  const safeBasename = basename.replace(/[^a-zA-Z0-9-]/g, "-");

  return safeBasename || "property-image";
}

async function optimizeImage(file, size = 1600) {
  try {
    const optimizedBuffer = await sharp(file.buffer)
      .rotate()
      .resize({
        width: size,
        height: size,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 80,
      })
      .toBuffer();

    return optimizedBuffer;
  } catch {
    const error = new Error("Unable to process image. Please upload a valid image file.");
    error.statusCode = 400;
    throw error;
  }
}

function getStoragePathFromPublicUrl(publicUrl) {
  if (!publicUrl) {
    return "";
  }

  const marker = `/storage/v1/object/public/${bucketName}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return "";
  }

  return decodeURIComponent(publicUrl.slice(markerIndex + marker.length));
}

async function uploadPropertyImage(file, userId) {
  const supabase = getSupabaseClient();
  const optimizedBuffer = await optimizeImage(file);
  const storagePath = `properties/${userId}/${Date.now()}-${crypto.randomUUID()}-${sanitizeFilename(
    file.originalname,
  )}.webp`;

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, optimizedBuffer, {
      contentType: "image/webp",
      upsert: false,
    });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath);

  return {
    url: data.publicUrl,
    path: storagePath,
    optimizedSize: optimizedBuffer.length,
    originalSize: file.size,
  };
}

async function uploadProfileImage(file, userId) {
  const supabase = getSupabaseClient();
  const optimizedBuffer = await optimizeImage(file, 800);
  const storagePath = `profile-images/${userId}/${Date.now()}-${crypto.randomUUID()}-${sanitizeFilename(
    file.originalname,
  )}.webp`;

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, optimizedBuffer, {
      contentType: "image/webp",
      upsert: false,
    });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath);

  return {
    url: data.publicUrl,
    path: storagePath,
    optimizedSize: optimizedBuffer.length,
    originalSize: file.size,
  };
}

async function uploadPropertyImages(files, userId) {
  const uploadedImages = [];

  try {
    for (const file of files) {
      const uploadedImage = await uploadPropertyImage(file, userId);
      uploadedImages.push({
        url: uploadedImage.url,
        path: uploadedImage.path,
      });
    }

    return uploadedImages;
  } catch (error) {
    await deletePropertyImages(uploadedImages.map((image) => image.path));
    throw error;
  }
}

async function deletePropertyImage(imagePath) {
  if (!imagePath) {
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(bucketName).remove([imagePath]);

  if (error) {
    console.error(`Supabase image cleanup failed: ${error.message}`);
  }
}

async function deletePropertyImages(imagePaths) {
  const validPaths = imagePaths.filter(Boolean);

  if (validPaths.length === 0) {
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(bucketName).remove(validPaths);

  if (error) {
    console.error(`Supabase image cleanup failed: ${error.message}`);
  }
}

module.exports = {
  deletePropertyImage,
  deletePropertyImages,
  getStoragePathFromPublicUrl,
  uploadProfileImage,
  uploadPropertyImage,
  uploadPropertyImages,
};
