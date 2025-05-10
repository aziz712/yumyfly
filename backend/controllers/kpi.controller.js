const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Plat = require("../models/Plat");
const Livreur = require("../models/Livreur");
const Commande = require("../models/Commande");
const mongoose = require("mongoose");

// 🔹 Admin Dashboard KPI
exports.adminDashboardKpi = async (req, res) => {
  try {
    // Total number of restaurants
    const totalNumberOfRestaurants = await Restaurant.countDocuments();

    // Total number of users
    const totalNumberOfUsers = await User.countDocuments();

    // Total number of commandes
    const totalNumberOfCommandes = await Commande.countDocuments();

    // Total number of livreurs
    const totalNumberOfLivreurs = await Livreur.countDocuments();

    // Total revenue (sum of totals for all paid commandes)
    const totalRevenue = await Commande.aggregate([
      { $match: { payee: true } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalRevenueValue =
      totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // Recent orders (fetch the last 5 commandes)
    const recentOrders = await Commande.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("client")
      .populate("restaurant");

    // Commandes statistics
    const commandesStatistics = await Commande.aggregate([
      {
        $group: {
          _id: "$statut",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format statistics into an object
    const formattedStats = commandesStatistics.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.json({
      totalNumberOfRestaurants,
      totalNumberOfUsers,
      totalNumberOfCommandes,
      totalNumberOfLivreurs,
      totalRevenue: totalRevenueValue,
      recentOrders,
      commandesStatistics: {
        enAttente: formattedStats["en attente"] || 0,
        livree: formattedStats.livrée || 0,
        enRoute: formattedStats["en route"] || 0,
        assignee: formattedStats.assignée || 0,
        preparation: formattedStats.préparation || 0,
        prete: formattedStats.prête || 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Restaurant Owner Dashboard KPI
exports.restaurantOwnerDashboardKpi = async (req, res) => {
  try {
    const RestaurantOwnerId = req.user.id;
    const restaurant = await Restaurant.findOne({
      proprietaire: RestaurantOwnerId,
    })
      .populate("plats")
      .populate("categories");
    if (restaurant) {
      // Total revenue for the restaurant (sum of totals for all paid commandes)
      const totalRevenue = await Commande.aggregate([
        {
          $match: {
            restaurant: restaurant._id,
            payee: true,
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]);
      const totalRevenueValue =
        totalRevenue.length > 0 ? totalRevenue[0].total : 0;

      // Total number of commandes for the restaurant
      const totalCommandes = await Commande.countDocuments({
        restaurant: restaurant._id,
      });

      // Total number of livreurs assigned to the restaurant
      const totalLivreurs = await Livreur.countDocuments({
        restaurantId: restaurant._id,
      });

      // Recent orders (last 5 commandes)
      const recentOrders = await Commande.find({ restaurant: restaurant._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("client");
      // Most commanded 5 plats
      const mostCommandedPlats = await Commande.aggregate([
        { $match: { restaurant: restaurant._id } },
        { $unwind: "$plats" },
        {
          $group: {
            _id: "$plats",
            totalQuantity: { $sum: "$plats.quantity" },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
      ]);

      // Populate plat details for most commanded plats
      const populatedPlats = await Plat.populate(mostCommandedPlats, {
        path: "plat",
      });
      res.json({
        totalRevenue: totalRevenueValue,
        totalCommandes,
        totalLivreurs,
        recentOrders,
        mostCommandedPlats: populatedPlats,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Client Dashboard KPI
exports.clientDashboardKpi = async (req, res) => {
  try {
    const clientId = req.user.id; // Assuming the user ID is available in the request

    // Total money spent all time
    const totalMoneySpent = await Commande.aggregate([
      {
        $match: {
          client: new mongoose.Types.ObjectId(clientId),
          payee: true,
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const totalMoneySpentValue =
      totalMoneySpent.length > 0 ? totalMoneySpent[0].total : 0;

    // Total money spent this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const totalMoneySpentThisMonth = await Commande.aggregate([
      {
        $match: {
          client: new mongoose.Types.ObjectId(clientId),
          payee: true,
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const totalMoneySpentThisMonthValue =
      totalMoneySpentThisMonth.length > 0
        ? totalMoneySpentThisMonth[0].total
        : 0;

    // Most commanded plat
    const mostCommandedPlat = await Commande.aggregate([
      { $match: { client: new mongoose.Types.ObjectId(clientId) } },
      { $unwind: "$plats" },
      {
        $group: {
          _id: "$plats._id",
          platName: { $first: "$plats.nom" },
          totalQuantity: { $sum: "$plats.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 1 },
    ]);

    // Populate the most commanded plat with full details from Plat collection
    let populatedMostCommandedPlat = [];
    if (mostCommandedPlat.length > 0) {
      populatedMostCommandedPlat = await Plat.populate(mostCommandedPlat, {
        path: "_id",
      });
    }

    // Last 5 orders
    const lastOrders = await Commande.find({ client: clientId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("restaurant");
    console.log({
      totalMoneySpent: totalMoneySpentValue,
      totalMoneySpentThisMonth: totalMoneySpentThisMonthValue,
      mostCommandedPlat: populatedMostCommandedPlat,
      lastOrders,
    });
    res.json({
      totalMoneySpent: totalMoneySpentValue,
      totalMoneySpentThisMonth: totalMoneySpentThisMonthValue,
      mostCommandedPlat:
        populatedMostCommandedPlat.length > 0
          ? {
              plat: populatedMostCommandedPlat[0]._id,
              platName: mostCommandedPlat[0].platName,
              totalQuantity: mostCommandedPlat[0].totalQuantity,
            }
          : null,
      lastOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Restaurant Delivery Statistics
exports.restaurantDeliveryStatistics = async (req, res) => {
  try {
    console.log("get the restaurantDeliveryStatistics ----------");
    const LivreurId = req.user.id;

    // Convert LivreurId to ObjectId for proper matching
    const livreurObjectId = new mongoose.Types.ObjectId(LivreurId);

    // Number of delivered commandes
    const deliveredCommandes = await Commande.countDocuments({
      livreur: livreurObjectId,
      statut: "livrée",
    });

    // Number of en route commandes
    const enRouteCommandes = await Commande.countDocuments({
      livreur: livreurObjectId,
      statut: "en route",
    });

    // Number of assigned commandes
    const assignedCommandes = await Commande.countDocuments({
      livreur: livreurObjectId,
      statut: "assignée",
    });

    // Total revenue for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todaysRevenue = await Commande.aggregate([
      {
        $match: {
          livreur: livreurObjectId,
          payee: true,
          statut: "livrée",
          createdAt: { $gte: startOfDay },
        },
      },
      { $group: { _id: null, total: { $sum: "$serviceFee" } } },
    ]);

    const todaysRevenueValue =
      todaysRevenue.length > 0 ? todaysRevenue[0].total : 0;

    // Total revenue for this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Commande.aggregate([
      {
        $match: {
          livreur: livreurObjectId,
          payee: true,
          statut: "livrée",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$serviceFee" } } },
    ]);

    const monthlyRevenueValue =
      monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0;

    console.log({
      deliveredCommandes,
      enRouteCommandes,
      assignedCommandes,
      todaysRevenue: todaysRevenueValue,
      monthlyRevenue: monthlyRevenueValue,
    });
    res.json({
      deliveredCommandes,
      enRouteCommandes,
      assignedCommandes,
      todaysRevenue: todaysRevenueValue,
      monthlyRevenue: monthlyRevenueValue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
