// seedDatabase.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load Models
const User = require("./models/User");
const Restaurant = require("./models/Restaurant");
const Categorie = require("./models/Categorie");
const Plat = require("./models/Plat");
const Livreur = require("./models/Livreur");
const Commande = require("./models/Commande");
const Avis = require("./models/Avis");

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/food-delivery")
  .then(() => console.log("MongoDB Connected for seeding..."))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

// Helper function to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Generate random phone number
const generatePhoneNumber = () => {
  return `0${Math.floor(Math.random() * 10)}${Math.floor(
    Math.random() * 10000000
  )
    .toString()
    .padStart(7, "0")}`;
};

// Random address generator
const generateAddress = () => {
  const streets = [
    "Rue de la Paix",
    "Avenue des Champs-Élysées",
    "Boulevard Saint-Michel",
    "Rue Saint-Honoré",
    "Avenue Montaigne",
  ];
  const cities = [
    "Paris",
    "Lyon",
    "Marseille",
    "Toulouse",
    "Nice",
    "Nantes",
    "Strasbourg",
  ];
  const streetNumber = Math.floor(Math.random() * 100) + 1;
  const street = streets[Math.floor(Math.random() * streets.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const zipCode = Math.floor(Math.random() * 90000) + 10000;

  return `${streetNumber} ${street}, ${zipCode} ${city}`;
};

// Generate a random time in HH:MM format
const generateTime = (startHour, endHour) => {
  const hour =
    Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
  const minute = Math.floor(Math.random() * 60);
  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
};

// Restaurant names
const restaurantNames = [
  "Le Bistrot Gourmand",
  "La Table d'Orient",
  "Pizza Napoli",
  "Sushi Master",
  "Burger House",
];

// Restaurant descriptions
const restaurantDescriptions = [
  "Un bistrot traditionnel français offrant une cuisine authentique et savoureuse.",
  "Restaurant asiatique proposant des saveurs exotiques et des plats traditionnels.",
  "Pizzeria italienne authentique avec des recettes traditionnelles napolitaines.",
  "Restaurant japonais spécialisé dans les sushis frais et les plats traditionnels.",
  "Restaurant de burgers artisanaux avec des recettes originales et des ingrédients de qualité.",
];

// Category ideas for each restaurant
const categoryIdeas = {
  "Le Bistrot Gourmand": [
    "Entrées",
    "Plats principaux",
    "Desserts",
    "Vins",
    "Formules",
  ],
  "La Table d'Orient": [
    "Entrées",
    "Plats wok",
    "Spécialités",
    "Desserts",
    "Boissons",
  ],
  "Pizza Napoli": [
    "Pizzas classiques",
    "Pizzas gourmet",
    "Pâtes",
    "Salades",
    "Desserts",
  ],
  "Sushi Master": ["Entrées", "Makis", "Sashimis", "Plateaux", "Desserts"],
  "Burger House": [
    "Burgers classiques",
    "Burgers signature",
    "Accompagnements",
    "Desserts",
    "Boissons",
  ],
};

// Food items for each category by restaurant
const foodItems = {
  "Le Bistrot Gourmand": {
    Entrées: [
      "Terrine de foie gras",
      "Soupe à l'oignon",
      "Salade niçoise",
      "Escargots de Bourgogne",
    ],
    "Plats principaux": [
      "Bœuf bourguignon",
      "Coq au vin",
      "Magret de canard",
      "Filet mignon",
    ],
    Desserts: [
      "Crème brûlée",
      "Tarte tatin",
      "Mousse au chocolat",
      "Profiteroles",
    ],
    Vins: [
      "Bordeaux rouge",
      "Bourgogne blanc",
      "Champagne",
      "Rosé de Provence",
    ],
    Formules: [
      "Menu déjeuner",
      "Menu du chef",
      "Menu découverte",
      "Menu dégustation",
    ],
  },
  "La Table d'Orient": {
    Entrées: [
      "Nems au poulet",
      "Salade de papaye",
      "Raviolis vapeur",
      "Rouleaux de printemps",
    ],
    "Plats wok": [
      "Poulet sauté aux légumes",
      "Bœuf à la citronnelle",
      "Crevettes au curry",
      "Tofu aux champignons",
    ],
    Spécialités: [
      "Canard laqué",
      "Porc caramélisé",
      "Poisson à la vapeur",
      "Riz frit impérial",
    ],
    Desserts: [
      "Perles de coco",
      "Fruits exotiques",
      "Gâteau de riz",
      "Banane au caramel",
    ],
    Boissons: ["Thé jasmin", "Bubble tea", "Jus de litchi", "Bière asiatique"],
  },
  "Pizza Napoli": {
    "Pizzas classiques": ["Margherita", "Reine", "Quatre fromages", "Diavola"],
    "Pizzas gourmet": [
      "Truffe et parmesan",
      "Fruits de mer",
      "Chèvre miel",
      "Bresaola roquette",
    ],
    Pâtes: ["Carbonara", "Bolognaise", "Pesto", "Fruits de mer"],
    Salades: ["César", "Italienne", "Caprese", "Roquette parmesan"],
    Desserts: ["Tiramisu", "Panna cotta", "Cannoli", "Glace italienne"],
  },
  "Sushi Master": {
    Entrées: ["Edamame", "Soupe miso", "Salade de wakame", "Gyoza"],
    Makis: ["California roll", "Maki saumon", "Maki thon", "Maki végétarien"],
    Sashimis: [
      "Sashimi saumon",
      "Sashimi thon",
      "Sashimi daurade",
      "Mix sashimi",
    ],
    Plateaux: [
      "Plateau découverte",
      "Plateau Sushi Master",
      "Plateau famille",
      "Plateau dégustation",
    ],
    Desserts: [
      "Mochi glacé",
      "Dorayaki",
      "Cheesecake yuzu",
      "Glace au thé vert",
    ],
  },
  "Burger House": {
    "Burgers classiques": [
      "Cheeseburger",
      "Bacon burger",
      "Double beef",
      "Veggie burger",
    ],
    "Burgers signature": [
      "Burger gourmet truffe",
      "Burger montagnard",
      "Burger tex-mex",
      "Burger fish",
    ],
    Accompagnements: [
      "Frites maison",
      "Onion rings",
      "Salade coleslaw",
      "Potatoes",
    ],
    Desserts: ["Brownie", "Milkshake", "Cookie", "Cheesecake"],
    Boissons: ["Soda", "Bière artisanale", "Limonade maison", "Smoothie"],
  },
};

// Seed Database function
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Categorie.deleteMany({});
    await Plat.deleteMany({});
    await Livreur.deleteMany({});
    await Commande.deleteMany({});
    await Avis.deleteMany({});

    console.log("Database cleared");

    // Create admin user
    const adminPassword = await hashPassword("admin123");
    const admin = await User.create({
      nom: "Admin",
      prenom: "Super",
      email: "admin@yopmail.com",
      motDePasse: adminPassword,
      telephone: generatePhoneNumber(),
      adresse: generateAddress(),
      photoProfil: "/uploads/default/image-1745185941100-552339141.jpg",
      role: "admin",
      statut: "active",
    });

    console.log("Admin user created");

    // Create client users
    const clientsData = [];
    for (let i = 1; i <= 2; i++) {
      const password = await hashPassword("client123");
      clientsData.push({
        nom: `Client${i}`,
        prenom: `User${i}`,
        email: `client${i}@yopmail.com`,
        motDePasse: password,
        telephone: generatePhoneNumber(),
        adresse: generateAddress(),
        photoProfil: `/uploads/default-client${i}.png`,
        role: "client",
        statut: "active",
      });
    }
    const clients = await User.insertMany(clientsData);
    console.log("Client users created");

    // Create restaurant users and their restaurants
    const restaurantsData = [];
    const restaurantUsersData = [];
    const categoriesData = [];
    const platsData = [];

    for (let i = 0; i < restaurantNames.length; i++) {
      // Create restaurant user
      const password = await hashPassword("restaurant123");
      const restaurantUserData = {
        nom: restaurantNames[i],
        prenom: "Owner",
        email: `restaurant${i + 1}@yopmail.com`,
        motDePasse: password,
        telephone: generatePhoneNumber(),
        adresse: generateAddress(),
        photoProfil: `/uploads/default/image-1745185941100-552339141.jpg`,
        role: "restaurant",
        statut: "active",
      };

      restaurantUsersData.push(restaurantUserData);
    }

    const restaurantUsers = await User.insertMany(restaurantUsersData);
    console.log("Restaurant users created");

    // Create restaurants and their categories and plates
    for (let i = 0; i < restaurantNames.length; i++) {
      const restaurantData = {
        proprietaire: restaurantUsers[i]._id,
        nom: restaurantNames[i],
        adresse: generateAddress(),
        telephone: generatePhoneNumber(),
        description: restaurantDescriptions[i],
        workingHours: {
          from: generateTime(8, 11),
          to: generateTime(20, 23),
        },
        images: [`/uploads/default/image-1745185941100-552339141.jpg`],
        plats: [], // Initialize empty plats array
      };

      const restaurant = await Restaurant.create(restaurantData);
      console.log(`Restaurant ${restaurant.nom} created`);

      // Create categories for this restaurant
      const categoriesForRestaurant = categoryIdeas[restaurantNames[i]];
      const createdCategories = [];
      const createdPlats = []; // Track all created plates

      for (const categoryName of categoriesForRestaurant) {
        const categoryData = {
          nom: categoryName,
          description: `Collection de ${categoryName.toLowerCase()} de ${
            restaurant.nom
          }`,
          image: `/uploads/default/image-1745185941100-552339141.jpg`,
          restaurant: restaurant._id,
        };

        const category = await Categorie.create(categoryData);
        createdCategories.push(category);
        console.log(`Category ${category.nom} created for ${restaurant.nom}`);

        // Create food items (plats) for this category
        const foodItemsForCategory =
          foodItems[restaurantNames[i]][categoryName];

        for (const itemName of foodItemsForCategory) {
          const price = Math.floor(Math.random() * 15) + 5; // Random price between 5 and 20
          const platData = {
            nom: itemName,
            description: `Délicieux ${itemName.toLowerCase()} préparé par notre chef`,
            prix: price,
            disponible: Math.random() > 0.1, // 90% chance of being available
            tags: [categoryName.toLowerCase(), "populaire", "maison"],
            images: [`/uploads/default/image-1745185941100-552339141.jpg`],
            ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
            categorie: category._id,
            restaurant: restaurant._id,
          };

          const plat = await Plat.create(platData);
          createdPlats.push(plat._id); // Add the plate ID to our array
          console.log(`Plat ${plat.nom} created for ${category.nom}`);
        }
      }

      // Update restaurant with categories AND plates
      restaurant.categories = createdCategories.map((cat) => cat._id);
      restaurant.plats = createdPlats; // Add all created plates to the restaurant
      await restaurant.save();
    }

    // Create livreur profiles
    for (let i = 0; i < livreurs.length; i++) {
      // Assign each livreur to a random restaurant
      const randomRestaurantIndex = Math.floor(
        Math.random() * restaurantUsers.length
      );

      const livreurData = {
        userId: livreurs[i]._id,
        restaurantId: restaurantUsers[randomRestaurantIndex]._id,
        disponibilite: true,
        rating: Math.random() * 2 + 3, // Random rating between 3 and 5
        completedDeliveries: Math.floor(Math.random() * 50), // Random number of completed deliveries
      };

      await Livreur.create(livreurData);
      console.log(
        `Livreur profile created for ${livreurs[i].prenom} ${livreurs[i].nom}`
      );
    }

    console.log("Database seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
