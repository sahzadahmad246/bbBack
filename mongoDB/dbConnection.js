const mongoose = require("mongoose");

const DB = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(DB);
    console.log("connected to database successfull");
  } catch (error) {
    console.error("database connection failed", error);
  }
};

module.exports = connectDB;
