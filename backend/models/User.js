const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nom: String,
    prenom: String,
    email: { type: String, unique: true },
    motDePasse: String,
    telephone: String,
    adresse: String,
    photoProfil: String,
    role: { type: String, enum: ["client", "restaurant", "livreur", "admin"] },
    statut: {
      type: String,
      enum: ["pending", "active", "blocked"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
