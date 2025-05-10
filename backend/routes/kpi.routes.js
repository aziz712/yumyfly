const express = require("express");
const router = express.Router();
const KpiController = require("../controllers/kpi.controller");
const {
  authMiddleware,
  adminMiddleware,
  restaurantMiddleware,
  clientMiddleware,
} = require("../middlewares/auth.middleware");

// 🔹 Admin Dashboard KPI Route
router.get(
  "/admin/dashboard",
  authMiddleware, // Ensure the user is authenticated
  adminMiddleware, // Ensure the user is an admin
  KpiController.adminDashboardKpi
);

// 🔹 Restaurant Owner Dashboard KPI Route
router.get(
  "/restaurant/dashboard",
  authMiddleware, // Ensure the user is authenticated
  restaurantMiddleware, // Ensure the user is a restaurant owner
  KpiController.restaurantOwnerDashboardKpi
);

// 🔹 Client Dashboard KPI Route
router.get(
  "/client/dashboard",
  authMiddleware, // Ensure the user is authenticated
  clientMiddleware, // Ensure the user is a client
  KpiController.clientDashboardKpi
);

// 🔹 Restaurant Delivery Statistics Route
router.get(
  "/livreur/delivery-statistics",
  authMiddleware, // Ensure the user is authenticated
  KpiController.restaurantDeliveryStatistics
);

module.exports = router;
