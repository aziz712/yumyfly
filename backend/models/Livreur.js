const mongoose = require("mongoose");

const livreurSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    disponibilite: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    completedDeliveries: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Livreur", livreurSchema);
