const multer = require("multer");

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

function imageFileFilter(req, file, callback) {
  if (!allowedImageTypes.includes(file.mimetype)) {
    const error = new Error("Only JPEG, PNG, and WebP images are allowed.");
    error.statusCode = 400;
    return callback(error);
  }

  return callback(null, true);
}

const uploadPropertyImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
});

module.exports = uploadPropertyImage;
