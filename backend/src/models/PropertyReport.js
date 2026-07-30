const mongoose = require("mongoose");

const propertyReportSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    reason: {
      type: String,
      enum: [
        "Fake Listing",
        "Inappropriate Images",
        "Spam",
        "Wrong Information",
        "Other",
      ],
      required: true,
    },
    details: { type: String, trim: true },
    status: {
      type: String,
      enum: ["open", "dismissed"],
      default: "open",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PropertyReport", propertyReportSchema);
