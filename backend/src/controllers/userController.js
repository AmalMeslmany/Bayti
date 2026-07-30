const User = require("../models/User");
const { serializeUser } = require("./authController");
const {
  deletePropertyImage,
  getStoragePathFromPublicUrl,
  uploadProfileImage,
} = require("../utils/supabaseStorage");

async function updateProfile(req, res) {
  try {
    const { firstName, lastName, removeProfileImage } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        status: "error",
        message: "First name and last name are required.",
      });
    }

    const currentUser = await User.findById(req.user._id).select("-password");

    if (!currentUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }

    const oldProfileImagePath = getStoragePathFromPublicUrl(
      currentUser.profileImage,
    );
    let uploadedProfileImage;

    if (req.file) {
      uploadedProfileImage = await uploadProfileImage(req.file, req.user._id);
      currentUser.profileImage = uploadedProfileImage.url;
    } else if (removeProfileImage === "true") {
      currentUser.profileImage = "";
    }

    currentUser.firstName = firstName.trim();
    currentUser.lastName = lastName.trim();

    let user;

    try {
      user = await currentUser.save();
    } catch (error) {
      if (uploadedProfileImage?.path) {
        await deletePropertyImage(uploadedProfileImage.path);
      }

      throw error;
    }

    if ((req.file || removeProfileImage === "true") && oldProfileImagePath) {
      await deletePropertyImage(oldProfileImagePath);
    }

    return res.status(200).json({
      status: "success",
      message: "Profile updated successfully.",
      user: serializeUser(user),
    });
  } catch (error) {
    console.error(`Update profile error: ${error.message}`);

    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.statusCode
        ? error.message
        : "Server error while updating profile.",
    });
  }
}

module.exports = {
  updateProfile,
};
