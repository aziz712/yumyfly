const axios = require("axios");
const Plat = require("../models/Plat"); // Modèle Mongoose

exports.getHybridRecommendations = async (req, res) => {
  const { userId } = req.params;
  const weight = req.query.weight || 0.5;

  try {
    // Appel API Flask
    const flaskRes = await axios.get("http://127.0.0.1:5001/recommend", {
      params: { user_id: userId, weight },
    });

    const recommendedNames = flaskRes.data.recommended;

    // Requête MongoDB pour récupérer les plats avec ces noms
    const plats = await Plat.find({ nom: { $in: recommendedNames } });

    // Réordonner les plats selon l'ordre de recommandation
    const platsOrdonnes = recommendedNames
      .map((nom) => plats.find((p) => p.nom === nom))
      .filter(Boolean); // enlever ceux non trouvés
    console.log({ platsOrdonnes });
    res.json({
      mode: flaskRes.data.mode,
      recommended: platsOrdonnes,
    });
  } catch (error) {
    console.error("❌ Erreur de recommandation hybride :", error.message);
    res
      .status(500)
      .json({ message: "Erreur lors de la recommandation IA hybride." });
  }
};
