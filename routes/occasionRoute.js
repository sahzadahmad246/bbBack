const express = require("express");
const router = express.Router();
const {
  uploadImage,
  updateImage,
  deleteImage,
  deleteAllImagesFromItem,
  deleteCategory,
  getOccasionById,
  getAllOccasions,
} = require("./../controllers/occasionController");

// Route to upload an image
router.post("/upload-image", uploadImage);

// Route to update a single image
router.put("/update-image", updateImage); // Update image route

// Route to delete a single image
router.delete("/delete-image", deleteImage); // Delete image route

// Route to delete all images from an occasion item by label
router.delete("/delete-all-images", deleteAllImagesFromItem); // Delete all images from item route

// Route to delete an entire occasion category
router.delete("/delete-category", deleteCategory); // Delete category route

// Route to get an occasion by ID
router.get("/occasion/:id", getOccasionById);

// Route to get all occasions
router.get("/occasions", getAllOccasions);

module.exports = router; // Ensure this line is present
