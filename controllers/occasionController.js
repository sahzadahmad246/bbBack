const Occasion = require("../models/occasionModel");
const catchAsyncErrors = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utilis/errorHandler");
const cloudinary = require("cloudinary").v2;

// Function to upload images and save to MongoDB
exports.uploadImage = catchAsyncErrors(async (req, res, next) => {
  const { categories, items, titles, alts } = req.body; // Accessing as arrays
  const uploadedImages = [];

  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("No images uploaded", 400));
  }

  // Check if the lengths of the arrays match
  if (req.files.length !== categories.length || req.files.length !== items.length || req.files.length !== titles.length || req.files.length !== alts.length) {
    return next(new ErrorHandler("Mismatched data lengths", 400));
  }

  // Iterate over each image and its associated data
  for (let i = 0; i < req.files.length; i++) {
    const title = titles[i];
    const altText = alts[i];
    const category = categories[i];
    const item = items[i];
    const imageFile = req.files[i];

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(imageFile.buffer, {
      folder: "occasions",
    });

    // Create an object for the uploaded image with title and alt text
    uploadedImages.push({
      title,
      alt: altText,
      url: result.secure_url,
      public_id: result.public_id,
    });

    // Save images under the corresponding category and item
    let occasion = await Occasion.findOne({
      "occasionCategories.label": category,
    });

    if (!occasion) {
      occasion = new Occasion({
        occasionCategories: [
          {
            label: category,
            occasionItems: [{ label: item, images: uploadedImages }],
          },
        ],
      });
      await occasion.save();
    } else {
      const categoryIndex = occasion.occasionCategories.findIndex(cat => cat.label === category);
      const itemIndex = occasion.occasionCategories[categoryIndex].occasionItems.findIndex(itm => itm.label === item);
      
      if (itemIndex === -1) {
        occasion.occasionCategories[categoryIndex].occasionItems.push({
          label: item,
          images: uploadedImages,
        });
      } else {
        occasion.occasionCategories[categoryIndex].occasionItems[itemIndex].images.push(...uploadedImages);
      }

      await occasion.save();
    }
  }

  res.status(200).json({
    success: true,
    message: "Images uploaded successfully",
  });
});


// Function to update a single image
exports.updateImage = catchAsyncErrors(async (req, res, next) => {
  const { category, item, imageUrl, newImageUrl, newAltText } = req.body;

  const occasion = await Occasion.findOne({
    "occasionCategories.label": category,
  });

  if (!occasion) {
    return next(new ErrorHandler("Occasion not found", 404));
  }

  const categoryIndex = occasion.occasionCategories.findIndex(
    (cat) => cat.label === category
  );
  const itemIndex = occasion.occasionCategories[
    categoryIndex
  ].occasionItems.findIndex((itm) => itm.label === item);

  if (itemIndex === -1) {
    return next(new ErrorHandler("Item not found", 404));
  }

  const imageIndex = occasion.occasionCategories[categoryIndex].occasionItems[
    itemIndex
  ].images.findIndex((img) => img.url === imageUrl);

  if (imageIndex === -1) {
    return next(new ErrorHandler("Image not found", 404));
  }

  // Update the image URL and alt text
  occasion.occasionCategories[categoryIndex].occasionItems[itemIndex].images[
    imageIndex
  ] = {
    url: newImageUrl,
    alt: newAltText,
  };

  await occasion.save();
  res.status(200).json({
    success: true,
    message: "Image updated successfully",
    occasion,
  });
});

// Function to delete a single image by URL
exports.deleteImage = catchAsyncErrors(async (req, res, next) => {
  const { category, item, imageUrl } = req.body;

  const occasion = await Occasion.findOne({
    "occasionCategories.label": category,
  });

  if (!occasion) {
    return next(new ErrorHandler("Occasion not found", 404));
  }

  const categoryIndex = occasion.occasionCategories.findIndex(
    (cat) => cat.label === category
  );
  const itemIndex = occasion.occasionCategories[
    categoryIndex
  ].occasionItems.findIndex((itm) => itm.label === item);

  if (itemIndex === -1) {
    return next(new ErrorHandler("Item not found", 404));
  }

  const imageIndex = occasion.occasionCategories[categoryIndex].occasionItems[
    itemIndex
  ].images.findIndex((img) => img.url === imageUrl);

  if (imageIndex === -1) {
    return next(new ErrorHandler("Image not found", 404));
  }

  // Remove the image
  occasion.occasionCategories[categoryIndex].occasionItems[
    itemIndex
  ].images.splice(imageIndex, 1);

  await occasion.save();
  res.status(200).json({
    success: true,
    message: "Image deleted successfully",
    occasion,
  });
});

// Function to delete all images from an occasion item by label
exports.deleteAllImagesFromItem = catchAsyncErrors(async (req, res, next) => {
  const { category, item } = req.body;

  const occasion = await Occasion.findOne({
    "occasionCategories.label": category,
  });

  if (!occasion) {
    return next(new ErrorHandler("Occasion not found", 404));
  }

  const categoryIndex = occasion.occasionCategories.findIndex(
    (cat) => cat.label === category
  );
  const itemIndex = occasion.occasionCategories[
    categoryIndex
  ].occasionItems.findIndex((itm) => itm.label === item);

  if (itemIndex === -1) {
    return next(new ErrorHandler("Item not found", 404));
  }

  // Remove all images from the item
  occasion.occasionCategories[categoryIndex].occasionItems[itemIndex].images =
    [];

  await occasion.save();
  res.status(200).json({
    success: true,
    message: "All images deleted successfully from the item",
    occasion,
  });
});

// Function to delete an entire occasion category
exports.deleteCategory = catchAsyncErrors(async (req, res, next) => {
  const { category } = req.body;

  const occasion = await Occasion.findOne({
    "occasionCategories.label": category,
  });

  if (!occasion) {
    return next(new ErrorHandler("Occasion not found", 404));
  }

  // Remove the entire category
  occasion.occasionCategories = occasion.occasionCategories.filter(
    (cat) => cat.label !== category
  );

  await occasion.save();
  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    occasion,
  });
});

// Function to get an occasion by ID
exports.getOccasionById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const occasion = await Occasion.findById(id);

  if (!occasion) {
    return next(new ErrorHandler("Occasion not found", 404));
  }

  res.status(200).json({
    success: true,
    occasion,
  });
});

// Function to get all occasions
exports.getAllOccasions = catchAsyncErrors(async (req, res, next) => {
  const occasions = await Occasion.find();

  res.status(200).json({
    success: true,
    occasions,
  });
});
