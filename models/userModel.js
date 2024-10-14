const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  displayName: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  image: { type: String },
  email: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
