const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/auth.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");
const {
  getAdminProfile,
  updateAdminProfile,
  getAllUsers,
  changeAccountStatus,
  createRestaurantOwner,
  deleteUser,
  getUserById,
} = adminController;

// 🔹 Get Admin Profile
router.get("/profile", authMiddleware, adminMiddleware, getAdminProfile);

// 🔹 Update Admin Profile
router.put(
  "/profile",
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.uploadProfileImage,
  updateAdminProfile
);

// 🔹 Get All Users
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);

// 🔹 Change Account Status
router.put(
  "/users/status",
  authMiddleware,

  changeAccountStatus
);

// 🔹 Create Restaurant Owner
router.post(
  "/restaurant-owner",
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.uploadProfileImage,
  createRestaurantOwner
);

// 🔹 Delete User
router.delete("/users/:userId", authMiddleware, adminMiddleware, deleteUser);

// 🔹 Get User by ID
router.get("/users/:userId", authMiddleware, getUserById);

module.exports = router;
