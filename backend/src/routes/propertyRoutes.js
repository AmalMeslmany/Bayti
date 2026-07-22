const express = require("express");
const {
  createProperty,
  getPropertyById,
  getProperties,
} = require("../controllers/propertyController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getPropertyById);
router.post("/", protect, createProperty);

module.exports = router;
