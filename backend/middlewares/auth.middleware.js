const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// Main authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    // Check if Authorization header exists
    if (!req.header("Authorization")) {
      return res
        .status(401)
        .json({ message: "Access Denied. No token provided." });
    }

    let token = req.header("Authorization").split(" ")[1];
    if (!token) {
      console.error("** No token provided. ** ");
      return res
        .status(401)
        .json({ message: "Access Denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-motDePasse"); // Attach user data to request without password

    // Check if user exists and is active
    if (!req.user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (req.user.statut === "blocked") {
      return res.status(403).json({ message: "Account is blocked." });
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(401).json({ message: "Invalid Token" });
  }
};

// Client role middleware
const clientMiddleware = (req, res, next) => {
  if (req.user.role !== "client") {
    return res.status(403).json({ message: "Access denied. Clients only." });
  }
  next();
};

// Restaurant role middleware
const restaurantMiddleware = (req, res, next) => {
  if (req.user.role !== "restaurant") {
    return res
      .status(403)
      .json({ message: "Access denied. Restaurants only." });
  }
  next();
};

// Livreur (Delivery) role middleware
const livreurMiddleware = (req, res, next) => {
  if (req.user.role !== "livreur") {
    return res
      .status(403)
      .json({ message: "Access denied. Delivery personnel only." });
  }
  next();
};

// Admin role middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Administrators only." });
  }
  next();
};

// Combined middleware for multiple roles (utility function)
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Authorized roles only: ${roles.join(", ")}.`,
      });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  clientMiddleware,
  restaurantMiddleware,
  livreurMiddleware,
  adminMiddleware,
  roleMiddleware,
};
