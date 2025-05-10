import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { toast } from "sonner";
import api from "@/app/api/axios";
import type { AxiosError } from "axios";
import * as promotionService from "@/services/promotionService";

// Define Restaurant interface based on the mongoose schema
interface Restaurant {
  _id: string;
  proprietaire: string;
  nom: string;
  adresse: string;
  telephone: string;
  description: string;
  workingHours: {
    from: string;
    to: string;
  };
  images: string[];
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

// Define Category interface based on the mongoose schema
interface Category {
  _id: string;
  nom: string;
  description: string;
  image: string;
  restaurant: string;
  createdAt: string;
  updatedAt: string;
}

// Define User interface
interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  photoProfil?: string;
  role: "client" | "restaurant" | "livreur" | "admin";
  statut: "pending" | "active" | "blocked";
  createdAt: string;
  updatedAt: string;
}

// Define Livreur interface
interface Livreur {
  _id: string;
  userId: User | string;
  restaurantId: string;
  disponibilite: boolean;
  rating: number;
  completedDeliveries: number;
  createdAt: string;
  updatedAt: string;
}

// Define Profile Update interface
interface ProfileUpdate {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  photoProfil?: string;
}

// Define Restaurant Creation/Update interface
interface RestaurantData {
  nom: string;
  adresse: string;
  telephone: string;
  description: string;
  workingHours: {
    from: string;
    to: string;
  };
  images?: string[];
}

// Define Category Creation/Update interface
interface CategoryData {
  nom: string;
  description: string;
  image?: string;
}

// Define Livreur Creation interface
interface LivreurData {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone: string;
  adresse: string;
}

// Define Promotion interface
interface Promotion {
  _id: string;
  plat: {
    _id: string;
    nom: string;
    image: string;
    prix: number;
  };
  pourcentage: number;
  prixApresReduction: number;
  dateDebut: string;
  dateFin: string;
  message?: string;
  isPromotionActive: boolean;
  joursRestants: string;
}

// Define Promotion Data interface
interface PromotionData {
  platId: string | string[];
  pourcentage: number;
  dateDebut: string;
  dateFin: string;
  message?: string;
}

// Define restaurant state interface
interface RestaurantState {
  ownerProfile: any | null; // User and associated restaurant data
  restaurant: Restaurant | null;
  categories: Category[];
  livreurs: Livreur[];
  promotions: Promotion[];
  isLoading: boolean;
  error: string | null;

  // Owner Profile Actions
  getOwnerProfile: () => Promise<any | null>;
  updateOwnerProfile: (data: ProfileUpdate | FormData) => Promise<boolean>;
  updateOwnerPassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<boolean>;

  // Restaurant Actions
  checkRestaurantDataCompleted: () => Promise<boolean>;
  completeRestaurantInformation: (
    data: RestaurantData | FormData
  ) => Promise<boolean>;
  updateRestaurantInformation: (
    data: RestaurantData | FormData
  ) => Promise<boolean>;

  // Category Actions
  getAllCategories: () => Promise<Category[]>;
  createCategory: (data: CategoryData | FormData) => Promise<boolean>;
  updateCategory: (
    categoryId: string,
    data: CategoryData | FormData
  ) => Promise<boolean>;
  deleteCategory: (categoryId: string) => Promise<boolean>;

  // Livreur Actions
  createDelivery: (data: LivreurData) => Promise<boolean>;
  getAllDeliveries: () => Promise<Livreur[]>;
  changeDeliveryStatus: (
    livreurId: string,
    statut: "active" | "blocked"
  ) => Promise<boolean>;
  deleteDelivery: (livreurId: string) => Promise<boolean>;

  // Promotion Actions
  getAllPromotions: () => Promise<Promotion[]>;
  applyPromotion: (data: PromotionData) => Promise<boolean>;
  removePromotion: (platId: string) => Promise<boolean>;
  updatePromotion: (platId: string, data: PromotionData) => Promise<boolean>;
  getPromotionsForPlats: (platIds: string[]) => Promise<Promotion[]>;

  // Utility Actions
  clearError: () => void;
}

const useRestaurantStore = create<RestaurantState>()(
  devtools(
    persist(
      (set, get) => ({
        ownerProfile: null,
        restaurant: null,
        categories: [],
        livreurs: [],
        promotions: [],
        isLoading: false,
        error: null,

        // Get My Owner Profile
        getOwnerProfile: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.get("/restaurant/my-profile");
            const { user, restaurant } = response.data;

            set({
              ownerProfile: { user, restaurant },
              isLoading: false,
            });

            return { user, restaurant };
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message ||
              "Failed to fetch owner profile";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return null;
          }
        },

        // Update My Profile
        updateOwnerProfile: async (data: ProfileUpdate | FormData) => {
          set({ isLoading: true, error: null });
          try {
            const isFormData = data instanceof FormData;
            const config = isFormData
              ? { headers: { "Content-Type": "multipart/form-data" } }
              : undefined;

            const response = await api.put(
              "/restaurant/update-profile",
              data,
              config
            );
            const { user } = response.data;

            set({
              ownerProfile: { ...get().ownerProfile, user },
              isLoading: false,
            });

            toast.success("Profile updated successfully");
            return true;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message || "Failed to update profile";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },

        // Update My Password
        updateOwnerPassword: async (
          oldPassword: string,
          newPassword: string
        ) => {
          set({ isLoading: true, error: null });
          try {
            await api.put("/restaurant/update-password", {
              oldPassword,
              newPassword,
            });

            toast.success("Password updated successfully");
            return true;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message || "Failed to update password";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },

        // Check if Restaurant Data is Completed
        checkRestaurantDataCompleted: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.get("/restaurant/check-restaurant");
            const { completed, restaurant } = response.data;

            if (completed) {
              set({ restaurant });
            }

            return completed;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message ||
              "Failed to check restaurant data";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },

        // Complete Restaurant Information
        completeRestaurantInformation: async (
          data: RestaurantData | FormData
        ) => {
          set({ isLoading: true, error: null });
          try {
            const isFormData = data instanceof FormData;
            const config = isFormData
              ? { headers: { "Content-Type": "multipart/form-data" } }
              : undefined;

            const response = await api.post(
              "/restaurant/complete-restaurant",
              data,
              config
            );
            const { restaurant } = response.data;

            set({ restaurant, isLoading: false });
            return true;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message ||
              "Failed to create restaurant";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },

        // Update Restaurant Information
        updateRestaurantInformation: async (
          data: RestaurantData | FormData
        ) => {
          set({ isLoading: true, error: null });
          try {
            const isFormData = data instanceof FormData;
            const config = isFormData
              ? { headers: { "Content-Type": "multipart/form-data" } }
              : undefined;

            const response = await api.put(
              "/restaurant/update-restaurant",
              data,
              config
            );
            const { restaurant } = response.data;

            set({ restaurant, isLoading: false });
            return true;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message ||
              "Failed to update restaurant";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },

        // Get All Categories
        getAllCategories: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.get("/restaurant/categories");
            const { categories } = response.data;

            set({ categories, isLoading: false });
            return categories;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message ||
              "Failed to fetch categories";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return [];
          }
        },

        // Create Category
        createCategory: async (data: CategoryData | FormData) => {
          set({ isLoading: true, error: null });
          try {
            const isFormData = data instanceof FormData;
            const config = isFormData
              ? { headers: { "Content-Type": "multipart/form-data" } }
              : undefined;

            const response = await api.post(
              "/restaurant/categories",
              data,
              config
            );
            const { category } = response.data;

            set({
              categories: [...get().categories, category],
              isLoading: false,
            });
            return true;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message || "Failed to create category";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },

        // Update Category
        updateCategory: async (
          categoryId: string,
          data: CategoryData | FormData
        ) => {
          set({ isLoading: true, error: null });
          try {
            const isFormData = data instanceof FormData;
            const config = isFormData
              ? { headers: { "Content-Type": "multipart/form-data" } }
              : undefined;

            const response = await api.put(
              `/restaurant/categories/${categoryId}`,
              data,
              config
            );
            const { category } = response.data;

            const updatedCategories = get().categories.map((cat) =>
              cat._id === categoryId ? category : cat
            );

            set({ categories: updatedCategories, isLoading: false });
            return true;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message || "Failed to update category";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },

        // Delete Category
        deleteCategory: async (categoryId: string) => {
          set({ isLoading: true, error: null });
          try {
            await api.delete(`/restaurant/categories/${categoryId}`);

            const updatedCategories = get().categories.filter(
              (cat) => cat._id !== categoryId
            );

            set({ categories: updatedCategories, isLoading: false });
            return true;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message || "Failed to delete category";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },

        // Create Delivery Person
        createDelivery: async (data: LivreurData) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.post("/restaurant/deliveries", data);
            const { livreur } = response.data;

            set({
              livreurs: [...get().livreurs, livreur],
              isLoading: false,
            });
            return true;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message ||
              "Failed to create delivery person";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },

        // Get All Deliveries
        getAllDeliveries: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.get("/restaurant/deliveries");
            const { livreurs } = response.data;

            set({ livreurs, isLoading: false });
            return livreurs;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message ||
              "Failed to fetch delivery persons";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return [];
          }
        },

        // Change Delivery Status
        changeDeliveryStatus: async (
          livreurId: string,
          statut: "active" | "blocked"
        ) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.put(
              `/restaurant/deliveries/${livreurId}/status`,
              {
                livreurId,
                statut,
              }
            );
            const { livreur } = response.data;

            const updatedLivreurs = get().livreurs.map((l) =>
              l._id === livreurId ? livreur : l
            );

            set({ livreurs: updatedLivreurs, isLoading: false });
            toast.success(
              `Delivery person ${statut === "active" ? "activated" : "blocked"
              } successfully`
            );
            return true;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message ||
              "Failed to update delivery person status";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },

        // Delete Delivery
        deleteDelivery: async (livreurId: string) => {
          set({ isLoading: true, error: null });
          try {
            await api.delete(`/restaurant/deliveries/${livreurId}`);

            const updatedLivreurs = get().livreurs.filter(
              (l) => l._id !== livreurId
            );

            set({ livreurs: updatedLivreurs, isLoading: false });
            toast.success("Delivery person deleted successfully");
            return true;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message ||
              "Failed to delete delivery person";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },
        // Fix the getAllPromotions function
        getAllPromotions: async () => {
          set({ isLoading: true, error: null });
          try {
            const { restaurant, ownerProfile } = get();
            let restaurantId = restaurant?._id;

            if (!restaurantId && ownerProfile?.restaurant?._id) {
              restaurantId = ownerProfile.restaurant._id;
            }

            if (!restaurantId) {
              throw new Error("Restaurant ID not found");
            }

            console.log(`Fetching promotions for restaurant: ${restaurantId}`);
            const response = await api.get(`/promotion/restaurant/${restaurantId}`);
            console.log("Promotions response:", response.data);

            const promotionsData = Array.isArray(response.data) ? response.data : [];
            set({ promotions: promotionsData, isLoading: false });

            return promotionsData;
          } catch (error) {
            console.error("Error fetching promotions:", error);
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || "Failed to fetch promotions";
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return [];
          }
        },

        // Remove the duplicate fetchPromotions function and replace with a comment
        // fetchPromotions function has been merged with getAllPromotions for consistency

        // Add this to the RestaurantState interface
        togglePromotionStatus: (platId: string, isActive: boolean) => Promise<boolean>,

        // Apply Promotion
        applyPromotion: async (data: PromotionData) => {
          set({ isLoading: true, error: null });
          try {
            // Ensure we have a restaurant ID
            const { restaurant, ownerProfile } = get();
            let restaurantId = restaurant?._id;

            // If restaurant ID is not available in the restaurant object, try to get it from ownerProfile
            if (!restaurantId && ownerProfile?.restaurant?._id) {
              restaurantId = ownerProfile.restaurant._id;
            }

            if (!restaurantId) {
              throw new Error("Restaurant ID not found");
            }

            // Add restaurant ID to the data if not already present
            const promotionData = {
              ...data,
              restaurantId: restaurantId
            };

            const response = await api.post('/promotion/apply-promotion', promotionData);
            console.log("Apply promotion response:", response.data);

            // Refresh promotions list
            await get().getAllPromotions();

            set({ isLoading: false });
            toast.success("Promotion appliquée avec succès");
            return true;
          } catch (error) {
            console.error("Error applying promotion:", error);
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || "Échec de l'application de la promotion";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },

        // Remove Promotion
        removePromotion: async (platId: string) => {
          set({ isLoading: true, error: null });
          try {
            console.log(`Removing promotion for plat: ${platId}`);
            const response = await api.delete(`/promotion/remove/${platId}`);
            console.log("Remove promotion response:", response.data);

            // Refresh promotions list
            await get().getAllPromotions();

            set({ isLoading: false });
            toast.success("Promotion supprimée avec succès");
            return true;
          } catch (error) {
            console.error("Error removing promotion:", error);
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || "Échec de la suppression de la promotion";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },

        // Update Promotion
        updatePromotion: async (platId: string, data: PromotionData) => {
          set({ isLoading: true, error: null });
          try {
            // Ensure we have a restaurant ID
            const { restaurant, ownerProfile } = get();
            let restaurantId = restaurant?._id;

            // If restaurant ID is not available in the restaurant object, try to get it from ownerProfile
            if (!restaurantId && ownerProfile?.restaurant?._id) {
              restaurantId = ownerProfile.restaurant._id;
            }

            if (!restaurantId) {
              throw new Error("Restaurant ID not found");
            }

            // Add restaurant ID to the data if not already present
            const promotionData = {
              ...data,
              restaurantId: restaurantId
            };

            console.log(`Updating promotion for plat: ${platId}`);

            // First remove the existing promotion
            await api.delete(`/promotion/remove/${platId}`);

            // Then apply a new one
            const response = await api.post('/promotion/apply-promotion', promotionData);
            console.log("Update promotion response:", response.data);

            // Refresh promotions list
            await get().getAllPromotions();

            set({ isLoading: false });
            toast.success("Promotion mise à jour avec succès");
            return true;
          } catch (error) {
            console.error("Error updating promotion:", error);
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || "Échec de la mise à jour de la promotion";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },

        // Get Promotions for Plats
        getPromotionsForPlats: async (platIds: string[]) => {
          set({ isLoading: true, error: null });
          try {
            console.log("Fetching promotions for plats:", platIds);

            const response = await api.post("/promotion/plats", { platIds });
            const promotions = response.data;

            console.log("Fetched promotions:", promotions);

            set({ promotions, isLoading: false });
            return promotions;
          } catch (error) {
            console.error("Error fetching promotions for plats:", error);
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message || "Failed to fetch promotions";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return [];
          }
        },
        

        // Clear error
        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: "restaurant-storage", // name of the item in localStorage
        partialize: (state) => ({
          ownerProfile: state.ownerProfile,
          restaurant: state.restaurant,
          categories: state.categories,
          livreurs: state.livreurs,
          promotions: state.promotions, // Add promotions to persisted state
        }), // only persist these fields
      }
    )
  )
);

export default useRestaurantStore;


