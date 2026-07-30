const express = require("express");
const { updateProfile } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const uploadPropertyImage = require("../middleware/uploadMiddleware");

const router = express.Router();

router.put(
  "/profile",
  protect,
  uploadPropertyImage.single("profileImage"),
  updateProfile,
);

module.exports = router;
