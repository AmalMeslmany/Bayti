const Property = require("../models/Property");

async function createProperty(req, res) {
  try {
    const {
      title,
      description,
      price,
      location,
      bedrooms,
      bathrooms,
      area,
      image,
    } = req.body;

    const requiredTextFields = [title, description, location];
    const requiredNumberFields = [price, bedrooms, bathrooms, area];

    const hasMissingTextField = requiredTextFields.some(
      (field) => field === undefined || field === null || field.trim() === "",
    );
    const hasMissingNumberField = requiredNumberFields.some(
      (field) => field === undefined || field === null || field === "",
    );

    if (hasMissingTextField || hasMissingNumberField) {
      return res.status(400).json({
        status: "error",
        message: "All required property fields must be provided.",
      });
    }

    const property = await Property.create({
      title,
      description,
      price,
      location,
      bedrooms,
      bathrooms,
      area,
      image,
      owner: req.user._id,
    });

    return res.status(201).json({
      status: "success",
      message: "Property created successfully.",
      property,
    });
  } catch (error) {
    console.error(`Create property error: ${error.message}`);

    return res.status(500).json({
      status: "error",
      message: "Server error while creating property.",
    });
  }
}

module.exports = {
  createProperty,
};
