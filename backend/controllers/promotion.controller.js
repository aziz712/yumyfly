const Plat = require("../models/Plat");
const Restaurant = require("../models/Restaurant");

require("dotenv").config();

const getPromotionDaysLeft = (dateFin) => {
  const now = new Date();
  const end = new Date(dateFin);
  const diff = end - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Promotion terminée";
  if (days === 1) return "Il reste 1 jour";
  return `Il reste ${days} jours`;
};

// Check if a promotion is currently active
const isPromotionActive = (dateDebut, dateFin) => {
  const now = new Date();
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  return now >= debut && now <= fin;
};

exports.applyPromotion = async (req, res) => {
  const { platId, pourcentage, dateDebut, dateFin, isActive = true } = req.body;

  // Validation du pourcentage
  if (!pourcentage || pourcentage < 1 || pourcentage > 100) {
    return res.status(400).json({ message: "Le pourcentage doit être entre 1% et 100%." });
  }

  // Validation des dates
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  if (isNaN(debut.getTime()) || isNaN(fin.getTime()) || fin <= debut) {
    return res.status(400).json({ message: "Dates invalides : La date de fin doit être après la date de début." });
  }

  try {
    const plat = await Plat.findById(platId);
    if (!plat) return res.status(404).json({ message: "Plat introuvable." });

    // Vérifier si une promotion existe déjà (active ou inactive)
    if (plat.promotion) {
      // Update existing promotion instead of creating a new one
      const prixApresReduction = +(plat.prix * (1 - pourcentage / 100)).toFixed(2);

      plat.promotion = {
        ...plat.promotion,
        isPromotionActive: isActive,
        pourcentage,
        prixApresReduction,
        dateDebut: debut,
        dateFin: fin,
      };

      await plat.save();

      return res.status(200).json({
        message: isActive ? "Promotion activée avec succès." : "Promotion mise à jour mais désactivée.",
        plat,
        joursRestants: getPromotionDaysLeft(fin),
      });
    }

    const prixApresReduction = +(plat.prix * (1 - pourcentage / 100)).toFixed(2);

    plat.promotion = {
      isPromotionActive: isActive,
      pourcentage,
      prixApresReduction,
      dateDebut: debut,
      dateFin: fin,
    };

    await plat.save();

    res.status(200).json({
      message: isActive ? "Promotion appliquée avec succès." : "Promotion créée mais désactivée.",
      plat,
      joursRestants: getPromotionDaysLeft(fin),
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Modified to deactivate instead of removing
exports.updatePromotion = async (req, res) => {
  const { platId } = req.params;

  try {
    const plat = await Plat.findById(platId);
    if (!plat) return res.status(404).json({ message: "Plat introuvable." });

    // Instead of removing, just set isPromotionActive to false
    if (plat.promotion) {
      plat.promotion.isPromotionActive = false;
      await plat.save();
      return res.status(200).json({
        message: "Promotion désactivée avec succès.",
        plat
      });
    } else {
      return res.status(404).json({ message: "Ce plat n'a pas de promotion." });
    }
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.removePromotion = async (req, res) => {
  const { platId } = req.params;

  try {
    const plat = await Plat.findById(platId);
    if (!plat) return res.status(404).json({ message: "Plat introuvable." });

    // Instead of removing, just set isPromotionActive to false
    if (plat.promotion) {
      const updatedPlat = await Plat.findByIdAndUpdate(
        platId,
        { $unset: { promotion: "" } },
        { new: true }
      );
      await plat.save();
      if (!updatedPlat) {
        return res.status(404).json({ message: 'Plat not updated' });
      }
      return res.status(200).json({ 
        message: 'Promotion field removed successfully', plat: updatedPlat 
      });
    } else {
      return res.status(404).json({ message: "Ce plat n'a pas de promotion." });
    }
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};



// Modified to get ALL promotions (active and inactive)
exports.getPromotionsByRestaurant = async (req, res) => {
  const { restaurantId } = req.params;

  try {
    // Find all plats with promotions for this restaurant (both active and inactive)
    const plats = await Plat.find({
      restaurant: restaurantId,
      "promotion": { $exists: true, $ne: null }
    }).populate("categorie", "nom");

    if (!plats || plats.length === 0) {
      return res.status(200).json([]);
    }

    // Transform the data to return a clean promotions array
    const promotions = plats.map((plat) => {
      // Check if the promotion dates are still valid
      const datesAreValid = isPromotionActive(
        plat.promotion.dateDebut,
        plat.promotion.dateFin
      );

      // A promotion is active only if both isPromotionActive flag is true AND dates are valid
      const isActive = plat.promotion.isPromotionActive && datesAreValid;

      return {
        _id: plat._id,
        plat: {
          _id: plat._id,
          nom: plat.nom,
          description: plat.description,
          prix: plat.prix,
          image: plat.images && plat.images.length > 0 ? plat.images[0] : null,
          categorie: plat.categorie ? plat.categorie.nom : null
        },
        pourcentage: plat.promotion.pourcentage,
        prixApresReduction: plat.promotion.prixApresReduction,
        dateDebut: plat.promotion.dateDebut,
        dateFin: plat.promotion.dateFin,
        message: plat.promotion.promoMessage || "",
        isPromotionActive: isActive,
        manuallyDisabled: !plat.promotion.isPromotionActive,
        datesExpired: !datesAreValid,
        joursRestants: getPromotionDaysLeft(plat.promotion.dateFin)
      };
    });

    res.status(200).json(promotions);
  } catch (err) {
    console.error("Error fetching promotions:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// This function is now redundant since getPromotionsByRestaurant already returns all promotions
// But keeping it for backward compatibility
exports.getAllPromotionsByRestaurant = async (req, res) => {
  return exports.getPromotionsByRestaurant(req, res);
};

// Update promotion status (activate/deactivate)
exports.updatePromotionStatus = async (req, res) => {
  const { platId } = req.params;
  const { isActive } = req.body;

  try {
    const plat = await Plat.findById(platId);
    if (!plat) return res.status(404).json({ message: "Plat introuvable." });

    if (!plat.promotion) {
      return res.status(404).json({ message: "Ce plat n'a pas de promotion." });
    }

    // Update only the isPromotionActive status
    plat.promotion.isPromotionActive = isActive;
    await plat.save();

    res.status(200).json({
      message: isActive ? "Promotion activée avec succès." : "Promotion désactivée avec succès.",
      plat
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// New function to get a specific promotion by plat ID
exports.getPromotionByPlatId = async (req, res) => {
  const { platId } = req.params;

  try {
    const plat = await Plat.findById(platId).populate("categorie", "nom");

    if (!plat) {
      return res.status(404).json({ message: "Plat introuvable." });
    }

    if (!plat.promotion) {
      return res.status(404).json({ message: "Ce plat n'a pas de promotion." });
    }

    // Check if the promotion dates are still valid
    const datesAreValid = isPromotionActive(
      plat.promotion.dateDebut,
      plat.promotion.dateFin
    );

    // A promotion is active only if both isPromotionActive flag is true AND dates are valid
    const isActive = plat.promotion.isPromotionActive && datesAreValid;

    const promotion = {
      _id: plat._id,
      plat: {
        _id: plat._id,
        nom: plat.nom,
        description: plat.description,
        prix: plat.prix,
        image: plat.images && plat.images.length > 0 ? plat.images[0] : null,
        categorie: plat.categorie ? plat.categorie.nom : null
      },
      pourcentage: plat.promotion.pourcentage,
      prixApresReduction: plat.promotion.prixApresReduction,
      dateDebut: plat.promotion.dateDebut,
      dateFin: plat.promotion.dateFin,
      message: plat.promotion.promoMessage || "",
      isPromotionActive: isActive,
      manuallyDisabled: !plat.promotion.isPromotionActive,
      datesExpired: !datesAreValid,
      joursRestants: getPromotionDaysLeft(plat.promotion.dateFin)
    };

    res.status(200).json(promotion);
  } catch (err) {
    console.error("Error fetching promotion by plat ID:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
