const express = require("express");
const {
  createProperty,
  getProperties,
} = require("../controllers/propertyController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getProperties);
router.post("/", protect, createProperty);

module.exports = router;
