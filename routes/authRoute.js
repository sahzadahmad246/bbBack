// routes/authRoutes.js
const express = require("express");
const passport = require("passport");
const router = express.Router();
const frontendUrl = process.env.FRONTEND_URL;

// Auth routes
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

// Profile route
router.get("/profile", (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated" });
  }
 
  res.json({ success: true, user: req.user });
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Logged out successfully" });
  });
});
module.exports = router;
