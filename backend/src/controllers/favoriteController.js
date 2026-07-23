const mongoose = require("mongoose");
const Property = require("../models/Property");
const User = require("../models/User");

function isInvalidPropertyId(propertyId) {
  return !mongoose.Types.ObjectId.isValid(propertyId);
}

async function getFavorites(req, res) {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate({
        path: "favorites",
        populate: {
          path: "owner",
          select: "firstName lastName email",
        },
      });

    return res.status(200).json({
      status: "success",
      count: user.favorites.length,
      favorites: user.favorites,
    });
  } catch (error) {
    console.error(`Get favorites error: ${error.message}`);

    return res.status(500).json({
      status: "error",
      message: "Server error while fetching favorites.",
    });
  }
}

async function addFavorite(req, res) {
  try {
    const { propertyId } = req.params;

    if (isInvalidPropertyId(propertyId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid property id.",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found.",
      });
    }

    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { favorites: property._id } },
    );

    const user = await User.findById(req.user._id)
      .select("-password")
      .populate({
        path: "favorites",
        populate: {
          path: "owner",
          select: "firstName lastName email",
        },
      });

    return res.status(200).json({
      status: "success",
      message: "Property added to favorites.",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error(`Add favorite error: ${error.message}`);

    return res.status(500).json({
      status: "error",
      message: "Server error while adding favorite.",
    });
  }
}

async function removeFavorite(req, res) {
  try {
    const { propertyId } = req.params;

    if (isInvalidPropertyId(propertyId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid property id.",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found.",
      });
    }

    await User.updateOne(
      { _id: req.user._id },
      { $pull: { favorites: propertyId } },
    );

    return res.status(200).json({
      status: "success",
      message: "Property removed from favorites.",
    });
  } catch (error) {
    console.error(`Remove favorite error: ${error.message}`);

    return res.status(500).json({
      status: "error",
      message: "Server error while removing favorite.",
    });
  }
}

module.exports = {
  addFavorite,
  getFavorites,
  removeFavorite,
};
