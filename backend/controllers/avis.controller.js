const Avis = require("../models/Avis");

// 🔹 Create Avis
exports.createAvis = async (req, res) => {
  try {
    const { avisType, restaurant, livreur, commande, note, commentaire } =
      req.body;

    // Validate required fields
    if (!avisType || !note) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate avisType
    if (!["restaurant", "livreur"].includes(avisType)) {
      return res.status(400).json({
        message: "Invalid avisType. Must be 'restaurant' or 'livreur'",
      });
    }

    // Validate note
    if (note < 0 || note > 5) {
      return res.status(400).json({ message: "Note must be between 1 and 5" });
    }

    // Validate target based on avisType
    if (avisType === "restaurant" && !restaurant) {
      return res
        .status(400)
        .json({ message: "Restaurant ID is required for restaurant avis" });
    }
    if (avisType === "livreur" && !livreur) {
      return res
        .status(400)
        .json({ message: "Livreur ID is required for livreur avis" });
    }
    console.log({ avisType, restaurant, livreur, commande, note, commentaire });
    // Create the avis
    const newAvis = new Avis({
      client: req.user.id,
      restaurant: avisType === "restaurant" ? restaurant : null,
      livreur: avisType === "livreur" ? livreur : null,
      commande,
      note,
      commentaire,
      avisType,
    });

    await newAvis.save();

    res
      .status(201)
      .json({ message: "Avis created successfully", avis: newAvis });
  } catch (error) {
    console.log("failed error in  createAvis", { error });
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Delete Avis
exports.deleteAvis = async (req, res) => {
  try {
    const { avisId } = req.params;
    // Find the avis
    const avis = await Avis.findById(avisId);
    if (!avis) {
      return res.status(404).json({ message: "Avis not found" });
    }
    // Ensure the avis belongs to the logged-in client
    if (avis.client.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this avis" });
    }

    // Delete the avis
    await Avis.findByIdAndDelete(avisId);

    res.json({ message: "Avis deleted successfully" });
  } catch (error) {
    console.log("failed error in  deleteAvis", { error });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Update Avis
exports.updateAvis = async (req, res) => {
  try {
    const { avisId } = req.params;
    const { note, commentaire } = req.body;

    // Validate note
    if (note && (note < 1 || note > 5)) {
      return res.status(400).json({ message: "Note must be between 1 and 5" });
    }

    // Find the avis
    const avis = await Avis.findById(avisId);
    if (!avis) {
      return res.status(404).json({ message: "Avis not found" });
    }

    // Ensure the avis belongs to the logged-in client
    if (avis.client.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this avis" });
    }

    // Update the avis
    avis.note = note || avis.note;
    avis.commentaire = commentaire || avis.commentaire;

    await avis.save();

    res.json({ message: "Avis updated successfully", avis });
  } catch (error) {
    console.log("failed error in  updateAvis", { error });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get All Avis on Platform
exports.getAllAvis = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Fetch all avis with pagination
    const avis = await Avis.find()
      .populate("client") // Populate client details
      .populate("restaurant") // Populate restaurant details
      .populate("livreur") // Populate livreur details
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const totalAvis = await Avis.countDocuments();

    res.json({
      message: "All avis fetched successfully",
      avis,
      totalPages: Math.ceil(totalAvis / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.log("failed error in  getAllAvis", { error });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get All Avis for a Restaurant
exports.getAllAvisForRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Fetch avis for the specified restaurant
    const avis = await Avis.find({ restaurant: restaurantId })
      .populate("client") // Populate client details
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json({
      message: "All avis for restaurant fetched successfully",
      avis,
    });
  } catch (error) {
    console.log("failed error in  getAllAvisForRestaurant", { error });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get All Avis for a Livreur
exports.getAllAvisForLivreur = async (req, res) => {
  try {
    const { livreurId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Fetch avis for the specified livreur
    const avis = await Avis.find({ livreur: livreurId })
      .populate("client", "username") // Populate client details
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const totalAvis = await Avis.countDocuments({ livreur: livreurId });

    res.json({
      message: "All avis for livreur fetched successfully",
      avis,
      totalPages: Math.ceil(totalAvis / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.log("failed error in  getAllAvisForLivreur", { error });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
