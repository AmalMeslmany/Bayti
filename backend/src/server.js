const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const multer = require("multer");
const authRoutes = require("./routes/authRoutes");
const connectDatabase = require("./config/database");
const favoriteRoutes = require("./routes/favoriteRoutes");
const propertyRoutes = require("./routes/propertyRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bayti Backend API is running.");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Bayti backend is healthy.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/properties", propertyRoutes);

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

    app.listen(PORT, () => {
      console.log(`Bayti backend server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

startServer();
