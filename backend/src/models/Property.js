const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    area: {
      type: Number,
      required: true,
      min: 0,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    imagePath: {
      type: String,
      trim: true,
    },
    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
            trim: true,
          },
          path: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      validate: {
        validator(images) {
          return images.length <= 5;
        },
        message: "A property can have a maximum of 5 images.",
      },
      default: [],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    hiddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    hiddenAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
