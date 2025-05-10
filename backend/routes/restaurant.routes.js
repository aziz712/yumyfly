const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurant.controller");
const {
  authMiddleware,
  restaurantMiddleware,
} = require("../middlewares/auth.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");

// 🔹 Get My Owner Profile
router.get(
  "/my-profile",
  authMiddleware,
  restaurantMiddleware,
  restaurantController.myOwnerProfile
);

// 🔹 Update My Password
router.put(
  "/update-password",
  authMiddleware,
  restaurantMiddleware,
  restaurantController.updateMyPassword
);

// 🔹 Update My Profile (with optional profile image upload)
router.put(
  "/update-profile",
  authMiddleware,
  restaurantMiddleware,
  uploadMiddleware.uploadProfileImage, // Middleware to handle profile image upload
  restaurantController.updateMyProfile
);

// 🔹 Check if Restaurant Data is Completed
router.get(
  "/check-restaurant",
  authMiddleware,
  restaurantMiddleware,
  restaurantController.checkRestaurantDataCompleted
);

// 🔹 Complete Restaurant Information (create restaurant)
router.post(
  "/complete-restaurant",
  authMiddleware,
  restaurantMiddleware,
  uploadMiddleware.uploadMultipleImages, // Middleware to handle multiple images upload
  restaurantController.completeRestaurantInformation
);

// 🔹 Update Restaurant Information (update restaurant details)
router.put(
  "/update-restaurant",
  authMiddleware,
  restaurantMiddleware,
  uploadMiddleware.uploadMultipleImages, // Middleware to handle multiple images upload
  restaurantController.updateRestaurantInformation
);

// 🔹 Create Category (with optional category image upload)
router.post(
  "/categories",
  authMiddleware,
  restaurantMiddleware,
  uploadMiddleware.uploadCategoryImage, // Middleware to handle category image upload
  restaurantController.createCategory
);

// 🔹 Update Category (with optional category image upload)
router.put(
  "/categories/:categoryId",
  authMiddleware,
  restaurantMiddleware,
  uploadMiddleware.uploadCategoryImage, // Middleware to handle category image upload
  restaurantController.updateCategory
);

// 🔹 Get All Categories of the Restaurant
router.get(
  "/categories",
  authMiddleware,
  restaurantMiddleware,
  restaurantController.getAllCategories
);

// 🔹 Delete Category (and associated dishes)
router.delete(
  "/categories/:categoryId",
  authMiddleware,
  restaurantMiddleware,
  restaurantController.deleteCategory
);
// 🔹 Create Delivery
router.post(
  "/deliveries",
  authMiddleware,
  restaurantMiddleware,
  restaurantController.createDelivery
);

// 🔹 Get All My Restaurant Deliveries
router.get(
  "/deliveries",
  authMiddleware,
  restaurantMiddleware,
  restaurantController.getAllMyRestaurantDeliveries
);
// 🔹 Delete Delivery Account by Restaurant Owner
router.delete(
  "/deliveries/:livreurId",
  authMiddleware,
  restaurantMiddleware,
  restaurantController.deleteDeliveryAccountByRestaurantOwner
);
// 🔹 Change Delivery Account Status
router.put(
  "/deliveries/:livreurId/status",
  authMiddleware,
  restaurantMiddleware,
  restaurantController.changeDeliveryAccountStatus
);

module.exports = router;
