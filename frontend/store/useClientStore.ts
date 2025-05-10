import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import api from "@/app/api/axios";
import type { AxiosError } from "axios";

// Define User interface
interface User {
  _id: string;
  nom?: string;
  prenom?: string;
  email: string;
  telephone?: string;
  adresse?: string;
  photoProfil?: string;
  role: "client" | "restaurant" | "livreur" | "admin";
  statut: "pending" | "active" | "blocked";
  createdAt: string;
  updatedAt: string;
}

// Define Avis (Review) interface
interface Avis {
  _id: string;
  client: string | User;
  restaurant?: string | Restaurant;
  livreur?: string | User;
  commande?: string | Commande;
  note: number;
  commentaire?: string;
  createdAt: string;
  updatedAt: string;
}

// Define Restaurant interface
interface Restaurant {
  _id: string;
  nom: string;
  description?: string;
  adresse?: string;
  telephone?: string;
  averageScore?: number;
  email?: string;
  logo?: string;
  images?: string[];
  workingHours?: {
    from: String; // Exemple: "08:00"
    to: String;
  };
  plats?: Plat[];
  categories?: any;
  horaires?: Record<string, { ouverture: string; fermeture: string }>;
  proprietaire: string | User;
  statut: "open" | "closed" | "temporarily_closed";
  createdAt: string;
  updatedAt: string;
}

// Define Categorie interface
interface Categorie {
  _id: string;
  nom: string;
  description?: string;
  image?: string;
  restaurant: string | Restaurant;
  createdAt: string;
  updatedAt: string;
}

// Define Comment interface
interface Comment {
  utilisateur: {
    _id: string;
    nom?: string;
    prenom?: string;
    photoProfil?: string;
  };
  texte: string;
  date: string;
}

// Define Plat interface
interface Plat {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  images: string[];
  videos?: string[];
  ingredients: string[];
  categorie?: Categorie | string;
  restaurant: string | Restaurant;
  disponible: boolean;
  likes: string[];
  commentaires: Comment[];
  comments?: Comment[]; // Add comments property to match the usage
  createdAt: string;
  updatedAt: string;
}

// Define Commande interface (simplified for now)
interface Commande {
  _id: string;
  client: string | User;
  restaurant: string | Restaurant;
  statut: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

// Define Profile Update interface
interface ClientProfileUpdate {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  photoProfil?: string;
}

// Define client state interface
interface ClientState {
  clientProfile: User | null;
  avis: Avis[];
  plats: Plat[];
  recommandedPlats: Plat[];
  plat: Plat | null;
  categories: Categorie[];
  restaurants: Restaurant[];
  restaurant: Restaurant | null;
  promotions: any[]; // Add promotions array
  isLoading: boolean;
  error: string | null;

  // Profile Actions
  getClientProfile: () => Promise<User | null>;
  updateClientProfile: (
    data: ClientProfileUpdate | FormData
  ) => Promise<boolean>;
  deleteClientAccount: () => Promise<boolean>;

  //getRestaurantById
  getRestaurantById: (restaurantId: string) => Promise<Restaurant | null>;

  // Plats (Dishes) Actions
  getAllDisponiblePlats: () => Promise<Plat[]>;
  getAllDisponiblePlatsOfCategorie: (categorieId: string) => Promise<Plat[]>;
  getAllDisponiblePlatsOfRestaurant: (restaurantId: string) => Promise<Plat[]>;

  getAllCategories: () => Promise<Categorie[]>;
  getAllRestaurants: () => Promise<Restaurant[]>;
  getPlatById: (platId: string) => Promise<Plat | null>;

  // Comment and Like Actions
  makeComment: (platId: string, comment: string) => Promise<Plat | null>;
  likePlat: (platId: string) => Promise<Plat | null>;
  getAllCommentsOnPlat: (platId: string) => Promise<Comment[] | null>;
  getRecommandedPlats: (userId: string) => Promise<Plat[]>;
  
  // Promotion Actions
  getAllActivePromotions: () => Promise<any[]>; // Add promotion function

  // Utility Actions
  clearError: () => void;
}

const useClientStore = create<ClientState>()(
  devtools((set, get) => ({
    clientProfile: null,
    avis: [],
    recommandedPlats: [],
    categories: [],
    plats: [],
    plat: null,
    restaurants: [],
    promotions: [], // Initialize promotions array
    isLoading: false,
    error: null,

    // Get Client Profile
    getClientProfile: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get("/client/my-profile");
        const { user } = response.data;

        set({
          clientProfile: user,
          isLoading: false,
        });

        return user;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          "Failed to fetch client profile";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return null;
      }
    },
    //get recommande plat of the client
    getRecommandedPlats: async (userId: string) => {
      set({ isLoading: true, error: null });
      try {
        console.log("getRecommandedPlats called");
        const response = await api.get(`/client/recommanded-plat/${userId}`);
        console.log({ response });
        const { recommended } = response.data;
        set({
          recommandedPlats: recommended,
          isLoading: false,
        });

        return recommended;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          "Failed to fetch recommanded plats";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return [];
      }
    },
    // Update Client Profile
    updateClientProfile: async (data: ClientProfileUpdate | FormData) => {
      set({ isLoading: true, error: null });
      try {
        // Check if data is FormData for multipart/form-data request (with image)
        const isFormData = data instanceof FormData;

        // Configure request headers based on data type
        const config = isFormData
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : undefined;

        const response = await api.put("/client/update-profile", data, config);
        const { user } = response.data;

        set({
          clientProfile: user,
          isLoading: false,
        });

        toast.success("Profile updated successfully");
        return true;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          "Failed to update client profile";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return false;
      }
    },

    // Delete Client Account
    deleteClientAccount: async () => {
      set({ isLoading: true, error: null });
      try {
        await api.delete("/client/delete-account");

        set({
          clientProfile: null,
          avis: [],
          plats: [],
          isLoading: false,
        });

        toast.success("Account deleted successfully");
        return true;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message || "Failed to delete account";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return false;
      }
    },
    //getRestaurantById
    getRestaurantById: async (restaurantId: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get(`/client/restaurants/${restaurantId}`);
        const { restaurant } = response.data;

        set({
          restaurant,
          isLoading: false,
        });

        return restaurant;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          "Failed to fetch restaurant details";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return null;
      }
    },

    // Get All Disponible Plats (Available Dishes)
    getAllDisponiblePlats: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get("/client/plats/disponible");
        const { plats } = response.data;

        set({
          plats,
          isLoading: false,
        });

        return plats;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          "Failed to fetch available dishes";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return [];
      }
    },

    // Get All Disponible Plats of Categorie (Available Dishes by Category)
    getAllDisponiblePlatsOfCategorie: async (categorieId: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get(
          `/client/plats/disponible/categories/${categorieId}`
        );
        const { plats } = response.data;

        set({
          plats,
          isLoading: false,
        });

        return plats;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          "Failed to fetch dishes by category";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return [];
      }
    },

    // Get All Disponible Plats of Restaurant (Available Dishes by Restaurant)
    getAllDisponiblePlatsOfRestaurant: async (restaurantId: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get(
          `/client/plats/disponible/restaurants/${restaurantId}`
        );
        const { plats } = response.data;

        set({
          plats,
          isLoading: false,
        });

        return plats;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          "Failed to fetch dishes by restaurant";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return [];
      }
    },

    //getAllCategories
    getAllCategories: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get("/client/plats/categories");
        const { categories } = response.data;

        set({
          categories,
          isLoading: false,
        });

        return categories;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message || "Failed to fetch categories";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return [];
      }
    },

    //getAllRestaurants
    getAllRestaurants: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get("/client/plats/restaurants");
        const { restaurants } = response.data;

        set({
          restaurants,
          isLoading: false,
        });

        return restaurants;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message || "Failed to fetch restaurants";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return [];
      }
    },

    //getPlatById
    getPlatById: async (platId: string) => {
      set({ isLoading: true, error: null });
      try {
        console.log("platId", platId);
        const response = await api.get(`/client/plats/${platId}`);
        const { plat } = response.data;

        set({
          plat,
          isLoading: false,
        });

        return plat;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message || "Failed to fetch plat";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return null;
      }
    },

    //makeComment
    makeComment: async (platId: string, comment: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.post(`/client/plats/${platId}/comment`, {
          comment,
          platId,
        });
        const { plat } = response.data;

        set({
          plat,
          isLoading: false,
        });

        toast.success("Comment added successfully");
        return plat;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message || "Failed to add comment";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return null;
      }
    },

    //likePlat
    likePlat: async (platId: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.put(`/client/plats/${platId}/like`);
        const { plat } = response.data;

        set({
          plat,
          isLoading: false,
        });

        toast.success("Dish liked successfully");
        return plat;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message || "Failed to like dish";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return null;
      }
    },

    //getAllCommentsOnPlat
    getAllCommentsOnPlat: async (platId: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get(`/client/plats/${platId}/comments`);
        const { comments } = response.data;

        set({
          plat: get().plat ? ({ ...get().plat, comments } as Plat) : null,
          isLoading: false,
        });

        return comments;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message || "Failed to fetch comments";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return null;
      }
    },

    // Get All Active Promotions
    getAllActivePromotions: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get("/client/promotions");
        const { promotions } = response.data;
        set({
          promotions,
          isLoading: false,
        });
        return promotions;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage = axiosError.response?.data?.message || "Failed to fetch promotions";
        set({ error: errorMessage, isLoading: false });
        return [];
      }
    },

    // Clear error
    clearError: () => set({ error: null }),
  }))
);

export default useClientStore;
export { useClientStore };
