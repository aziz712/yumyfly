const Restaurant = require("../models/Restaurant");
const Categorie = require("../models/Categorie");
require("dotenv").config();
const { deleteFile } = require("../middlewares/upload.middleware");
const Plat = require("../models/Plat");

// 🔹 Add Plat
exports.addPlat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nom, description, prix, ingredients, categorie, tags } = req.body;

    // Find the restaurant owned by the user
    const restaurant = await Restaurant.findOne({ proprietaire: userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    // Parse ingredients from JSON string to array
    let ingredientsArray = [];
    try {
      if (req.body.ingredients) {
        ingredientsArray = JSON.parse(req.body.ingredients);
      }
    } catch (parseError) {
      console.error("Error parsing ingredients:", parseError);
      // If JSON parsing fails, try to handle it as a comma-separated string
      ingredientsArray = req.body.ingredients
        .split(",")
        .map((item) => item.trim());
    }
    let tagsArray = [];
    try {
      if (req.body.tags) {
        tagsArray = JSON.parse(req.body.tags);
      }
    } catch (parseError) {
      console.error("Error parsing tags:", parseError);
      // If JSON parsing fails, try to handle it as a comma-separated string
      tagsArray = req.body.tags.split(",").map((item) => item.trim());
    }

    // Extract uploaded images and videos from the request body
    const images = req.body.imagePaths || [];
    const videos = req.body.videoPaths || [];

    // Create the plat
    const plat = new Plat({
      nom,
      description,
      prix,
      disponible: true,
      images,
      videos,
      ingredients: ingredientsArray,
      tags: tagsArray,
      categorie,
      restaurant: restaurant._id,
    });

    await plat.save();

    // Add the plat to the restaurant's plats array
    restaurant.plats.push(plat._id);
    await restaurant.save();

    res.status(201).json({ message: "Plat created successfully", plat });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get All Plats of Restaurant
exports.getAllPlatsOfRestaurant = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the restaurant owned by the user
    const restaurant = await Restaurant.findOne({
      proprietaire: userId,
    }).populate("plats");
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json({
      message: "Plats retrieved successfully",
      plats: restaurant.plats,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get All Plats by Category
exports.getAllPlatsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Find the category and populate its plats
    const category = await Categorie.findById(categoryId).populate("plats");
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({
      message: "Plats retrieved successfully",
      plats: category.plats,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get Plat by ID
exports.getPlatById = async (req, res) => {
  try {
    const { platId } = req.params;

    // Find the plat by ID
    const plat = await Plat.findById(platId)
      .populate("categorie")
      .populate("restaurant");
    if (!plat) {
      return res.status(404).json({ message: "Plat not found" });
    }

    res.json({ message: "Plat retrieved successfully", plat });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Update Plat
exports.updatePlat = async (req, res) => {
  try {
    const { platId } = req.params;
    const { nom, description, prix, ingredients, categorie, disponible } =
      req.body;

    // Find the plat by ID
    const plat = await Plat.findById(platId);
    if (!plat) {
      return res.status(404).json({ message: "Plat not found" });
    }

    // Handle media updates

    // 1. Process new images
    if (req.body.newImagePaths && req.body.newImagePaths.length > 0) {
      // If existingImages is provided, replace current images with these
      if (req.body.existingImages) {
        // Delete images that aren't in existingImages
        const imagesToDelete = plat.images.filter(
          (image) => !req.body.existingImages.includes(image)
        );
        imagesToDelete.forEach((image) => deleteFile(image));

        // Set images to be existingImages + newImages
        plat.images = [...req.body.existingImages, ...req.body.newImagePaths];
      } else {
        // If no existingImages specified, just add new ones
        plat.images = [...plat.images, ...req.body.newImagePaths];
      }
    } else if (req.body.existingImages) {
      // If only existingImages provided (no new uploads)
      // Delete images that aren't in existingImages
      const imagesToDelete = plat.images.filter(
        (image) => !req.body.existingImages.includes(image)
      );
      imagesToDelete.forEach((image) => deleteFile(image));

      // Update the plat's images with the existingImages
      plat.images = req.body.existingImages;
    }

    // 2. Process new videos
    if (req.body.newVideoPaths && req.body.newVideoPaths.length > 0) {
      // If existingVideos is provided, replace current videos with these
      if (req.body.existingVideos) {
        // Delete videos that aren't in existingVideos
        const videosToDelete = plat.videos.filter(
          (video) => !req.body.existingVideos.includes(video)
        );
        videosToDelete.forEach((video) => deleteFile(video));

        // Set videos to be existingVideos + newVideos
        plat.videos = [...req.body.existingVideos, ...req.body.newVideoPaths];
      } else {
        // If no existingVideos specified, just add new ones
        plat.videos = [...plat.videos, ...req.body.newVideoPaths];
      }
    } else if (req.body.existingVideos) {
      // If only existingVideos provided (no new uploads)
      // Delete videos that aren't in existingVideos
      const videosToDelete = plat.videos.filter(
        (video) => !req.body.existingVideos.includes(video)
      );
      videosToDelete.forEach((video) => deleteFile(video));

      // Update the plat's videos with the existingVideos
      plat.videos = req.body.existingVideos;
    }

    // Update other fields
    plat.nom = nom || plat.nom;
    plat.description = description || plat.description;
    plat.prix = prix || plat.prix;
    plat.ingredients = Array.isArray(ingredients)
      ? ingredients
      : plat.ingredients;
    plat.categorie = categorie || plat.categorie;
    plat.disponible = disponible !== undefined ? disponible : plat.disponible;

    await plat.save();
    res.json({ message: "Plat updated successfully", plat });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Delete Plat
exports.deletePlat = async (req, res) => {
  try {
    const { platId } = req.params;
    console.log(req.body);
    console.log(req.params);
    console.log(platId);

    // Find the plat by ID
    const plat = await Plat.findById(platId);
    if (!plat) {
      return res.status(404).json({ message: "Plat not found" });
    }
    console.log(plat);

    // Delete the plat's images and videos
    if (plat.images.length > 0) {
      plat.images.forEach((image) => deleteFile(image));
    }
    if (plat.videos.length > 0) {
      plat.videos.forEach((video) => deleteFile(video));
    }

    //remove that plats from data base
    await Plat.findByIdAndDelete(platId);

    res.json({ message: "Plat deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Change Plat Status
exports.changePlatStatus = async (req, res) => {
  try {
    const { platId } = req.params;

    // Find the plat by ID
    const plat = await Plat.findById(platId);
    if (!plat) {
      return res.status(404).json({ message: "Plat not found" });
    }

    // Toggle the status
    plat.disponible = !plat.disponible;
    await plat.save();

    res.json({ message: "Plat status updated successfully", plat });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
