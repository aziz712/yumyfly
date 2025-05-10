from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
import traceback

app = Flask(__name__)

print("📦 Chargement des modèles...")
user_meal = joblib.load("trained_models/user_meal.pkl")
user_similarity = joblib.load("trained_models/user_similarity.pkl")
meal_similarity = joblib.load("trained_models/meal_similarity.pkl")
meals_data = joblib.load("trained_models/meals_data.pkl")
feedback_scores = joblib.load("trained_models/feedback_scores.pkl")

user_meal.index = user_meal.index.astype(str)

@app.route("/recommend", methods=["GET"])
def hybrid_recommend():
    user_id = str(request.args.get("user_id"))
    fusion_weight = float(request.args.get("weight", 0.5))

    print(f"🔍 Requête reçue pour user_id={user_id}, weight={fusion_weight}")

    if user_id not in user_meal.index:
        pop = user_meal.sum(axis=0).sort_values(ascending=False).head(10).index.tolist()
        print("👤 Nouvel utilisateur - Recommandations populaires")
        return jsonify({"mode": "popular", "recommended": pop})

    try:
        user_index = list(user_meal.index).index(user_id)
        user_scores = list(user_similarity[user_index])
        user_scores[user_index] = -1
        similar_user_index = np.argmax(user_scores)
        similar_user_id = user_meal.index[similar_user_index]

        user_vec = user_meal.loc[user_id]
        similar_vec = user_meal.loc[similar_user_id]
        collab_diff = similar_vec - user_vec
        collab_suggestions = collab_diff[collab_diff > 0].sort_values(ascending=False)

        liked_meals = user_vec[user_vec > 0].sort_values(ascending=False).index.tolist()
        if len(liked_meals) > 0:
            liked_indices = meals_data[meals_data["nom"].isin(liked_meals)].index.tolist()
            if len(liked_indices) > 0:
                mean_sim = meal_similarity[liked_indices].mean(axis=0)
                meal_names = meals_data["nom"].tolist()
                content_suggestions = pd.Series(mean_sim, index=meal_names)
                content_suggestions = content_suggestions.drop(labels=liked_meals, errors="ignore")
                content_suggestions = content_suggestions.sort_values(ascending=False)
            else:
                content_suggestions = pd.Series(dtype=float)
        else:
            content_suggestions = pd.Series(dtype=float)

        fusion = pd.Series(dtype=float)
        for meal in collab_suggestions.index:
            fusion[meal] = fusion_weight * collab_suggestions[meal]
        for meal in content_suggestions.index:
            fusion[meal] = fusion.get(meal, 0) + (1 - fusion_weight) * content_suggestions[meal]

        updated_fusion = {}
        for meal in fusion.index:
            meal_row = meals_data[meals_data["nom"] == meal]
            if isinstance(meal_row, pd.DataFrame) and not meal_row.empty:
                meal_id = str(meal_row.iloc[0]["_id"])
                feedback_boost = feedback_scores.get(meal_id, 1)
                updated_fusion[meal] = fusion[meal] * feedback_boost
            else:
                updated_fusion[meal] = fusion[meal]

        # Clean and deduplicate fusion
        fusion = pd.Series(updated_fusion).dropna()
        fusion = fusion[~fusion.index.duplicated()]  # Remove duplicate indices
        fusion = pd.to_numeric(fusion, errors="coerce").dropna()  # Ensure numeric values

        print("✅ Fusion après pondération :")
        print(fusion.head())

        if not fusion.empty:
            top_meals = fusion.sort_values(ascending=False).head(5).index.tolist()
        else:
            print("⚠️ Aucun résultat hybride - fallback sur les plus populaires")
            top_meals = user_meal.sum(axis=0).sort_values(ascending=False).head(5).index.tolist()

        return jsonify({"mode": "hybrid", "recommended": top_meals})

    except Exception as e:
        print("❌ Erreur dans la recommandation hybride :")
        print(traceback.format_exc())  # ✅ Détail de l'erreur affiché dans les logs
        fallback_meals = user_meal.sum(axis=0).sort_values(ascending=False).head(5).index.tolist()
        return jsonify({"mode": "fallback", "recommended": fallback_meals})

if __name__ == '__main__':
    print("🚀 API en cours d'exécution")
    app.run(port=5001)
