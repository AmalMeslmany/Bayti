const express = require("express");
const { createPropertyReport } = require("../controllers/reportController");

const router = express.Router();

router.post("/properties/:propertyId/reports", createPropertyReport);

module.exports = router;
