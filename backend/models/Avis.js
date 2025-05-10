const mongoose = require("mongoose");

const avisSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    livreur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    commande: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commande",
    },
    note: {
      type: Number,
      min: 0,
      max: 5,
      required: true,
    },
    commentaire: String,
    avisType: {
      type: String,
      enum: ["restaurant", "livreur"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Avis", avisSchema);
