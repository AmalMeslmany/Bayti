const express = require("express");
const { createProperty } = require("../controllers/propertyController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createProperty);

module.exports = router;
