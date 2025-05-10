const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Avis = require("../models/Avis");
const Categorie = require("../models/Categorie");
const Plat = require("../models/Plat");
require("dotenv").config();
const { deleteFile } = require("../middlewares/upload.middleware");

// 🔹 Get My Profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming the user is authenticated and their ID is in the token

    // Find the user
    const user = await User.findById(userId).select("-motDePasse");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Client profile retrieved successfully",
      user,
    });
  } catch (error) {
    console.log("failed error in  getMyProfile", { error });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Update Client Profile
exports.updateClientProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nom, prenom, email, telephone, adresse } = req.body;
    const photoProfil = req.body.profileImage; // From upload middleware

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the email is already used by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    // Delete the old profile image if a new one is uploaded
    if (photoProfil && user.photoProfil) {
      deleteFile(user.photoProfil); // Delete the old image file
    }

    // Update the user's profile
    user.nom = nom || user.nom;
    user.prenom = prenom || user.prenom;
    user.email = email || user.email;
    user.telephone = telephone || user.telephone;
    user.adresse = adresse || user.adresse;
    user.photoProfil = photoProfil || user.photoProfil;

    await user.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.log("failed error in  updateClientProfile", { error });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Delete My Account
exports.deleteMyAccount = async (req, res) => {
  try {
    console.log("Deleting account...");
    const userId = req.user.id;

    // Find the user
    const user = await User.findOneAndDelete({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the profile image if it exists
    if (user.photoProfil) {
      deleteFile(user.photoProfil);
    }

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.log("failed error in  deleteMyAccount", { error });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get Restaurant by ID with Average Score
exports.getRestaurantById = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    console.log("Fetching restaurant by ID...");

    // Fetch the restaurant by ID
    const restaurant = await Restaurant.findById(restaurantId)
      .populate("proprietaire")
      .populate("categories")
      .populate("plats");

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Fetch all avis and group them by restaurant
    const allAvis = await Avis.aggregate([
      {
        $match: { avisType: "restaurant" }, // Only consider reviews for restaurants
      },
      {
        $group: {
          _id: "$restaurant", // Group by restaurant ID
          averageScore: { $avg: "$note" }, // Calculate the average score
        },
      },
    ]);

    // Find the average score for the current restaurant
    const restaurantScore = allAvis.find(
      (entry) => entry._id.toString() === restaurant._id.toString()
    );

    // Inject the average score into the restaurant object
    const restaurantWithScore = {
      ...restaurant.toObject(),
      averageScore: restaurantScore
        ? parseFloat(restaurantScore.averageScore.toFixed(2))
        : 0,
    };
    res.json({
      message: "Restaurant retrieved successfully",
      restaurant: restaurantWithScore,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get All Disponible Plats
exports.getAllDisponiblePlats = async (req, res) => {
  try {
    // Find all plats with disponible = true
    const plats = await Plat.find({ disponible: true })
      .populate("categorie")
      .populate("restaurant");

    res.json({ message: "Disponible plats retrieved successfully", plats });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get All Disponible Plats of Categorie
exports.getAllDisponiblePlatsOfCategorie = async (req, res) => {
  try {
    const { categorieId } = req.params;

    // Find all plats with disponible = true and matching categorieId
    const plats = await Plat.find({ disponible: true, categorie: categorieId })
      .populate("categorie")
      .populate("restaurant");

    res.json({ message: "Disponible plats retrieved successfully", plats });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get All Disponible Plats of Restaurant
exports.getAllDisponiblePlatsOfRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Find all plats with disponible = true and matching restaurantId
    const plats = await Plat.find({
      disponible: true,
      restaurant: restaurantId,
    })
      .populate("categorie")
      .populate("restaurant");

    res.json({ message: "Disponible plats retrieved successfully", plats });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get All Categories
exports.getAllCategories = async (req, res) => {
  try {
    console.log("Fetching categories...");
    // Find all categories
    const categories = await Categorie.find();

    res.json({ message: "Categories retrieved successfully", categories });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//  🔹 Get All Restaurants with Average Scores
exports.getAllRestaurants = async (req, res) => {
  try {
    // Fetch all restaurants
    const restaurants = await Restaurant.find()
      .populate("categories")
      .populate("proprietaire")
      .populate("plats");

    // Fetch all avis and group them by restaurant
    const allAvis = await Avis.aggregate([
      {
        $match: { avisType: "restaurant" }, // Only consider reviews for restaurants
      },
      {
        $group: {
          _id: "$restaurant", // Group by restaurant ID
          averageScore: { $avg: "$note" }, // Calculate the average score
        },
      },
    ]);

    // Create a map of restaurant IDs to their average scores
    const restaurantScoresMap = {};
    allAvis.forEach((entry) => {
      restaurantScoresMap[entry._id] = entry.averageScore
        ? parseFloat(entry.averageScore.toFixed(2))
        : null;
    });

    // Inject the average score into each restaurant object
    const restaurantsWithScores = restaurants.map((restaurant) => {
      const averageScore = restaurantScoresMap[restaurant._id] || null; // Default to null if no reviews exist
      return {
        ...restaurant.toObject(),
        averageScore,
      };
    });

    res.json({
      message: "Restaurants retrieved successfully",
      restaurants: restaurantsWithScores,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get Plat by ID
exports.getPlatById = async (req, res) => {
  try {
    const { platId } = req.params;
    console.log("Fetching plat by ID...");

    // Find the plat by ID
    const plat = await Plat.findById(platId)
      .populate("categorie")
      .populate("restaurant")
      .populate({
        path: "commentaires.utilisateur",
        model: "User",
        select: "nom prenom email profileImage",
      })
      .populate({
        path: "likes",
        model: "User",
        select: "nom prenom email profileImage",
      });

    if (!plat) {
      return res.status(404).json({ message: "Plat not found" });
    }

    res.json({ message: "Plat retrieved successfully", plat });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Make Comment
exports.makeComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { platId, comment } = req.body;
    console.log("Making comment...");

    // Find the plat by ID
    const plat = await Plat.findById(platId);
    if (!plat) {
      return res.status(404).json({ message: "Plat not found" });
    }

    // Add the comment to the plat's commentaires array
    plat.commentaires.push({
      utilisateur: userId,
      texte: comment,
    });

    await plat.save();

    res.status(201).json({ message: "Comment added successfully", plat });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Like Plat
exports.likePlat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { platId } = req.params;
    console.log("Liking plat...");
    console.log({ userId, platId });
    // Find the plat by ID
    const plat = await Plat.findById(platId);
    if (!plat) {
      return res.status(404).json({ message: "Plat not found" });
    }

    // Check if the user has already liked the plat
    const isLiked = plat.likes.includes(userId);

    if (isLiked) {
      // Unlike the plat
      plat.likes.pull(userId);
      await plat.save();
      return res.json({ message: "Plat unliked successfully", plat });
    }

    // Like the plat
    plat.likes.push(userId);
    await plat.save();

    res.json({ message: "Plat liked successfully", plat });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get All Comments on a Plat
exports.getAllCommentsOnPlat = async (req, res) => {
  try {
    const { platId } = req.params;
    console.log("Fetching all comments on plat...");
    console.log({
      body: req.body,
      platId,
      userId: req.user.id,
      user: req.user,
    });
    // Find the plat by ID and populate the commentaires field
    const plat = await Plat.findById(platId).populate(
      "commentaires.utilisateur"
    );
    if (!plat) {
      return res.status(404).json({ message: "Plat not found" });
    }

    res.json({
      message: "Comments retrieved successfully",
      comments: plat.commentaires,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// 🔹 Get All Active Promotions
exports.getAllActivePromotions = async (req, res) => {
  try {
    // Find all plats with active promotions
    const platsWithPromotions = await Plat.find({
      "promotion.isPromotionActive": true,
      disponible: true
    }).populate("restaurant", "nom adresse");

    // Format the promotions for the client
    const promotions = platsWithPromotions.map(plat => {
      const now = new Date();
      const end = new Date(plat.promotion.dateFin);
      const diff = end - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      
      return {
        _id: plat._id,
        plat: {
          _id: plat._id,
          nom: plat.nom,
          prix: plat.prix,
          image: plat.images && plat.images.length > 0 ? plat.images[0] : null,
          restaurant: plat.restaurant
        },
        pourcentage: plat.promotion.pourcentage,
        prixApresReduction: plat.promotion.prixApresReduction,
        dateDebut: plat.promotion.dateDebut,
        dateFin: plat.promotion.dateFin,
        message: plat.promotion.message,
        isPromotionActive: plat.promotion.isPromotionActive,
        joursRestants: days <= 0 ? "Promotion terminée" : days === 1 ? "Il reste 1 jour" : `Il reste ${days} jours`
      };
    });

    res.status(200).json({ promotions });
  } catch (error) {
    console.error("Error fetching promotions:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des promotions" });
  }
};
