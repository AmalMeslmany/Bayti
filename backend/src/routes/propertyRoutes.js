const express = require("express");
const {
  createProperty,
  deleteProperty,
  getPropertyById,
  getProperties,
  updateProperty,
} = require("../controllers/propertyController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getPropertyById);
router.post("/", protect, createProperty);
router.put("/:id", protect, updateProperty);
router.delete("/:id", protect, deleteProperty);

module.exports = router;
