const User = require("../models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const {
  sendRestaurantOwnerWelcomeEmail,
  sendAccountSuspensionEmail,
  sendAccountActivationEmail,
  sendAccountDeletionEmail,
} = require("../middlewares/mailSender");

// 🔹 Get Admin Profile
exports.getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id; // Assuming the admin is authenticated and their ID is in the token
    const admin = await User.findById(adminId).select("-motDePasse"); // Exclude password for security

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ message: "Admin profile retrieved successfully", admin });
  } catch (error) {
    console.log("failed error in getAdminProfile", { error });
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Update Admin Profile
exports.updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { nom, prenom, email, telephone, adresse } = req.body;

    // Check if the email is already used by another user
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== adminId) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Prepare update data
    const updateData = { nom, prenom, email, telephone, adresse };

    // If a profile image was uploaded, add it to the update data
    if (req.body.profileImage) {
      updateData.photoProfil = req.body.profileImage;
    }

    // Update the admin's profile
    const updatedAdmin = await User.findByIdAndUpdate(adminId, updateData, {
      new: true,
      runValidators: true,
    }).select("-motDePasse");

    res.json({
      message: "Admin profile updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.log("failed error in updateAdminProfile", { error });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-motDePasse"); // Exclude passwords for security

    res.json({ message: "All users retrieved successfully", users });
  } catch (error) {
    console.log("failed error in getAllUsers", { error });
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// 🔹 Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params; // Get the user ID from the URL parameters

    // Find the user by ID
    const user = await User.findById(userId).select("-motDePasse"); // Exclude password for security

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User retrieved successfully", user });
  } catch (error) {
    console.log("failed error in getUserById", { error });
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Change Account Status
exports.changeAccountStatus = async (req, res) => {
  try {
    const { statut, userId } = req.body;

    console.log(userId, statut);
    // Validate the status value
    const validStatuses = ["pending", "active", "blocked"];
    if (!validStatuses.includes(statut)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find and update the user's status
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { statut },
      { new: true, runValidators: true }
    ).select("-motDePasse");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    // Send email notification based on the new status
    if (statut === "blocked") {
      await sendAccountSuspensionEmail(updatedUser);
    } else if (statut === "active") {
      await sendAccountActivationEmail(updatedUser);
    }

    res.json({
      message: "Account status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("failed error in  Change Account Status", { error });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Create Restaurant Owner
exports.createRestaurantOwner = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, telephone, adresse } = req.body;

    // Check if the email is already used
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Create the restaurant owner data
    const restaurantOwnerData = {
      nom,
      prenom,
      email,
      motDePasse: hashedPassword,
      telephone,
      adresse,
      role: "restaurant",
      statut: "active", // Default status for new restaurant owners
    };

    // If a profile image was uploaded, add it to the user data
    if (req.body.profileImage) {
      restaurantOwnerData.photoProfil = req.body.profileImage;
    }

    // Create and save the restaurant owner
    const restaurantOwner = new User(restaurantOwnerData);
    await restaurantOwner.save();
    // Send welcome email to the restaurant owner
    await sendRestaurantOwnerWelcomeEmail(nom, prenom, email, motDePasse);
    // Remove the password field before sending the response
    const responseUser = restaurantOwner.toObject();
    delete responseUser.motDePasse;
    res.status(201).json({
      message: "Restaurant owner created successfully",
      restaurantOwner,
    });
  } catch (error) {
    console.log("failed error in  createRestaurantOwner", { error });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// 🔹 Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params; // Get the user ID from the URL parameters

    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    await sendAccountDeletionEmail(deletedUser);
    res.json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    console.log("failed error in  deleteUser", { error });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
