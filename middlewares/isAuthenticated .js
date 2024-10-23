const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");

const isAuthenticated = async (req, res, next) => {
  const token = req.cookies.token || req.cookies["connect.sid"];

  if (!token) {
    if (req.user) {
      return next();
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      if (req.user) {
        return next();
      } else {
        return res
          .status(401)
          .json({ success: false, message: "User not found" });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    if (req.user) {
      return next();
    }
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }
};

module.exports = isAuthenticated;
