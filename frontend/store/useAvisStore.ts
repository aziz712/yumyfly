import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { toast } from "sonner";
import api from "@/app/api/axios";
import type { AxiosError } from "axios";

// Define Avis interface
interface Avis {
  _id: string;
  client: any;
  restaurant?: any;
  livreur?: any;
  commande?: any;
  avisType: "restaurant" | "livreur";
  note: number;
  commentaire?: string;
  createdAt: string;
  updatedAt: string;
}

// Define Zustand Store State and Actions
interface AvisState {
  avis: Avis[]; // List of all avis
  loading: boolean; // Loading state for fetching data
  error: string | null; // Error message

  // Actions
  fetchAllAvis: () => Promise<void>;
  fetchAvisForRestaurant: (restaurantId: string) => Promise<void>;
  fetchAvisForLivreur: (livreurId: string) => Promise<void>;
  createAvis: (data: Partial<Avis>) => Promise<void>;
  updateAvis: (avisId: string, data: Partial<Avis>) => Promise<void>;
  deleteAvis: (avisId: string) => Promise<void>;
}

// Create the Zustand store
export const useAvisStore = create<AvisState>()(
  devtools(
    persist(
      (set, get) => ({
        avis: [],
        loading: false,
        error: null,

        // Fetch all avis on the platform
        fetchAllAvis: async () => {
          set({ loading: true, error: null });
          try {
            const response = await api.get("/avis");
            set({ avis: response.data.avis, loading: false });
          } catch (error) {
            const axiosError = error as AxiosError;
            set({ error: axiosError.message, loading: false });
            toast.error("Failed to fetch avis", {
              description: axiosError.message,
            });
          }
        },

        // Fetch avis for a specific restaurant
        fetchAvisForRestaurant: async (restaurantId: string) => {
          set({ loading: true, error: null });
          try {
            const response = await api.get(`/avis/restaurant/${restaurantId}`);
            set({ avis: response.data.avis, loading: false });
          } catch (error) {
            const axiosError = error as AxiosError;
            set({ error: axiosError.message, loading: false });
            toast.error("Failed to fetch avis for restaurant", {
              description: axiosError.message,
            });
          }
        },

        // Fetch avis for a specific livreur
        fetchAvisForLivreur: async (livreurId: string) => {
          set({ loading: true, error: null });
          try {
            const response = await api.get(`/avis/livreur/${livreurId}`);
            set({ avis: response.data.avis, loading: false });
          } catch (error) {
            const axiosError = error as AxiosError;
            set({ error: axiosError.message, loading: false });
            toast.error("Failed to fetch avis for livreur", {
              description: axiosError.message,
            });
          }
        },

        // Create a new avis
        createAvis: async (data: Partial<Avis>) => {
          set({ loading: true, error: null });
          try {
            const response = await api.post("/avis", data);
            set((state) => ({
              avis: [response.data.avis, ...state.avis],
              loading: false,
            }));
            toast.success("Avis created successfully");
          } catch (error) {
            const axiosError = error as AxiosError;
            set({ error: axiosError.message, loading: false });
            toast.error("Failed to create avis", {
              description: axiosError.message,
            });
          }
        },

        // Update an existing avis
        updateAvis: async (avisId: string, data: Partial<Avis>) => {
          set({ loading: true, error: null });
          try {
            const response = await api.put(`/avis/${avisId}`, data);

            toast.success("Avis updated successfully");
          } catch (error) {
            const axiosError = error as AxiosError;
            set({ error: axiosError.message, loading: false });
            toast.error("Failed to update avis", {
              description: axiosError.message,
            });
          }
        },

        // Delete an avis
        deleteAvis: async (avisId: string) => {
          set({ loading: true, error: null });
          try {
            await api.delete(`/avis/${avisId}`);
            set((state) => ({
              avis: state.avis.filter((avis) => avis._id !== avisId),
              loading: false,
            }));
            toast.success("Avis deleted successfully");
          } catch (error) {
            const axiosError = error as AxiosError;
            set({ error: axiosError.message, loading: false });
            toast.error("Failed to delete avis", {
              description: axiosError.message,
            });
          }
        },
      }),
      {
        name: "avis-storage", // Persisted storage key
      }
    ),
    {
      name: "AvisStore", // Devtools name
    }
  )
);
