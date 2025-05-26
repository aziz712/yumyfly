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
    payee: { type: Boolean, default: false }, // Retained, but paymentInfo.status is the source of truth for payment state
    paymentInfo: {
      paymeeToken: { type: String }, // Can be deprecated if Paymee is fully removed
      konnectPaymentRef: { type: String }, // For Konnect payment reference
      transactionId: { type: String }, // General transaction ID from payment gateway
      status: {
        type: String,
        enum: ['pending', 'processing', 'paid', 'failed', 'cancelled', 'succeeded'], // Added 'processing', 'succeeded' from Konnect
        default: 'pending'
      },
      method: { type: String }, // e.g., 'Konnect', 'Paymee', 'COD'
      paidAt: { type: Date },
      rawResponse: { type: mongoose.Schema.Types.Mixed } // To store raw webhook data if needed
    },
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
