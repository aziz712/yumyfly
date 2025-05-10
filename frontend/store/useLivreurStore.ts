import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { toast } from "sonner";
import api from "@/app/api/axios";
import type { AxiosError } from "axios";

// Define types for our store
interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  photoProfil?: string;
  role: string;
}

interface Restaurant {
  _id: string;
  nom: string;
  // Add other restaurant fields as needed
}

interface Livreur {
  _id: string;
  userId: string;
  disponibilite: boolean;
  restaurantId?: Restaurant;
  // Add other livreur fields as needed
}

interface LivreurProfile {
  user: User;
  livreur: Livreur;
}

interface Commande {
  _id: string;
  statut:
    | "en attente"
    | "acceptée"
    | "en préparation"
    | "en route"
    | "arrivée"
    | "livrée"
    | "annulée";
  livreur: string;
  DateArrivee?: Date;
  DateLivraison?: Date;
  // Add other commande fields as needed
}

interface LivreurStore {
  // State
  livreurProfile: LivreurProfile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  getProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  toggleDisponibilite: () => Promise<void>;
  updateCommandeStatus: (
    commandeId: string,
    statut: "en route" | "arrivée" | "livrée"
  ) => Promise<void>;
  clearError: () => void;
}

const useLivreurStore = create<LivreurStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        livreurProfile: null,
        isLoading: false,
        error: null,

        // Get livreur profile
        getProfile: async () => {
          try {
            set({ isLoading: true, error: null });
            const response = await api.get("/livreur/my-profile");
            set({
              livreurProfile: response.data,
              isLoading: false,
            });
          } catch (error) {
            const err = error as AxiosError;
            const errorMessage =
              (err.response?.data as { message?: string })?.message ||
              "Failed to fetch profile";
            set({
              error: errorMessage,
              isLoading: false,
            });
            toast.error(errorMessage);
          }
        },

        // Update livreur profile
        updateProfile: async (profileData) => {
          try {
            set({ isLoading: true, error: null });
            const response = await api.put(
              "/livreur/update-profile",
              profileData
            );

            // Update only the user part of the profile
            set((state) => ({
              livreurProfile: state.livreurProfile
                ? {
                    ...state.livreurProfile,
                    user: response.data.user,
                  }
                : null,
              isLoading: false,
            }));

            toast.success("Profil mis à jour avec succès");
          } catch (error) {
            const err = error as AxiosError;
            const errorMessage =
              (err.response?.data as { message?: string })?.message ||
              "Failed to update profile";
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        },

        // Change password
        changePassword: async (currentPassword, newPassword) => {
          try {
            set({ isLoading: true, error: null });
            await api.put("/auth/change-password", {
              currentPassword,
              newPassword,
            });
            set({ isLoading: false });
            toast.success("Mot de passe changé avec succès");
          } catch (error) {
            const err = error as AxiosError;
            const errorMessage =
              (err.response?.data as { message?: string })?.message ||
              "Failed to change password";
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        },

        // Toggle disponibilite
        toggleDisponibilite: async () => {
          try {
            set({ isLoading: true, error: null });
            const response = await api.put("/livreur/disponibilite");

            // Update the livreur part of the profile
            set((state) => ({
              livreurProfile: state.livreurProfile
                ? {
                    ...state.livreurProfile,
                    livreur: response.data.livreur,
                  }
                : null,
              isLoading: false,
            }));

            toast.success(
              `Disponibilité mise à jour: ${
                response.data.livreur.disponibilite
                  ? "Disponible"
                  : "Indisponible"
              }`
            );
          } catch (error) {
            const err = error as AxiosError;
            const errorMessage =
              (err.response?.data as { message?: string })?.message ||
              "Failed to update availability";
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        },

        // Update commande status
        updateCommandeStatus: async (commandeId, statut) => {
          try {
            set({ isLoading: true, error: null });
            const response = await api.put(
              `/livreur/commande/${commandeId}/status`,
              { statut }
            );
            set({ isLoading: false });
            toast.success(`Statut de la commande mis à jour: ${statut}`);
            return response.data.commande;
          } catch (error) {
            const err = error as AxiosError;
            const errorMessage =
              (err.response?.data as { message?: string })?.message ||
              "Failed to update order status";
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            throw error;
          }
        },

        // Clear error
        clearError: () => set({ error: null }),
      }),
      {
        name: "livreur-storage",
        partialize: (state) => ({ livreurProfile: state.livreurProfile }),
      }
    )
  )
);

export default useLivreurStore;
