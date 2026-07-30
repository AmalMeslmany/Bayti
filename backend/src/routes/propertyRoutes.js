const express = require("express");
const {
  createProperty,
  deleteProperty,
  getMyProperties,
  getPropertyById,
  getProperties,
  updateProperty,
} = require("../controllers/propertyController");
const protect = require("../middleware/authMiddleware");
const uploadPropertyImage = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getProperties);
router.get("/mine/list", protect, getMyProperties);
router.get("/:id", getPropertyById);
router.post("/", protect, uploadPropertyImage.array("images", 5), createProperty);
router.put("/:id", protect, uploadPropertyImage.array("images", 5), updateProperty);
router.delete("/:id", protect, deleteProperty);

module.exports = router;
