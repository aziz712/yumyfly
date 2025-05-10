const mongoose = require("mongoose");

const categorieSchema = new mongoose.Schema(
  {
    nom: String,
    description: String,
    image: String,
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Categorie", categorieSchema);
