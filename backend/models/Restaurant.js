const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    proprietaire: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    nom: String,
    adresse: String,
    telephone: String,
    description: String,
    workingHours: {
      from: String, // Exemple: "08:00"
      to: String, // Exemple: "23:00"
    },
    images: [String],
    plats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Plat" }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Categorie" }],
  },
  { timestamps: true }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;
