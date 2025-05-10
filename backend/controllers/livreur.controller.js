const User = require("../models/User");
const Livreur = require("../models/Livreur");
const Commande = require("../models/Commande");

// 🔹 Get My Livreur Profile
exports.myLivreurProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Delivery person ID from JWT token

    // Find the user
    const user = await User.findById(userId).select("-motDePasse");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the associated livreur entry
    const livreur = await Livreur.findOne({ userId }).populate("restaurantId");
    if (!livreur) {
      return res.status(404).json({ message: "Livreur data not found" });
    }

    res.json({
      message: "Livreur profile retrieved successfully",
      user,
      livreur,
    });
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

// 🔹 Change Disponibilite
exports.changeDisponibilite = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the livreur entry
    const livreur = await Livreur.findOne({ userId });
    if (!livreur) {
      return res.status(404).json({ message: "Livreur data not found" });
    }

    // Toggle disponibilite
    livreur.disponibilite = !livreur.disponibilite;
    await livreur.save();

    res.json({
      message: `Disponibilite updated successfully: ${livreur.disponibilite}`,
      livreur,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
