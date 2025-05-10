const mongoose = require("mongoose");

const commandeSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    livreur: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    plats: [
      {
        plat: { type: mongoose.Schema.Types.ObjectId, ref: "Plat" },
        nom: String,
        prix: Number,
        images: [String],
        videos: [String],
        quantity: Number,
      },
    ],
    address: { type: String, required: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    note: { type: String },
    statut: {
      type: String,
      enum: [
        "en attente",

        "préparation",
        "prête",
        "assignée",
        "en route",
        "arrivée",
        "livrée",
      ],
      default: "en attente",
    },
    estimationLivraison: Number, //minutes)
    payee: { type: Boolean, default: false },
    DateSortie: Date,
    DateArrivee: Date,
    DateLivraison: Date,
    total: Number,
    serviceFee: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Commande = mongoose.model("Commande", commandeSchema);
module.exports = Commande;
