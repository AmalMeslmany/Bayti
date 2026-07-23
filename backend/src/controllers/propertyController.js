const mongoose = require("mongoose");
const Property = require("../models/Property");
const {
  deletePropertyImages,
  uploadPropertyImages,
} = require("../utils/supabaseStorage");

function getCompatibleImages(property) {
  if (property.images && property.images.length > 0) {
    return property.images;
  }

  if (property.image) {
    return [
      {
        url: property.image,
        path: property.imagePath || "",
      },
    ];
  }

  return [];
}

function serializeProperty(property) {
  const propertyObject =
    typeof property.toObject === "function" ? property.toObject() : property;
  const images = getCompatibleImages(propertyObject);

  return {
    ...propertyObject,
    images,
    image: images[0]?.url || propertyObject.image || "",
    imagePath: images[0]?.path || propertyObject.imagePath || "",
  };
}

function parseRemoveImagePaths(value) {
  if (!value) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(value);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter((path) => typeof path === "string" && path);
  } catch {
    const error = new Error("removeImagePaths must be a JSON array.");
    error.statusCode = 400;
    throw error;
  }
}

async function getProperties(req, res) {
  try {
    const properties = await Property.find()
      .sort({ createdAt: -1 })
      .populate("owner", "firstName lastName email");

    return res.status(200).json({
      status: "success",
      count: properties.length,
      properties: properties.map(serializeProperty),
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
      property: serializeProperty(property),
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

    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "At least one property image is required.",
      });
    }

    const uploadedImages = await uploadPropertyImages(files, req.user._id);

    const property = await Property.create({
      title,
      description,
      price,
      location,
      bedrooms,
      bathrooms,
      area,
      images: uploadedImages,
      image: uploadedImages[0].url,
      imagePath: uploadedImages[0].path,
      owner: req.user._id,
    });

    return res.status(201).json({
      status: "success",
      message: "Property created successfully.",
      property: serializeProperty(property),
    });
  } catch (error) {
    console.error(`Create property error: ${error.message}`);

    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.statusCode
        ? error.message
        : "Server error while creating property.",
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
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        property[field] = req.body[field];
      }
    });

    const removeImagePaths = parseRemoveImagePaths(req.body.removeImagePaths);
    const existingImages = getCompatibleImages(property);
    const remainingImages = existingImages.filter(
      (image) => !removeImagePaths.includes(image.path),
    );
    const files = req.files || [];

    if (remainingImages.length + files.length > 5) {
      return res.status(400).json({
        status: "error",
        message: "A property can have a maximum of 5 images.",
      });
    }

    if (remainingImages.length + files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "At least one property image is required.",
      });
    }

    let uploadedImages = [];

    if (files.length > 0) {
      uploadedImages = await uploadPropertyImages(files, req.user._id);
    }

    property.images = [...remainingImages, ...uploadedImages];
    property.image = property.images[0]?.url || "";
    property.imagePath = property.images[0]?.path || "";

    let updatedProperty;

    try {
      updatedProperty = await property.save();
    } catch (error) {
      await deletePropertyImages(uploadedImages.map((image) => image.path));
      throw error;
    }

    await deletePropertyImages(removeImagePaths);

    return res.status(200).json({
      status: "success",
      message: "Property updated successfully.",
      property: serializeProperty(updatedProperty),
    });
  } catch (error) {
    console.error(`Update property error: ${error.message}`);

    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.statusCode
        ? error.message
        : "Server error while updating property.",
    });
  }
}

async function deleteProperty(req, res) {
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
        message: "You are not authorized to delete this property.",
      });
    }

    await property.deleteOne();
    await deletePropertyImages(getCompatibleImages(property).map((image) => image.path));

    return res.status(200).json({
      status: "success",
      message: "Property deleted successfully.",
    });
  } catch (error) {
    console.error(`Delete property error: ${error.message}`);

    return res.status(500).json({
      status: "error",
      message: "Server error while deleting property.",
    });
  }
}

module.exports = {
  createProperty,
  deleteProperty,
  getPropertyById,
  getProperties,
  updateProperty,
};
