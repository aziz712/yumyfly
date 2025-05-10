const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Restaurant = require("../models/Restaurant");
const Categorie = require("../models/Categorie");
const Livreur = require("../models/Livreur");
require("dotenv").config();
const { deleteFile } = require("../middlewares/upload.middleware");
const Plat = require("../models/Plat");
const { sendWelcomeDeliveryEmail } = require("../middlewares/mailSender");

// 🔹 Get My Owner Profile
exports.myOwnerProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming the user is authenticated and their ID is in the token

    // Find the user
    const user = await User.findById(userId).select("-motDePasse");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the associated restaurant (if any)
    const restaurant = await Restaurant.findOne({ proprietaire: userId });

    res.json({
      message: "Owner profile retrieved successfully",
      user,
      restaurant: restaurant || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Update My Password
exports.updateMyPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the old password
    const isMatch = await bcrypt.compare(oldPassword, user.motDePasse);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    user.motDePasse = hashedNewPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Update My Profile
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nom, prenom, email, telephone, adresse } = req.body;
    const profileImage = req.body.profileImage; // From upload middleware

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
    if (profileImage && user.photoProfil) {
      deleteFile(user.photoProfil); // Delete the old image file
    }

    // Update the user's profile
    user.nom = nom || user.nom;
    user.prenom = prenom || user.prenom;
    user.email = email || user.email;
    user.telephone = telephone || user.telephone;
    user.adresse = adresse || user.adresse;
    user.photoProfil = profileImage || user.photoProfil;

    await user.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Check Restaurant Data Completed
exports.checkRestaurantDataCompleted = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the restaurant owned by the user
    const restaurant = await Restaurant.findOne({ proprietaire: userId });

    if (!restaurant) {
      return res.json({
        completed: false,
        message: "Restaurant not created yet",
      });
    }

    res.json({
      completed: true,
      message: "Restaurant data is completed",
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Complete Restaurant Information
exports.completeRestaurantInformation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nom, adresse, telephone, description, workingHours } = req.body;
    const imagePaths = req.body.newImagePaths || [];
    console.log(req.body);
    // Check if the restaurant already exists
    const existingRestaurant = await Restaurant.findOne({
      proprietaire: userId,
    });
    if (existingRestaurant) {
      return res.status(400).json({ message: "Restaurant already exists" });
    }

    // Create the restaurant
    const restaurant = new Restaurant({
      proprietaire: userId,
      nom,
      adresse,
      telephone,
      description,
      workingHours,
      images: imagePaths || [],
    });

    await restaurant.save();

    res
      .status(201)
      .json({ message: "Restaurant created successfully", restaurant });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Controller to update restaurant info
exports.updateRestaurantInformation = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      nom,
      adresse,
      telephone,
      description,
      workingHours,
      images, // Existing images we want to keep
      newImagePaths, // From middleware - newly uploaded images
    } = req.body;

    console.log(req.body);

    // Find the restaurant owned by the user
    const restaurant = await Restaurant.findOne({ proprietaire: userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Parse existing images from string to array if it's a string
    let imagesToKeep = [];
    if (images) {
      if (typeof images === "string") {
        try {
          imagesToKeep = JSON.parse(images);
        } catch (e) {
          // If it's already in string format but not JSON format, it might be a single image
          imagesToKeep = images.split(",").filter((img) => img.trim());
        }
      } else if (Array.isArray(images)) {
        imagesToKeep = images;
      }
    }

    // Combine kept existing images with new images (if any)
    let allImages = [...imagesToKeep];

    // Add new image paths if they exist
    if (newImagePaths && newImagePaths.length > 0) {
      allImages = [...allImages, ...newImagePaths];
    }

    // If no images at all, keep current images (shouldn't happen with frontend validation)
    if (allImages.length === 0) {
      allImages = restaurant.images;
    }

    // Update the restaurant's information
    restaurant.nom = nom || restaurant.nom;
    restaurant.adresse = adresse || restaurant.adresse;
    restaurant.telephone = telephone || restaurant.telephone;
    restaurant.description = description || restaurant.description;
    restaurant.workingHours = workingHours || restaurant.workingHours;
    restaurant.images = allImages;

    await restaurant.save();
    res.json({ message: "Restaurant updated successfully", restaurant });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Create Category
exports.createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nom, description } = req.body;
    const image = req.body.categoryImage; // From upload middleware

    // Find the restaurant owned by the user
    const restaurant = await Restaurant.findOne({ proprietaire: userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Create the category
    const category = new Categorie({
      nom,
      description,
      image,
      restaurant: restaurant._id,
    });

    await category.save();

    // Add the category to the restaurant's categories array
    restaurant.categories.push(category._id);
    await restaurant.save();

    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { nom, description } = req.body;
    const image = req.body.categoryImage; // From upload middleware

    // Find the category
    const category = await Categorie.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Delete the old image if a new one is uploaded
    if (image && category.image) {
      deleteFile(category.image);
    }

    // Update the category
    category.nom = nom || category.nom;
    category.description = description || category.description;
    category.image = image || category.image;

    await category.save();

    res.json({ message: "Category updated successfully", category });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get All Categories
exports.getAllCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the restaurant owned by the user
    const restaurant = await Restaurant.findOne({ proprietaire: userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Find all categories associated with the restaurant
    const categories = await Categorie.find({ restaurant: restaurant._id });

    res.json({ message: "Categories retrieved successfully", categories });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(categoryId);
    // Find the category
    const category = await Categorie.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    // Delete the category image
    if (category.image) {
      deleteFile(category.image);
    }
    //delete that category from the restaurant categories array
    await Categorie.deleteOne({ _id: categoryId });

    // Delete all associated dishes
    await Plat.deleteMany({ categorie: categoryId });

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Create Delivery
exports.createDelivery = async (req, res) => {
  try {
    const userId = req.user.id; // Restaurant owner ID from JWT token
    const { nom, prenom, email, motDePasse, telephone, adresse } = req.body;

    // Check if the email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Create the user with the role "livreur"
    const newUser = new User({
      nom,
      prenom,
      email,
      motDePasse: hashedPassword,
      telephone,
      adresse,
      role: "livreur",
      statut: "active", // Directly activate the account for simplicity
    });

    await newUser.save();

    // Find the restaurant owned by the user
    const restaurant = await Restaurant.findOne({ proprietaire: userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Create the livreur entry
    const newLivreur = new Livreur({
      userId: newUser._id,
      restaurantId: restaurant._id,
    });

    await newLivreur.save();
    // Send welcome email to the new delivery person
    await sendWelcomeDeliveryEmail(
      newUser.nom,
      newUser.prenom,
      newUser.email,
      motDePasse, // Temporary password
      restaurant.nom // Restaurant name
    );
    res.status(201).json({
      message: "Delivery person created successfully",
      user: newUser,
      livreur: newLivreur,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get All My Restaurant Deliveries
exports.getAllMyRestaurantDeliveries = async (req, res) => {
  try {
    const userId = req.user.id; // Restaurant owner ID from JWT token

    // Find the restaurant owned by the user
    const restaurant = await Restaurant.findOne({ proprietaire: userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Find all livreur entries associated with the restaurant
    const livreurs = await Livreur.find({
      restaurantId: restaurant._id,
    }).populate("userId");

    res.json({
      message: "Delivery persons retrieved successfully",
      livreurs,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Change Delivery Account Status
exports.changeDeliveryAccountStatus = async (req, res) => {
  try {
    const userId = req.user.id; // Restaurant owner ID from JWT token
    const { livreurId, statut } = req.body;

    // Validate the status value
    const validStatuses = ["active", "blocked"];
    if (!validStatuses.includes(statut)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find the restaurant owned by the user
    const restaurant = await Restaurant.findOne({ proprietaire: userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Find the livreur entry associated with the restaurant
    const livreur = await Livreur.findOne({
      _id: livreurId,
      restaurantId: restaurant._id,
    }).populate("userId");
    if (!livreur) {
      return res.status(404).json({ message: "Livreur not found" });
    }

    // Update the user's status
    const user = livreur.userId;
    user.statut = statut;
    await user.save();

    res.json({
      message: `Delivery account ${statut} successfully`,
      livreur: {
        ...livreur.toObject(),
        userId: user,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Delete Delivery Account by Restaurant Owner
exports.deleteDeliveryAccountByRestaurantOwner = async (req, res) => {
  try {
    const userId = req.user.id; // Restaurant owner ID from JWT token
    const { livreurId } = req.params;

    // Find the restaurant owned by the user
    const restaurant = await Restaurant.findOne({ proprietaire: userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Find the livreur entry associated with the restaurant
    const livreur = await Livreur.findOne({
      _id: livreurId,
      restaurantId: restaurant._id,
    }).populate("userId");
    if (!livreur) {
      return res.status(404).json({ message: "Livreur not found" });
    }

    // Delete the associated user account
    const user = livreur.userId;
    if (user.photoProfil) {
      deleteFile(user.photoProfil); // Delete the profile image if it exists
    }
    await User.findByIdAndDelete(user._id);

    // Delete the livreur entry
    await Livreur.findByIdAndDelete(livreur._id);

    res.json({
      message: "Delivery account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
