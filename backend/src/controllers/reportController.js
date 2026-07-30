const mongoose = require("mongoose");
const Property = require("../models/Property");
const PropertyReport = require("../models/PropertyReport");

const allowedReasons = [
  "Fake Listing",
  "Inappropriate Images",
  "Spam",
  "Wrong Information",
  "Other",
];

async function createPropertyReport(req, res) {
  try {
    const { propertyId } = req.params;
    const { reason, details, name, email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ status: "error", message: "Invalid property id." });
    }

    if (!allowedReasons.includes(reason)) {
      return res.status(400).json({ status: "error", message: "Invalid report reason." });
    }

    const property = await Property.findById(propertyId);

    if (!property || property.isHidden) {
      return res.status(404).json({ status: "error", message: "Property not found." });
    }

    const report = await PropertyReport.create({
      property: propertyId,
      reporter: req.user?._id,
      reason,
      details,
      name,
      email,
    });

    return res.status(201).json({
      status: "success",
      message: "Property report submitted successfully.",
      report,
    });
  } catch (error) {
    console.error(`Create property report error: ${error.message}`);
    return res.status(500).json({
      status: "error",
      message: "Server error while submitting report.",
    });
  }
}

module.exports = { createPropertyReport };
