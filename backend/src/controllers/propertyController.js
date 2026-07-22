const mongoose = require("mongoose");
const Property = require("../models/Property");

async function getProperties(req, res) {
  try {
    const properties = await Property.find()
      .sort({ createdAt: -1 })
      .populate("owner", "firstName lastName email");

    return res.status(200).json({
      status: "success",
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error(`Get properties error: ${error.message}`);

    return res.status(500).json({
      status: "error",
      message: "Server error while fetching properties.",
    });
  }
}

async function getPropertyById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid property id.",
      });
    }

    const property = await Property.findById(id).populate(
      "owner",
      "firstName lastName email",
    );

    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      property,
    });
  } catch (error) {
    console.error(`Get property by id error: ${error.message}`);

    return res.status(500).json({
      status: "error",
      message: "Server error while fetching property.",
    });
  }
}

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

async function updateProperty(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid property id.",
      });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found.",
      });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to update this property.",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "price",
      "location",
      "bedrooms",
      "bathrooms",
      "area",
      "image",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        property[field] = req.body[field];
      }
    });

    const updatedProperty = await property.save();

    return res.status(200).json({
      status: "success",
      message: "Property updated successfully.",
      property: updatedProperty,
    });
  } catch (error) {
    console.error(`Update property error: ${error.message}`);

    return res.status(500).json({
      status: "error",
      message: "Server error while updating property.",
    });
  }
}

module.exports = {
  createProperty,
  getPropertyById,
  getProperties,
  updateProperty,
};
