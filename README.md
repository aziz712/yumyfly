
---


# 🍽️ YumyFly – Plateforme MERN de Livraison de Repas

**YumyFly** est une plateforme web de livraison de repas développée en **MERN stack** (MongoDB, Express.js, React/Next.js, Node.js) permettant l'interaction entre restaurants, clients, livreurs et administrateurs. Elle intègre également un **système de recommandation intelligent hybride** basé sur Flask et MongoDB.

---

## 🎯 Objectif du projet

Permettre à :
- 🧑‍🍽️ **Clients** de passer commande en ligne auprès de restaurants
- 🧑‍🍳 **Restaurants** de gérer leur menu, recevoir des commandes et assigner les livreurs
- 🚚 **Livreurs** d’assurer les livraisons
- 👨‍💼 **Admins** de superviser les activités de la plateforme

> Le système est conçu pour évoluer facilement vers une version intelligente (recommandations, chatbot, suivi GPS...).

---

## 🧩 Rôles et fonctionnalités

### 🧑‍🍽️ Client
- S’inscrire, se connecter et gérer son profil
- Parcourir restaurants, plats et catégories
- Rechercher des plats (par catégorie, nom, type…)
- Aimer, partager, noter un plat ou un livreur
- Passer commande, suivre les statuts (préparée, en route, livrée)
- Notifications en temps réel

### 🧑‍🍳 Restaurant
- Gérer son compte et son restaurant
- Créer et modifier des plats, catégories, prix, images
- Voir les commandes reçues, les statuts
- Assigner un livreur à une commande
- Notifications à chaque nouvelle commande

### 🚚 Livreur
- Gérer son profil et sa disponibilité
- Voir les livraisons qui lui sont assignées
- Mettre à jour le statut : À récupérer → En route → Livrée
- Estimer l’heure de livraison
- Notifications sur les nouvelles livraisons

### 👨‍💼 Admin
- Gérer tous les utilisateurs
- Supprimer ou bloquer des comptes
- Voir les statistiques générales
- Supervision globale des commandes

---

## 🔐 Authentification

- Utilisation de **JWT**
- Middleware basé sur les rôles (`admin`, `client`, `restaurant`, `livreur`)

---

## 🔔 Notifications

### Envoi d’emails :
- 📦 Client : Statuts commande → En route / Livrée + message de remerciement
- 🍽️ Restaurant : Nouvelle commande reçue
- 🚚 Livreur : Nouvelle commande assignée

---

## 🗃️ Structure de la base de données (MongoDB)

Collections principales :
- `users` (admin, client, restaurant, livreur)
- `restaurants`
- `plats`
- `categories`
- `commandes`
- `livraisons`
- `notifications`
- `avis`

---

## 🧠 Système de recommandation hybride (Flask)

### Objectif
Recommander des plats personnalisés aux utilisateurs à partir de :
- **Collaborative Filtering** (utilisateurs similaires)
- **Content-Based Filtering** (descriptions, tags, noms)
- **Feedback utilisateur** (likes, notes, commentaires)

### 📁 Structure des fichiers
- `api_reco_hybrid.py` → API Flask
- `train_model.py` → Script d’entraînement
- `trained_models/` → Dossier des modèles `.pkl`

### 🔁 Entraînement
- Chargement depuis MongoDB (`commandes`, `plats`, `avis`)
- Calcul des similarités (utilisateur et plat)
- Pondération des feedbacks :
  - ⭐ Notes moyennes (50%)
  - ❤️ Likes (30%)
  - 💬 Commentaires (20%)
- Sauvegarde des modèles via `joblib`

### 🔌 API Endpoint


GET /recommend/userId?&weight=<poids>


- `user_id` : ID de l’utilisateur
- `weight` : pondération (par défaut 0.5)

### 🔄 Résultat JSON
```
{
  "mode": "hybrid",
  "recommended": ["Couscous Royal", "Pizza Margherita", "Tajine Poulet", "Burger Bœuf", "Sushi Saumon"]
}

```
---

## 🧪 Évaluation & Logs

* Affiche les dimensions des matrices
* Affiche les similarités moyennes
* Logs API : requêtes, erreurs, fusions de recommandations

---

## 💻 Stack Technique

| Catégorie        | Technologies / Outils                      |
| ---------------- | ------------------------------------------ |
| Frontend         | Next.js, Tailwind CSS, Shadcn, Zustand     |
| Backend          | Node.js, Express.js                        |
| Base de données  | MongoDB + Mongoose                         |
| Authentification | JWT                                        |
| Notifications    | Email                                      |
| IA / ML          | Flask, scikit-learn, joblib, pandas        |



