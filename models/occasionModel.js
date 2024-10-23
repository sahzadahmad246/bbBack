const mongoose = require("mongoose");

// Define Occasion Schema
const occasionSchema = new mongoose.Schema({
  occasionCategories: [
    {
      label: { type: String, required: true },
      occasionItems: [
        {
          label: { type: String, required: true },
          images: [
            {
              url: { type: String, required: true },
              alt: { type: String, required: true },
              title: { type: String, required: true }, // added title field
              public_id: { type: String, required: true }, // added public_id field
            },
          ],
        },
      ],
    },
  ],
});

// Create the Occasion model
const Occasion = mongoose.model("Occasion", occasionSchema);

module.exports = Occasion;
