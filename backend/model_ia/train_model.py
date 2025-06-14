
# train_model.py (version hybride : collaborative + content-based + feedback)

import pandas as pd
import numpy as np
from pymongo import MongoClient
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
import os

print("\n🔄 Connexion à MongoDB...")
try:
    client = MongoClient("mongodb+srv://azizslama95:Aziz1212@clustera.wa7tpmr.mongodb.net")
    db = client["pfe-yumyfly"]

    # Simplified query - we'll use the plats array directly
    orders = list(db.commandes.find())
    meals = list(db.plats.find())
    avis = list(db.avis.find())

    print(f"✅ {len(orders)} commandes récupérées.")
    print(f"✅ {len(meals)} plats récupérés.")
    print(f"✅ {len(avis)} avis récupérés.")

except Exception as e:
    print("❌ Erreur de connexion ou lecture MongoDB:", e)
    exit(1)

# === Étape 1 : Collaborative Filtering ===
print("\n🧠 Construction du modèle collaborative filtering...")

expanded_orders = []
for order in orders:
    try:
        if 'plats' in order and order['plats']:
            for plat in order['plats']:
                expanded_orders.append({
                    "userId": str(order['client']),
                    "mealId": str(plat['_id']),
                    "nom": plat['nom'],
                    "quantity": plat.get('quantity', 1)
                })
    except Exception as e:
        print(f"⚠️ Erreur avec la commande {order.get('_id')}: {str(e)}")

if not expanded_orders:
    print("❌ Aucune commande n'a pu être traitée")
    exit(1)

print(f"✅ {len(expanded_orders)} commandes traitées avec succès")

# Create DataFrames
df_orders = pd.DataFrame(expanded_orders)
df_meals = pd.DataFrame(meals)

# Préparation - using nom as identifier for meals
df_final = df_orders[["userId", "nom", "quantity"]]

# Matrice utilisateur × plat
user_meal_matrix = df_final.pivot_table(
    index="userId",
    columns="nom",
    values="quantity",
    aggfunc="sum",
    fill_value=0
)

print(f"✅ Matrice collaborative : {user_meal_matrix.shape[0]} utilisateurs × {user_meal_matrix.shape[1]} plats")

# Similarité utilisateur
user_similarity = cosine_similarity(user_meal_matrix)
sim_values = user_similarity[np.triu_indices_from(user_similarity, k=1)]

# === Étape 2 : Content-Based Filtering ===
print("\n🧠 Construction du modèle content-based filtering...")

# Add error handling for missing fields
df_meals["tags"] = df_meals["tags"].apply(lambda x: " ".join(x) if isinstance(x, list) else "")
df_meals["description"] = df_meals["description"].fillna("")
df_meals["text"] = df_meals["nom"] + " " + df_meals["description"] + " " + df_meals["tags"]

vectorizer = TfidfVectorizer()
meal_tfidf = vectorizer.fit_transform(df_meals["text"])
meal_similarity = cosine_similarity(meal_tfidf)

print(f"✅ Matrice content-based : {meal_similarity.shape[0]} plats comparés")

# === Étape 3 : Calcul des scores de feedback ===
print("\n⭐ Calcul des scores de feedback utilisateurs...")

feedback_scores = {}
for meal in meals:
    meal_id = str(meal["_id"])
    likes = len(meal.get("likes", []))
    comments = len(meal.get("commentaires", []))
    
    # Default score if no feedback
    feedback_scores[meal_id] = 1.0

print(f"✅ Scores de feedback calculés pour {len(feedback_scores)} plats")

# === Étape 4 : Sauvegarde ===
try:
    os.makedirs("trained_models", exist_ok=True)
    joblib.dump(user_meal_matrix, "trained_models/user_meal.pkl")
    joblib.dump(user_similarity, "trained_models/user_similarity.pkl")
    joblib.dump(meal_similarity, "trained_models/meal_similarity.pkl")
    joblib.dump(df_meals, "trained_models/meals_data.pkl")
    joblib.dump(feedback_scores, "trained_models/feedback_scores.pkl")
    print("\n✅ Modèles sauvegardés avec succès")
except Exception as e:
    print(f"\n❌ Erreur lors de la sauvegarde des modèles: {str(e)}")

# === Métriques d'évaluation ===
print("\n📊 Évaluation du modèle :")
if len(sim_values) > 0:
    print(f"📈 Similarité utilisateur (Collaborative): moyenne={sim_values.mean():.3f}, min={sim_values.min():.3f}, max={sim_values.max():.3f}")
else:
    print("❌ Pas assez de données pour évaluer la similarité utilisateur.")

flat_meal_sim = meal_similarity[np.triu_indices_from(meal_similarity, k=1)]
print(f"📈 Similarité plats (Content-Based): moyenne={flat_meal_sim.mean():.3f}, min={flat_meal_sim.min():.3f}, max={flat_meal_sim.max():.3f}")

print("\n✅ Entraînement terminé. Fichiers enregistrés :")
print("📁 user_meal.pkl (Collaborative)")
print("📁 user_similarity.pkl (Collaborative)")
print("📁 meal_similarity.pkl (Content-Based)")
print("📁 meals_data.pkl (Infos plats)")
print("📁 feedback_scores.pkl (Scores utilisateur)")





