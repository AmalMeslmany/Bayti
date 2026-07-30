const express = require("express");
const {
  deleteAdminProperty,
  deleteAdminPropertyImage,
  deleteAdminUser,
  deleteContactMessage,
  dismissReport,
  getAdminProperties,
  getAdminSummary,
  getAdminUsers,
  getContactMessages,
  getReports,
  setPropertyHidden,
  updateAdminUser,
  updateContactMessage,
} = require("../controllers/adminController");
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, requireAdmin);

router.get("/summary", getAdminSummary);
router.get("/properties", getAdminProperties);
router.patch("/properties/:id/visibility", setPropertyHidden);
router.delete("/properties/:id", deleteAdminProperty);
router.delete("/properties/:id/images", deleteAdminPropertyImage);
router.get("/users", getAdminUsers);
router.patch("/users/:id", updateAdminUser);
router.delete("/users/:id", deleteAdminUser);
router.get("/contact-messages", getContactMessages);
router.patch("/contact-messages/:id", updateContactMessage);
router.delete("/contact-messages/:id", deleteContactMessage);
router.get("/reports", getReports);
router.patch("/reports/:id/dismiss", dismissReport);

module.exports = router;
