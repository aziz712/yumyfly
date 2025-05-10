const express = require("express");
const router = express.Router();
const platController = require("../controllers/plats.controller");
const {
  authMiddleware,
  restaurantMiddleware,
} = require("../middlewares/auth.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");

// 🔹 Add Plat (Create a new dish)
router.post(
  "/",
  authMiddleware,
  restaurantMiddleware,
  uploadMiddleware.uploadMixedMedia,
  platController.addPlat
);

// 🔹 Get All Plats of Restaurant
router.get(
  "/",
  authMiddleware,
  restaurantMiddleware,
  platController.getAllPlatsOfRestaurant
);

// 🔹 Get All Plats by Category
router.get(
  "/categories/:categoryId",
  authMiddleware,
  restaurantMiddleware,
  platController.getAllPlatsByCategory
);

// 🔹 Get Plat by ID
router.get(
  "/:platId",
  authMiddleware,
  restaurantMiddleware,
  platController.getPlatById
);

// 🔹 Update Plat
router.put(
  "/:platId",
  authMiddleware,
  restaurantMiddleware,
  uploadMiddleware.uploadPlatMedia, // Middleware to handle mixed media uploads (images and videos)
  platController.updatePlat
);

// 🔹 Delete Plat
router.delete(
  "/:platId",
  authMiddleware,
  restaurantMiddleware,
  platController.deletePlat
);

// 🔹 Change Plat Status (Toggle availability)
router.put(
  "/:platId/status",
  authMiddleware,
  restaurantMiddleware,
  platController.changePlatStatus
);

module.exports = router;
