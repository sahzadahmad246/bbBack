require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const connectDB = require("./mongoDB/dbConnection");
const authRoutes = require("./routes/authRoute");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// CORS options
const corsOptions = {
  origin: ["http://localhost:5173", "https://badhaibazaar.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

// Use CORS middleware
app.use(cors(corsOptions));

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log("Database connected successfully.");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  });

// Express session middleware
app.use(
  session({
    secret: process.env.COOKIE_KEY || "default_key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
require("./config/passport-setup")(passport);

// Use the auth routes
app.use("/", authRoutes); // Use the imported routes

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Graceful shutdown on SIGINT
process.on("SIGINT", () => {
  console.log("Received SIGINT. Closing server...");
  process.exit(0);
});
