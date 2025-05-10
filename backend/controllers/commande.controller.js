const Commande = require("../models/Commande");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Livreur = require("../models/Livreur");
const {
  sendMailNotifyLivreurNewCommandeAssigned,
  sendMailToRestaurantRecieveNewCommande,
  sendMailNotifyClientDeliveryEnRoute,
  sendMailNotifyCommandeDelivered,
} = require("../middlewares/mailSender");
// 🔹 Pass Commande
exports.passCommande = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming the user ID is available in the request
    const { restaurant, plats, address, coordinates, note, total, serviceFee } =
      req.body;
    // Fetch client details
    const client = await User.findById(userId);
    const restaurantData = await Restaurant.findById(restaurant);
    const restaurantOwner = await User.findById(restaurantData.proprietaire);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Create the commande
    const commande = new Commande({
      client: userId,
      restaurant,
      plats,
      address,
      coordinates,
      serviceFee,
      note,
      total,
    });

    await commande.save();

    // Send notification email to the restaurant owner
    await sendMailToRestaurantRecieveNewCommande(
      restaurantOwner.email, // Assuming the restaurant model has an 'email' field
      restaurant.nom, // Assuming the restaurant model has a 'name' field
      commande,
      client
    );

    res.status(201).json({ message: "Commande placed successfully", commande });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get All My Commandes
exports.getAllMyCommandes = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all commandes belonging to the client
    const commandes = await Commande.find({ client: userId })
      .populate("client")
      .populate("restaurant")
      .populate("livreur")
      .populate("plats.plat");

    res.json({ message: "Commandes retrieved successfully", commandes });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Change Commande Status
exports.changeCommandeStatus = async (req, res) => {
  try {
    const { commandeId, statut } = req.body;

    // Validate status value
    const validStatuses = [
      "en attente",
      "préparation",
      "prête",
      "assignée",
      "en route",
      "arrivée",
      "livrée",
    ];
    if (!validStatuses.includes(statut)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find the commande
    const commande = await Commande.findById(commandeId)
      .populate("client")
      .populate("restaurant")
      .populate("livreur")
      .populate("plats.plat");
    const restaurantOwner = await User.findById(
      commande.restaurant.proprietaire
    );

    if (!commande) {
      return res.status(404).json({ message: "Commande not found" });
    }

    // Update the status
    commande.statut = statut;

    // Optionally update timestamps based on status
    if (statut === "préparation") commande.DateSortie = new Date();
    if (statut === "livrée") commande.DateLivraison = new Date();

    await commande.save();

    // Notify the client if the status is "en route"
    if (statut === "en route") {
      await sendMailNotifyClientDeliveryEnRoute(
        commande.client.email, // Client's email
        `${commande.client.nom} ${commande.client.prenom}`, // Client's name
        commande // Commande details,
      );
    }
    if (statut === "livrée") {
      await sendMailNotifyCommandeDelivered(commande, restaurantOwner);
    }
    res.json({ message: "Commande status updated successfully", commande });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Estimate Livraison
exports.estimationLivraison = async (req, res) => {
  try {
    const { commandeId, estimationLivraison } = req.body;
    // Validate estimationLivraison
    if (!estimationLivraison || estimationLivraison <= 0) {
      return res.status(400).json({ message: "Invalid estimation date" });
    }

    // Find the commande
    const commande = await Commande.findById(commandeId)
      .populate("client")
      .populate("restaurant")
      .populate("livreur")
      .populate("plats.plat");

    if (!commande) {
      return res.status(404).json({ message: "Commande not found" });
    }

    // Update the estimationLivraison field
    commande.estimationLivraison = estimationLivraison;
    //change commande status to en route
    commande.statut = "en route";
    await commande.save();
    await sendMailNotifyClientDeliveryEnRoute(
      commande.client.email, // Client's email
      `${commande.client.nom} ${commande.client.prenom}`, // Client's name
      commande // Commande details
    );
    res.json({ message: "Estimation updated successfully", commande });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Confirm Payment
exports.confirmPaid = async (req, res) => {
  try {
    const { commandeId } = req.params;

    // Find the commande
    const commande = await Commande.findById(commandeId)
      .populate("livreur")
      .populate("client")
      .populate("restaurant");
    const restaurantOwner = await User.findById(
      commande.restaurant.proprietaire
    );

    if (!commande) {
      return res.status(404).json({ message: "Commande not found" });
    }

    // Mark the commande as paid
    commande.payee = true;
    commande.statut = "livrée";
    await commande.save();

    // Find and update the livreur's completed deliveries count
    // We need to find the livreur document associated with the user ID
    const livreur = await Livreur.findOneAndUpdate(
      { userId: commande.livreur },
      { $inc: { completedDeliveries: 1 } },
      { new: true }
    );
    // Notify the client and restaurant
    await sendMailNotifyCommandeDelivered(commande, restaurantOwner);
    res.json({
      message: "Payment confirmed successfully",
      commande,
      livreurCompletedDeliveries: livreur.completedDeliveries,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get All Commandes
exports.getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find()
      .populate("client")
      .populate("restaurant")
      .populate("livreur")
      .populate("plats.plat");
    res.json({ message: "All commandes retrieved successfully", commandes });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get All Restaurant Commandes
exports.getAllRestaurantCommandes = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the restaurant owned by the user
    const restaurant = await Restaurant.findOne({ proprietaire: userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Find all commandes for the restaurant
    const commandes = await Commande.find({ restaurant: restaurant._id })
      .populate("client")
      .populate("restaurant")
      .populate("livreur")
      .populate("plats.plat");

    res.json({
      message: "Restaurant commandes retrieved successfully",
      commandes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Get All Assigned Commandes
exports.getAllAssignedCommandes = async (req, res) => {
  try {
    const userId = req.user.id;
    // Find all commandes assigned to the delivery person
    const commandes = await Commande.find({ livreur: userId })
      .populate("client")
      .populate("restaurant")
      .populate("livreur")
      .populate("plats.plat");

    res.json({
      message: "Assigned commandes retrieved successfully",
      commandes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Assign Commande to Livreur
exports.assignCommande = async (req, res) => {
  console.log({
    from: "assignCommande",
  });
  try {
    const { commandeId, livreurId } = req.body;
    console.log(req.body);

    // Find the commande
    const commande = await Commande.findById(commandeId).populate("plats.plat");
    if (!commande) {
      return res.status(404).json({ message: "Commande not found" });
    }

    // Find the livreur
    const livreur = await User.findById(livreurId);
    if (!livreur) {
      return res
        .status(404)
        .json({ message: "Livreur not found or invalid role" });
    }

    // Assign the livreur to the commande
    commande.livreur = livreurId;
    commande.statut = "assignée"; // Automatically update status to "assignée"
    await commande.save();

    // Send notification email to the livreur
    await sendMailNotifyLivreurNewCommandeAssigned(
      livreur.email,
      `${livreur.nom} ${livreur.prenom}`,
      commande
    );

    res.json({ message: "Commande assigned successfully", commande });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
