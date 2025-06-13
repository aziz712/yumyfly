const express = require("express");
const router = express.Router();
const commandeController = require("../controllers/commande.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

// 🔹 Pass Commande (Create a new order)
router.post("/", authMiddleware, commandeController.passCommande);

// 🔹 Get All My Commandes (Retrieve all orders placed by the logged-in client)
router.get(
  "/my-commandes",
  authMiddleware,
  commandeController.getAllMyCommandes
);

// 🔹 Change Commande Status (Update the status of an order)
router.put("/status", authMiddleware, commandeController.changeCommandeStatus);

// 🔹 Estimate Livraison (Update estimated delivery time for an order)
router.put(
  "/:commandeId/estimation",
  authMiddleware,
  commandeController.estimationLivraison
);

// 🔹 Confirm Payment (Mark an order as paid)
router.put(
  "/:commandeId/confirm-paid",
  authMiddleware,
  commandeController.confirmPaid
);

// 🔹 Delete Commande by ID
router.delete(
  "/:commandeId",
  authMiddleware,
  commandeController.deleteCommande
);

// 🔹 Get make commande paid 
router.put(
  "/:commandeId/paid",
  authMiddleware,
  commandeController.paidCommande
)

// 🔹 Get All Commandes (Retrieve all orders in the database)
router.get("/", authMiddleware, commandeController.getAllCommandes);

// 🔹 Get All Restaurant Commandes (Retrieve all orders for a specific restaurant)
router.get(
  "/restaurant",
  authMiddleware,
  commandeController.getAllRestaurantCommandes
);

// 🔹 Get All Assigned Commandes (Retrieve all orders assigned to a delivery person)
router.get(
  "/assigned",
  authMiddleware,
  commandeController.getAllAssignedCommandes
);

// 🔹 Assign Commande to Livreur (Assign a delivery person to an order)
router.put(
  "/:commandeId/assign",
  authMiddleware,
  commandeController.assignCommande
);

module.exports = router;
