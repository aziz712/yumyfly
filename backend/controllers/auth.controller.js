const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
require("dotenv").config();
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendContactUsEmail,
} = require("../middlewares/mailSender");
// 🔹 Register User (worked)
exports.register = async (req, res) => {
  const { nom, prenom, email, motDePasse, telephone, adresse } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log("User already exists");
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    user = new User({
      nom,
      prenom,
      email,
      adresse,
      motDePasse: hashedPassword,
      telephone,
      role: "client",
      statut: "active",
    });

    await user.save();
    await sendWelcomeEmail(nom, prenom, email, motDePasse); // Send welcome email
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res
      .status(201)
      .json({ message: "User registered successfully", token, user });
  } catch (error) {
    console.log("failed error in  register", { error });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Login User (worked)
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, motDePasse } = req.body;
  console.log({
    email,
    motDePasse,
  });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Invalid Credentials");
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) {
      console.log("Invalid Credentials");
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    if (user.statut === "blocked") {
      return res.status(403).json({ message: "Account is blocked" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: 1000000,
      }
    );
    console.log({ message: "Login successful", token });

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    console.log("failed error in  login", { error });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 createAdminAccount (worked)
exports.createAdminAccount = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: "admin@example.com",
    });
    if (existingAdmin) {
      console.log("Admin account already exists.");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("Admin@1234", 10);

    // Create admin user
    const adminUser = new User({
      nom: "Admin",
      prenom: "Admin",
      email: "admin@example.com",
      motDePasse: hashedPassword,
      role: "admin",
      telephone: "0000000000",
      adresse: "HQ",
      photoProfil: "",
      statut: "active",
    });

    await adminUser.save();
    console.log("Admin account created successfully.");
  } catch (error) {
    console.log("failed error in  createAdminAccount", { error });

    console.error("Error creating admin account:", error);
  }
};

// 🔹 Protected Route Example (worked)
exports.protectedRoute = async (req, res) => {
  res.json({ message: "Welcome to the protected route", user: req.user });
};

// 🔹 Get logged-in user data (protected route) - ADAPTED FOR RESTAURANT USERS
exports.getLoggedUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If the user has a restaurant role, get and include their restaurant data
    if (user.role === "restaurant") {
      const restaurantData = await Restaurant.findOne({
        proprietaire: user._id,
      })
        .populate("plats")
        .populate("categories")
        .lean();

      if (restaurantData) {
        // Combine user and restaurant data
        user.restaurantDetails = restaurantData;
      }
    }

    res.json({ data: { user } });
  } catch (error) {
    console.log("failed error in  getLoggedUser", { error });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Logout User
exports.logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("failed error in  logout", { error });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Change Password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID from the token
    const { oldPassword, newPassword } = req.body;

    // Find the user by ID
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

    // Update the password in the database
    user.motDePasse = hashedNewPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.log("failed error in  changePassword", { error });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Reset User Password
exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "if this user exist you will be recieve an email" });
    }

    // Generate a random password
    const randomPassword = Math.random().toString(36).slice(-8); // Generates an 8-character random string

    // Hash the new password
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Update the user's password
    user.motDePasse = hashedPassword;
    await user.save();
    // Send the new password via email
    const emailSent = await sendPasswordResetEmail(
      user.nom,
      user.prenom,
      user.email,
      randomPassword
    );
    if (!emailSent) {
      return res
        .status(500)
        .json({ message: "Failed to send password reset email" });
    }

    res.json({
      message:
        "Password reset successfully. A new password has been sent to the user's email.",
    });
  } catch (error) {
    console.log("failed error in resetPassword", { error });
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.contactUs = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Send the email to the admin
    const emailSent = await sendContactUsEmail(name, email, message);

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send the email." });
    }

    res
      .status(200)
      .json({ message: "Your message has been sent successfully!" });
  } catch (error) {
    console.error("Error in contactUs controller:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
