const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const connectDatabase = require("./config/database");
const contactRoutes = require("./routes/contactRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bayti Backend API is running.");
});

app.get("/api/health", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(200).json({
    status: databaseConnected ? "success" : "degraded",
    database: databaseConnected ? "connected" : "disconnected",
    message: databaseConnected
      ? "Bayti backend is healthy."
      : "Bayti backend is running, but MongoDB is not connected.",
  });
});

app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  return res.status(503).json({
    status: "error",
    message:
      "Database is not connected. Check your MongoDB Atlas network access allowlist and MONGODB_URI.",
  });
});

app.use("/api/contact", contactRoutes);
app.use("/api", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found.",
  });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: "error",
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "Image size must be 10 MB or less."
          : err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE"
            ? "A property can have a maximum of 5 images."
          : err.message,
    });
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal server error.",
  });
});

async function startServer() {
  try {
    await connectDatabase();
  } catch (error) {
    console.error(`Failed to connect to MongoDB: ${error.message}`);

    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }

    console.warn(
      "Starting server without MongoDB. API routes will return 503 until the database connection is fixed."
    );
  }

  app.listen(PORT, () => {
    console.log(`Bayti backend server is running on port ${PORT}`);
  });
}

startServer();
