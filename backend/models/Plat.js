const mongoose = require("mongoose");

const platSchema = new mongoose.Schema(
  {
    nom: String,
    description: String,
    prix: Number,
    disponible: { type: Boolean, default: true },
    tags: [String],
    images: [String],
    videos: [String],
    ingredients: [String],
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: "Categorie" },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    commentaires: [
      {
        utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        texte: String,
        date: { type: Date, default: Date.now },
      },
    ],
    promotion: {
      isPromotionActive: { type: Boolean, default: false },
      pourcentage: Number,
      prixApresReduction: Number,
      dateDebut: Date,
      dateFin: Date,
      promoMessage: { type: String }, // optional
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plat", platSchema);
