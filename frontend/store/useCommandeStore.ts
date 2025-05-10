import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { toast } from "sonner";
import api from "@/app/api/axios";
import type { AxiosError } from "axios";

// Define types for our store
export interface Plat {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  image: string;
}

export interface Restaurant {
  _id: string;
  nom: string;
  adresse: string;
  image?: string;
}

export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

export interface CommandePlat {
  plat: string | Plat; // Can be either ID or populated object
  quantite: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Commande {
  _id: string;
  client: string | User;
  restaurant: string | Restaurant;
  livreur?: string | User;
  plats: CommandePlat[];
  address: string;
  coordinates: Coordinates;
  note?: string;
  statut:
    | "en attente"
    | "préparation"
    | "prête"
    | "assignée"
    | "en route"
    | "arrivée"
    | "livrée";
  estimationLivraison?: Number;
  payee: boolean;
  DateSortie?: Date;
  DateArrivee?: Date;
  DateLivraison?: Date;
  total: number;
  serviceFee: number;
  createdAt: string;
  updatedAt: string;
}

interface CommandeState {
  // State
  commandes: Commande[];
  currentCommande: Commande | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  passCommande: (payload: any) => Promise<Commande | null>;
  getAllMyCommandes: () => Promise<void>;
  changeCommandeStatus: (
    commandeId: string,
    statut: Commande["statut"]
  ) => Promise<void>;
  estimationLivraison: (
    commandeId: string,
    estimationDate: Number
  ) => Promise<void>;
  confirmPaid: (commandeId: string) => Promise<void>;
  getAllCommandes: () => Promise<void>;
  getAllRestaurantCommandes: () => Promise<void>;
  getAllAssignedCommandes: () => Promise<void>;
  assignCommande: (commandeId: string, livreurId: string) => Promise<void>;
  clearErrors: () => void;
  resetState: () => void;
}

export const useCommandeStore = create<CommandeState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        commandes: [],
        currentCommande: null,
        isLoading: false,
        error: null,

        // Pass Commande (Create a new order) (client)
        passCommande: async (payload) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.post("/commandes", payload);
            const newCommande = response.data.commande;

            set((state) => ({
              commandes: [newCommande, ...state.commandes],
              currentCommande: newCommande,
              isLoading: false,
            }));

            return newCommande;
          } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            const errorMessage =
              err.response?.data?.message ||
              "Erreur lors de la création de la commande";
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return null;
          }
        },

        // Get All My Commandes (client)
        getAllMyCommandes: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.get("/commandes/my-commandes");
            set({ commandes: response.data.commandes, isLoading: false });
          } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            const errorMessage =
              err.response?.data?.message ||
              "Erreur lors de la récupération de vos commandes";
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        },

        // Change Commande Status
        changeCommandeStatus: async (commandeId, statut) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.put("/commandes/status", {
              commandeId,
              statut,
            });
            const updatedCommande = response.data.commande;

            set((state) => ({
              commandes: state.commandes.map((c) =>
                c._id === commandeId ? updatedCommande : c
              ),
              isLoading: false,
            }));

            toast.success(`Statut de la commande mis à jour: ${statut}`);
          } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            const errorMessage =
              err.response?.data?.message ||
              "Erreur lors de la mise à jour du statut";
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        },

        // Estimate Livraison
        estimationLivraison: async (commandeId, estimationDate) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.put(
              `/commandes/${commandeId}/estimation`,
              {
                estimationLivraison: estimationDate,
                commandeId: commandeId,
              }
            );
            const updatedCommande = response.data.commande;

            set((state) => ({
              commandes: state.commandes.map((c) =>
                c._id === commandeId ? updatedCommande : c
              ),
              isLoading: false,
            }));

            toast.success("Estimation de livraison mise à jour");
          } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            const errorMessage =
              err.response?.data?.message ||
              "Erreur lors de la mise à jour de l'estimation";
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        },

        // Confirm Payment
        confirmPaid: async (commandeId) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.put(
              `/commandes/${commandeId}/confirm-paid`
            );
            const updatedCommande = response.data.commande;

            set((state) => ({
              commandes: state.commandes.map((c) =>
                c._id === commandeId ? updatedCommande : c
              ),
              isLoading: false,
            }));

            toast.success("Paiement confirmé avec succès");
          } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            const errorMessage =
              err.response?.data?.message ||
              "Erreur lors de la confirmation du paiement";
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        },

        // Get All Commandes (Admin)
        getAllCommandes: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.get("/commandes");
            set({ commandes: response.data.commandes, isLoading: false });
          } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            const errorMessage =
              err.response?.data?.message ||
              "Erreur lors de la récupération des commandes";
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        },

        // Get All Restaurant Commandes (restaurant owner)
        getAllRestaurantCommandes: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.get("/commandes/restaurant");
            set({ commandes: response.data.commandes, isLoading: false });
          } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            const errorMessage =
              err.response?.data?.message ||
              "Erreur lors de la récupération des commandes du restaurant";
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        },

        // Get All Assigned Commandes (Livreur)
        getAllAssignedCommandes: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.get("/commandes/assigned");
            set({ commandes: response.data.commandes, isLoading: false });
          } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            const errorMessage =
              err.response?.data?.message ||
              "Erreur lors de la récupération des commandes assignées";
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        },

        // Assign Commande to Livreur (restaurant owner)
        assignCommande: async (commandeId, livreurId) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.put(`/commandes/${commandeId}/assign`, {
              livreurId,
              commandeId,
            });
            const updatedCommande = response.data.commande;

            set((state) => ({
              commandes: state.commandes.map((c) =>
                c._id === commandeId ? updatedCommande : c
              ),
              isLoading: false,
            }));

            toast.success("Commande assignée au livreur avec succès");
          } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            const errorMessage =
              err.response?.data?.message ||
              "Erreur lors de l'assignation de la commande";
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        },

        // Clear errors
        clearErrors: () => set({ error: null }),

        // Reset state
        resetState: () =>
          set({ commandes: [], currentCommande: null, error: null }),
      }),
      {
        name: "commande-storage", // name for the persisted state
        partialize: (state) => ({
          commandes: state.commandes,
          currentCommande: state.currentCommande,
        }),
      }
    )
  )
);
