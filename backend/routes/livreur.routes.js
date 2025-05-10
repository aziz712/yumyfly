const express = require("express");
const router = express.Router();
const livreurController = require("../controllers/livreur.controller");
const {
  authMiddleware,
  livreurMiddleware,
} = require("../middlewares/auth.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");

// 🔹 Get My Livreur Profile
router.get(
  "/my-profile",
  authMiddleware,
  livreurMiddleware,
  livreurController.myLivreurProfile
);

// 🔹 Update My Profile
router.put(
  "/update-profile",
  authMiddleware,
  livreurMiddleware,
  uploadMiddleware.uploadProfileImage, // Middleware to handle profile image upload
  livreurController.updateMyProfile
);

// 🔹 Change Disponibilite
router.put(
  "/disponibilite",
  authMiddleware,
  livreurMiddleware,
  livreurController.changeDisponibilite
);

module.exports = router;
