const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDatabase = require("../config/database");
const User = require("../models/User");

dotenv.config();

async function makeAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!adminEmail) {
    console.error("ADMIN_EMAIL is missing. Set it before running make-admin.");
    process.exitCode = 1;
    return;
  }

  try {
    await connectDatabase();

    const user = await User.findOne({ email: adminEmail });

    if (!user) {
      console.error(`No existing user found with email: ${adminEmail}`);
      process.exitCode = 1;
      return;
    }

    user.role = "admin";
    await user.save();

    console.log(`Success: ${adminEmail} has been promoted to admin.`);
  } catch (error) {
    console.error(`Failed to promote admin: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
}

makeAdmin();
