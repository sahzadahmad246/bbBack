require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const connectDB = require("./mongoDB/dbConnection");
const authRoutes = require("./routes/authRoute");
const occasionRoutes = require("./routes/occasionRoute");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;
const errorMiddleware = require("./middlewares/error");
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload");

// CORS options
const corsOptions = {
  origin: ["http://localhost:5173", "https://badhaibazaar.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

// Use CORS middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
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
    secure: true,
    partitioned: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
require("./config/passport-setup")(passport);

app.use("/", authRoutes);
app.use("/", occasionRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

// Error middileware
app.use(errorMiddleware);
