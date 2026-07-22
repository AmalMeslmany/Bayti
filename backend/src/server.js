const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const connectDatabase = require("./config/database");
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
app.use("/api/properties", propertyRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found.",
  });
});

app.use((err, req, res, next) => {
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
