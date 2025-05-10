const express = require("express");
const router = express.Router();
const avisController = require("../controllers/avis.controller");
const {
  authMiddleware,
  clientMiddleware,
} = require("../middlewares/auth.middleware");

// 🔹 Create Avis (Only authenticated clients can create an avis)
router.post(
  "/",
  authMiddleware, // Ensure the user is authenticated
  clientMiddleware, // Ensure the user is a client
  avisController.createAvis
);

// 🔹 Delete Avis (Only the client who created the avis can delete it)
router.delete(
  "/:avisId",
  authMiddleware, // Ensure the user is authenticated

  avisController.deleteAvis
);

// 🔹 Update Avis (Only the client who created the avis can update it)
router.put(
  "/:avisId",
  authMiddleware, // Ensure the user is authenticated
  clientMiddleware, // Ensure the user is a client
  avisController.updateAvis
);

// 🔹 Get All Avis on Platform (Public or Admin-Only Access)
router.get("/", avisController.getAllAvis);

// 🔹 Get All Avis for a Specific Restaurant
router.get("/restaurant/:restaurantId", avisController.getAllAvisForRestaurant);

// 🔹 Get All Avis for a Specific Livreur
router.get("/livreur/:livreurId", avisController.getAllAvisForLivreur);

module.exports = router;
