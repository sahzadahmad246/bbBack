const express = require("express");
const passport = require("passport");
const router = express.Router();
const frontendUrl = process.env.FRONTEND_URL;
const sendToken = require("./../utilis/jwtToken");
const isAuthenticated = require("./../middlewares/isAuthenticated ");
const User = require("./../models/userModel");
const {
  userSignup,
  userLogin,
  getLoggedInUser,
} = require("./../controllers/userController");

// Google Auth Routes
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${frontendUrl}/login`,
  }),
  (req, res) => {
    res.redirect(`${frontendUrl}/profile`);
  }
);

// Unified Profile Route
router.get("/profile", isAuthenticated, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Logout Route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }

    res.clearCookie("connect.sid");

    res.clearCookie("token");

    res.json({ success: true, message: "Logged out successfully" });
  });
});

// Manual Auth Route

// Signup Route
router.route("/signup").post(userSignup);

// Login Route
router.route("/login").post(userLogin);

module.exports = router;
