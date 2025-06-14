﻿
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


GET /recommend/userId?&weight=poids


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



## 📁 Structure du Projet

```
yumyfly/
├── backend/                    # Application côté serveur (Node.js, Express.js)
│   ├── config/                 # Configuration de la base de données (db.js)
│   ├── controllers/            # Logique métier pour les API (auth, admin, plat, commande, etc.)
│   ├── middlewares/            # Middlewares (auth, upload, mailSender)
│   ├── model_ia/               # Système de recommandation IA (Flask)
│   │   ├── api_reco_hybrid.py  # API Flask pour les recommandations
│   │   ├── requirements.txt    # Dépendances Python (Flask, pandas, scikit-learn, joblib, pymongo)
│   │   ├── train_model.py      # Script d'entraînement du modèle de recommandation
│   │   └── trained_models/     # Modèles entraînés (.pkl)
│   ├── models/                 # Schémas de base de données Mongoose (User, Plat, Commande, etc.)
│   ├── routes/                 # Définitions des routes API (auth, admin, plat, etc.)
│   ├── seedDatabase.js         # Script d'insertion de données initiales dans MongoDB
│   ├── index.js                # Point d'entrée principal du serveur backend
│   └── env.exemple             # Fichier d'exemple pour les variables d'environnement backend
├── frontend/                   # Application côté client (Next.js, React)
│   ├── app/                    # Pages et logique de l'application Next.js (routage basé sur les répertoires)
│   ├── components/             # Composants React réutilisables (UI, spécifiques aux rôles)
│   ├── public/                 # Fichiers statiques (images, manifest.json)
│   ├── services/               # Fonctions pour appeler les API backend (clientPromotion, paymentService)
│   ├── store/                  # Gestion de l'état global avec Zustand (auth, cart, plats)
│   ├── hooks/                  # Hooks React personnalisés (usePlatPromotion)
│   ├── lib/                    # Utilitaires (utils.ts)
│   ├── exemple.env.txt         # Fichier d'exemple pour les variables d'environnement frontend
│   └── README.md               # README spécifique au frontend
├── README.md                   # Documentation principale du projet (ce fichier)
└── start-all.bat               # Script batch pour démarrer tous les services (backend, frontend, IA) sur Windows
```

## 🚀 Fonctionnalités

*   **Gestion des Utilisateurs et Rôles**: 
    *   🧑‍🍽️ **Client**: Inscription, connexion, gestion de profil, parcourir restaurants/plats, recherche, aimer/noter plats, passer commande, suivi de commande, notifications. 
    *   🧑‍🍳 **Restaurant**: Gestion de compte/restaurant, création/modification de plats/catégories, gestion des commandes, assignation de livreurs, notifications. 
    *   🚚 **Livreur**: Gestion de profil/disponibilité, voir livraisons assignées, mise à jour statuts livraison, estimation heure livraison, notifications. 
    *   👨‍💼 **Admin**: Gestion de tous les utilisateurs (suppression/blocage), statistiques générales, supervision des commandes. 
*   **Gestion des Menus**: Ajout, mise à jour et suppression faciles des éléments de menu (plats, catégories) par les restaurants.
*   **Traitement des Commandes**: Gestion efficace des commandes clients avec mises à jour en temps réel des statuts (en attente, préparation, prête, assignée, en route, arrivée, livrée).
*   **Authentification Sécurisée**: Utilisation de JWT et middlewares basés sur les rôles. 
*   **Système de Recommandation IA**: Recommandations de plats personnalisées (voir section dédiée). 
*   **Notifications**: Par email pour les statuts de commande et les nouvelles attributions de livraison. 
*   **Gestion des Promotions**: Création et application de promotions sur les plats, avec affichage des prix réduits.
*   **Paiement en Ligne**: Intégration de solutions de paiement (Konnect).
*   **Conception Responsive**: Optimisé pour divers appareils.

## 🧠 Intégration du Modèle d'IA (Système de Recommandation Hybride)

Le système de recommandation vise à fournir des suggestions de plats personnalisées aux utilisateurs. Il est implémenté via une API Flask située dans `backend/model_ia/api_reco_hybrid.py` et s'intègre au backend Node.js. 

Il utilise un modèle hybride basé sur : 
*   **Filtrage Collaboratif (Collaborative Filtering)**: Recommande des plats basés sur les préférences d'utilisateurs ayant des comportements similaires (achats, interactions). 
*   **Filtrage Basé sur le Contenu (Content-Based Filtering)**: Recommande des plats similaires à ceux que l'utilisateur a aimés par le passé, en se basant sur les attributs des plats (descriptions, tags, noms). 
*   **Feedback Utilisateur**: Intègre les likes, notes et commentaires pour affiner les recommandations. 

### Entraînement du Modèle

Le script d'entraînement `backend/model_ia/train_model.py` est responsable de : 
1.  **Chargement des Données**: Récupération des données depuis MongoDB (collections `commandes`, `plats`, `avis`). 
2.  **Prétraitement**: Nettoyage et transformation des données pour les rendre utilisables par les algorithmes.
3.  **Construction des Modèles**: Création de la matrice utilisateur-plat pour le filtrage collaboratif et vectorisation TF-IDF des descriptions de plats pour le filtrage basé sur le contenu.
4.  **Calcul des Similarités**: Calcul des similarités cosinus entre utilisateurs et entre plats. 
5.  **Pondération des Feedbacks**: Les feedbacks utilisateurs sont pondérés pour influencer les scores de recommandation (configurable, par exemple : notes moyennes 50%, likes 30%, commentaires 20%). 
6.  **Sauvegarde des Modèles**: Les modèles entraînés (matrices de similarité, données des plats, scores de feedback) sont sauvegardés sous forme de fichiers `.pkl` dans le dossier `backend/model_ia/trained_models/` à l'aide de `joblib`. 

### API de Recommandation

L'API Flask (`api_reco_hybrid.py`) expose un endpoint pour obtenir des recommandations : 
*   **Endpoint**: `GET /recommend/<userId>?weight=<poids>`
    *   `userId`: L'identifiant de l'utilisateur pour lequel générer les recommandations.
    *   `weight` (optionnel): Un poids pour ajuster l'influence relative des différents types de modèles (par défaut, une valeur équilibrée est utilisée).
*   **Réponse**: Un JSON contenant une liste de plats recommandés. 

## 🔧 Installation

Suivez ces étapes pour configurer et lancer le projet YumyFly sur votre machine locale.

### Prérequis
*   Node.js (version 16.x ou ultérieure recommandée)
*   npm (généralement inclus avec Node.js)
*   Python (version 3.8 ou ultérieure recommandée)
*   pip (généralement inclus avec Python)
*   MongoDB (instance locale ou cluster Atlas)

### Étapes d'Installation

1.  **Cloner le dépôt GitHub**:

    ```bash
    git clone https://github.com/aziz712/yumyfly.git
    cd yumyfly
    ```

2.  **Configurer le Backend (Node.js)**:
    *   Naviguez vers le dossier backend :
        ```bash
        cd backend
        ```
    *   Installez les dépendances npm :
        ```bash
        npm install
        ```
    *   Créez un fichier `.env` à la racine du dossier `backend/` en copiant `env.exemple`.
        ```bash
        # Exemple de contenu pour backend/.env
        PORT=3001
        MONGO_URI="votre_uri_mongodb_ici" # Ex: mongodb://localhost:27017/yumyfly ou URI Atlas
        JWT_SECRET="votre_secret_jwt_long_et_complexe"
        NODE_ENV="development"
        CLIENT_URL="http://localhost:3000"
        NODE_MAILER_EMAIL="votre_email_gmail_pour_nodemailer"
        ADMIN_EMAIL="votre_email_admin"
        NODE_MAILER_PASSWORD="votre_mot_de_passe_application_gmail"
        ```
        *   **Note pour `MONGO_URI`**: Remplacez par votre chaîne de connexion MongoDB.
        *   **Note pour `NODE_MAILER_EMAIL` et `NODE_MAILER_PASSWORD`**: Configurez un compte Gmail et générez un mot de passe d'application si vous utilisez l'authentification à deux facteurs.

3.  **Configurer le Frontend (Next.js)**:
    *   Naviguez vers le dossier frontend :
        ```bash
        cd ../frontend # Si vous êtes dans backend/, sinon ajustez le chemin
        # ou cd frontend depuis la racine du projet
        ```
    *   Installez les dépendances npm :
        ```bash
        npm install
        ```
    *   Créez un fichier `.env.local` à la racine du dossier `frontend/` en vous basant sur `exemple.env.txt` (s'il existe) ou en ajoutant les variables nécessaires.
        ```bash
        # Exemple de contenu pour frontend/.env.local
        NEXT_PUBLIC_API_URL=http://localhost:3001/api
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=votre_clé_publique_stripe # Si Stripe est utilisé
        # Ajoutez d'autres variables d'environnement nécessaires au frontend
        ```

4.  **Configurer le Modèle d'IA (Python/Flask)**:
    *   Naviguez vers le dossier du modèle d'IA :
        ```bash
        cd ../backend/model_ia # Si vous êtes dans frontend/, sinon ajustez le chemin
        # ou cd backend/model_ia depuis la racine du projet
        ```
    *   Il est recommandé de créer un environnement virtuel Python :
        ```bash
        python -m venv venv
        # Activer l'environnement virtuel
        # Sur Windows:
        venv\Scripts\activate
        # Sur macOS/Linux:
        # source venv/bin/activate
        ```
    *   Installez les dépendances Python :
        ```bash
        pip install -r requirements.txt
        ```
        Le fichier `requirements.txt` devrait contenir des paquets comme `Flask`, `pandas`, `numpy`, `scikit-learn`, `joblib`, `pymongo`.

## ▶️ Exécution

### Option 1: Utiliser le script `start-all.bat` (pour Windows)

Ce script démarre le backend, le frontend et l'API du modèle d'IA simultanément.

1.  Assurez-vous d'être à la racine du projet `yumyfly/`.
2.  Exécutez le script :
    ```bash
    start-all.bat
    ```
    Cela ouvrira trois nouvelles fenêtres de terminal, chacune exécutant un service.

### Option 2: Démarrer chaque service manuellement

Ouvrez trois terminaux distincts.

1.  **Démarrer le Backend (Node.js)**:
    *   Dans le premier terminal, naviguez vers `backend/`:
        ```bash
        cd backend
        npm run dev
        ```
    Le serveur backend devrait démarrer sur `http://localhost:3001` (ou le port configuré dans `backend/.env`).

2.  **Démarrer l'API du Modèle d'IA (Flask)**:
    *   Dans le deuxième terminal, naviguez vers `backend/model_ia/`:
        ```bash
        cd backend/model_ia
        # Activez l'environnement virtuel si vous en avez créé un
        # venv\Scripts\activate  (Windows)
        # source venv/bin/activate (macOS/Linux)
        python api_reco_hybrid.py
        ```
    L'API Flask devrait démarrer (généralement sur `http://localhost:5000` par défaut, vérifiez la sortie du terminal).

3.  **Démarrer le Frontend (Next.js)**:
    *   Dans le troisième terminal, naviguez vers `frontend/`:
        ```bash
        cd frontend
        npm run dev
        ```
    L'application frontend sera accessible à `http://localhost:3000`.

## 📊 Insertion de Données Initiales (Seeding)

Pour peupler votre base de données MongoDB avec des données initiales (utilisateurs, restaurants, plats, catégories, etc.), vous pouvez utiliser le script de seeding.

1.  Assurez-vous que votre serveur backend Node.js **n'est pas** en cours d'exécution (pour éviter les conflits potentiels, bien que cela puisse fonctionner dans certains cas).
2.  Assurez-vous que votre instance MongoDB est accessible et que `MONGO_URI` dans `backend/.env` est correctement configurée.
3.  Naviguez vers le dossier `backend/`:
    ```bash
    cd backend
    ```
4.  Exécutez le script de seed :
    ```bash
    npm run seed
    ```
    Ce script exécute `node seedDatabase.js`. Vérifiez la console pour les messages de succès ou d'erreur.



---

Pour plus d'informations, visitez le dépôt GitHub: [https://github.com/aziz712/yumyfly](https://github.com/aziz712/yumyfly) 

