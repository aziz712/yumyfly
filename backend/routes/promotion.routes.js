const express = require("express");
const router = express.Router();

const promotionController = require("../controllers/promotion.controller");

// Middleware d'authentification (remplace avec le tien si tu en as un)
const { authMiddleware, restaurantMiddleware } = require("../middlewares/auth.middleware");

//  Route pour appliquer une promotion sur un plat
router.post(
  "/apply-promotion",
  authMiddleware, // utilisateur connecté
  restaurantMiddleware, // uniquement les restaurants peuvent appliquer des promos
  promotionController.applyPromotion
);

//  Route pour supprimer une promotion d'un plat
router.delete(
  "/remove/:platId",
  authMiddleware,
  restaurantMiddleware,
  promotionController.updatePromotion
);

router.patch(
  "/remove/:platId",
  authMiddleware,
  restaurantMiddleware,
  promotionController.removePromotion
);
//  Route pour récupérer toutes les promotions actives d'un restaurant
router.get(
  "/restaurant/:restaurantId",
  authMiddleware,
  promotionController.getPromotionsByRestaurant
);

// Nouvelle route pour récupérer toutes les promotions (actives et inactives) d'un restaurant
router.get(
  "/restaurant/:restaurantId/all",
  authMiddleware,
  restaurantMiddleware,
  promotionController.getAllPromotionsByRestaurant
);

// Nouvelle route pour récupérer une promotion spécifique par ID de plat
router.get(
  "/plat/:platId",
  authMiddleware,
  promotionController.getPromotionByPlatId
);

// Add this new route
router.patch('/status/:platId', authMiddleware, promotionController.updatePromotionStatus);

module.exports = router;
