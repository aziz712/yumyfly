import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { toast } from "sonner";
import api from "@/app/api/axios";
import type { AxiosError } from "axios";

// Define Plat interface based on the mongoose schema
interface Plat {
  promotion: any;
  _id: string;
  nom: string;
  description: string;
  prix: number;
  disponible: boolean;
  images: string[];
  videos: string[];
  ingredients: string[];
  categorie: string | Category;
  restaurant: string;
  likes: string[];
  commentaires: {
    utilisateur: string;
    texte: string;
    date: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Define Category interface
interface Category {
  _id: string;
  nom: string;
  description: string;
  image: string;
  restaurant: string;
}

// Define Plat Creation/Update interface
interface PlatData {
  nom: string;
  description: string;
  prix: number;
  ingredients: string[];
  categorie: string;
  images?: File[];
  videos?: File[];
}

// Define plats state interface
interface PlatsState {
  plats: Plat[];
  currentPlat: Plat | null;
  filteredPlats: Plat[];
  isLoading: boolean;
  error: string | null;

  // Plat Actions
  getAllPlats: () => Promise<Plat[]>;
  getPlatsByCategory: (categoryId: string) => Promise<Plat[]>;
  getPlatById: (platId: string) => Promise<Plat | null>;
  createPlat: (data: PlatData | FormData) => Promise<boolean>;
  updatePlat: (platId: string, data: PlatData | FormData) => Promise<boolean>;
  deletePlat: (platId: string) => Promise<boolean>;
  togglePlatStatus: (platId: string) => Promise<boolean>;

  // Filter Actions
  filterPlatsByName: (searchTerm: string) => void;
  filterPlatsByCategory: (categoryId: string) => void;
  resetFilters: () => void;

  // Utility Actions
  clearError: () => void;
  setCurrentPlat: (plat: Plat | null) => void;
}

const usePlatsStore = create<PlatsState>()(
  devtools(
    persist(
      (set, get) => ({
        plats: [],
        currentPlat: null,
        filteredPlats: [],
        isLoading: false,
        error: null,

        // Get All Plats
        getAllPlats: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.get("/plats");
            const { plats } = response.data;

            set({
              plats,
              filteredPlats: plats,
              isLoading: false,
            });
            return plats;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message || "Failed to fetch plats";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return [];
          }
        },

        // Get Plats by Category
        getPlatsByCategory: async (categoryId: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.get(`/plats/categories/${categoryId}`);
            const { plats } = response.data;

            set({
              filteredPlats: plats,
              isLoading: false,
            });
            return plats;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message ||
              "Failed to fetch plats by category";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return [];
          }
        },

        // Get Plat by ID
        getPlatById: async (platId: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.get(`/plats/${platId}`);
            const { plat } = response.data;

            set({
              currentPlat: plat,
              isLoading: false,
            });
            return plat;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message ||
              "Failed to fetch plat details";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return null;
          }
        },

        // Create Plat
        createPlat: async (data: PlatData | FormData) => {
          set({ isLoading: true, error: null });
          try {
            const isFormData = data instanceof FormData;
            const config = isFormData
              ? { headers: { "Content-Type": "multipart/form-data" } }
              : undefined;

            const response = await api.post("/plats", data, config);
            const { plat } = response.data;

            set({
              plats: [...get().plats, plat],
              filteredPlats: [...get().filteredPlats, plat],
              isLoading: false,
            });
            return true;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message || "Failed to create plat";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },

        // Update Plat
        updatePlat: async (platId: string, data: PlatData | FormData) => {
          set({ isLoading: true, error: null });
          try {
            const isFormData = data instanceof FormData;
            const config = isFormData
              ? { headers: { "Content-Type": "multipart/form-data" } }
              : undefined;

            const response = await api.put(`/plats/${platId}`, data, config);
            const { plat } = response.data;

            // Update plats and filteredPlats arrays
            const updatedPlats = get().plats.map((p) =>
              p._id === platId ? plat : p
            );
            const updatedFilteredPlats = get().filteredPlats.map((p) =>
              p._id === platId ? plat : p
            );

            set({
              plats: updatedPlats,
              filteredPlats: updatedFilteredPlats,
              currentPlat: plat,
              isLoading: false,
            });
            return true;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message || "Failed to update plat";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },

        // Delete Plat
        deletePlat: async (platId: string) => {
          set({ isLoading: true, error: null });
          try {
            await api.delete(`/plats/${platId}`);

            // Remove plat from plats and filteredPlats arrays
            const updatedPlats = get().plats.filter((p) => p._id !== platId);
            const updatedFilteredPlats = get().filteredPlats.filter(
              (p) => p._id !== platId
            );

            set({
              plats: updatedPlats,
              filteredPlats: updatedFilteredPlats,
              isLoading: false,
            });
            toast.success("Plat supprimé avec succès");
            return true;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message || "Failed to delete plat";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },

        // Toggle Plat Status (disponible)
        togglePlatStatus: async (platId: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.put(`/plats/${platId}/status`);
            const { plat } = response.data;

            // Update plats and filteredPlats arrays
            const updatedPlats = get().plats.map((p) =>
              p._id === platId ? plat : p
            );
            const updatedFilteredPlats = get().filteredPlats.map((p) =>
              p._id === platId ? plat : p
            );

            set({
              plats: updatedPlats,
              filteredPlats: updatedFilteredPlats,
              isLoading: false,
            });
            toast.success(
              `Plat ${
                plat.disponible ? "disponible" : "indisponible"
              } maintenant`
            );
            return true;
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
              axiosError.response?.data?.message ||
              "Failed to update plat status";

            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
          }
        },

        // Filter Plats by Name
        filterPlatsByName: (searchTerm: string) => {
          const term = searchTerm.toLowerCase();
          const filtered = get().plats.filter((plat) =>
            plat.nom.toLowerCase().includes(term)
          );
          set({ filteredPlats: filtered });
        },

        // Filter Plats by Category
        filterPlatsByCategory: (categoryId: string) => {
          if (categoryId === "all") {
            set({ filteredPlats: get().plats });
          } else {
            const filtered = get().plats.filter((plat) => {
              if (typeof plat.categorie === "string") {
                return plat.categorie === categoryId;
              } else {
                return plat.categorie._id === categoryId;
              }
            });
            set({ filteredPlats: filtered });
          }
        },

        // Reset Filters
        resetFilters: () => {
          set({ filteredPlats: get().plats });
        },

        // Set Current Plat
        setCurrentPlat: (plat: Plat | null) => {
          set({ currentPlat: plat });
        },

        // Clear error
        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: "plats-storage", // name of the item in localStorage
        partialize: (state) => ({
          plats: state.plats,
          currentPlat: state.currentPlat,
        }), // only persist these fields
      }
    )
  )
);

export default usePlatsStore;
