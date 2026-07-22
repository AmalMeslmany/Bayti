const express = require("express");
const {
  getAuthenticatedUser,
  loginUser,
  registerUser,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/me", protect, getAuthenticatedUser);

module.exports = router;
