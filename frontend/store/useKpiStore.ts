import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import api from "@/app/api/axios";

// Types for Admin Dashboard KPI
interface AdminDashboardKpi {
  totalNumberOfRestaurants: number;
  totalNumberOfUsers: number;
  totalNumberOfCommandes: number;
  totalNumberOfLivreurs: number;
  totalRevenue: number;
  recentOrders: any[]; // You might want to define a more specific type
  commandesStatistics: {
    enAttente: number;
    livree: number;
    enRoute: number;
    assignee: number;
    preparation: number;
    prete: number;
  };
}

// Types for Restaurant Owner Dashboard KPI
interface RestaurantOwnerDashboardKpi {
  totalRevenue: number;
  totalCommandes: number;
  totalLivreurs: number;
  recentOrders: any[]; // You might want to define a more specific type
  mostCommandedPlats: {
    _id: any;
    plat: any; // You might want to define a more specific type
    totalQuantity: number;
  }[];
}

// Types for Client Dashboard KPI
interface ClientDashboardKpi {
  totalMoneySpentThisMonth: number;
  totalMoneySpent: number;
  mostCommandedPlat: any; // You might want to define a more specific type
  lastOrders: any[]; // You might want to define a more specific type
}

// Types for Restaurant Delivery Statistics
interface RestaurantDeliveryStatistics {
  monthlyRevenue: number;
  deliveredCommandes: number;
  enRouteCommandes: number;
  assignedCommandes: number;
  todaysRevenue: number;
}

// KPI Store State
interface KpiState {
  // Admin Dashboard
  adminDashboard: AdminDashboardKpi | null;
  isLoadingAdminDashboard: boolean;
  adminDashboardError: string | null;

  // Restaurant Owner Dashboard
  restaurantOwnerDashboard: RestaurantOwnerDashboardKpi | null;
  isLoadingRestaurantOwnerDashboard: boolean;
  restaurantOwnerDashboardError: string | null;

  // Client Dashboard
  clientDashboard: ClientDashboardKpi | null;
  isLoadingClientDashboard: boolean;
  clientDashboardError: string | null;

  // Restaurant Delivery Statistics
  restaurantDeliveryStats: RestaurantDeliveryStatistics | null;
  isLoadingRestaurantDeliveryStats: boolean;
  restaurantDeliveryStatsError: string | null;

  // Actions
  fetchAdminDashboardKpi: () => Promise<void>;
  fetchRestaurantOwnerDashboardKpi: () => Promise<void>;
  fetchClientDashboardKpi: () => Promise<void>;
  fetchRestaurantDeliveryStatistics: () => Promise<void>;

  // Reset state
  resetState: () => void;
}

export const useKpiStore = create<KpiState>()(
  devtools(
    (set) => ({
      // Admin Dashboard
      adminDashboard: null,
      isLoadingAdminDashboard: false,
      adminDashboardError: null,

      // Restaurant Owner Dashboard
      restaurantOwnerDashboard: null,
      isLoadingRestaurantOwnerDashboard: false,
      restaurantOwnerDashboardError: null,

      // Client Dashboard
      clientDashboard: null,
      isLoadingClientDashboard: false,
      clientDashboardError: null,

      // Restaurant Delivery Statistics
      restaurantDeliveryStats: null,
      isLoadingRestaurantDeliveryStats: false,
      restaurantDeliveryStatsError: null,

      // Fetch Admin Dashboard KPI
      fetchAdminDashboardKpi: async () => {
        try {
          set({ isLoadingAdminDashboard: true, adminDashboardError: null });

          const response = await api.get("/kpi/admin/dashboard");

          set({
            adminDashboard: response.data,
            isLoadingAdminDashboard: false,
          });
        } catch (error: any) {
          console.error("Error fetching admin dashboard KPI:", error);

          set({
            isLoadingAdminDashboard: false,
            adminDashboardError:
              error.response?.data?.message ||
              "Failed to fetch admin dashboard data",
          });

          toast.error(
            error.response?.data?.message ||
              "Failed to fetch admin dashboard data"
          );
        }
      },

      // Fetch Restaurant Owner Dashboard KPI
      fetchRestaurantOwnerDashboardKpi: async () => {
        try {
          set({
            isLoadingRestaurantOwnerDashboard: true,
            restaurantOwnerDashboardError: null,
          });

          const response = await api.get(`/kpi/restaurant/dashboard`);

          set({
            restaurantOwnerDashboard: response.data,
            isLoadingRestaurantOwnerDashboard: false,
          });
        } catch (error: any) {
          console.error(
            "Error fetching restaurant owner dashboard KPI:",
            error
          );

          set({
            isLoadingRestaurantOwnerDashboard: false,
            restaurantOwnerDashboardError:
              error.response?.data?.message ||
              "Failed to fetch restaurant dashboard data",
          });

          toast.error(
            error.response?.data?.message ||
              "Failed to fetch restaurant dashboard data"
          );
        }
      },

      // Fetch Client Dashboard KPI
      fetchClientDashboardKpi: async () => {
        try {
          set({ isLoadingClientDashboard: true, clientDashboardError: null });

          const response = await api.get("/kpi/client/dashboard");

          set({
            clientDashboard: response.data,
            isLoadingClientDashboard: false,
          });
        } catch (error: any) {
          console.error("Error fetching client dashboard KPI:", error);

          set({
            isLoadingClientDashboard: false,
            clientDashboardError:
              error.response?.data?.message ||
              "Failed to fetch client dashboard data",
          });

          toast.error(
            error.response?.data?.message ||
              "Failed to fetch client dashboard data"
          );
        }
      },

      // Fetch Restaurant Delivery Statistics
      fetchRestaurantDeliveryStatistics: async () => {
        try {
          set({
            isLoadingRestaurantDeliveryStats: true,
            restaurantDeliveryStatsError: null,
          });

          const response = await api.get(`/kpi/livreur/delivery-statistics`);
          console.log({ response });
          set({
            restaurantDeliveryStats: response.data,
            isLoadingRestaurantDeliveryStats: false,
          });
        } catch (error: any) {
          console.error(
            "Error fetching restaurant delivery statistics:",
            error
          );

          set({
            isLoadingRestaurantDeliveryStats: false,
            restaurantDeliveryStatsError:
              error.response?.data?.message ||
              "Failed to fetch delivery statistics",
          });

          toast.error(
            error.response?.data?.message ||
              "Failed to fetch delivery statistics"
          );
        }
      },

      // Reset state
      resetState: () => {
        set({
          adminDashboard: null,
          isLoadingAdminDashboard: false,
          adminDashboardError: null,

          restaurantOwnerDashboard: null,
          isLoadingRestaurantOwnerDashboard: false,
          restaurantOwnerDashboardError: null,

          clientDashboard: null,
          isLoadingClientDashboard: false,
          clientDashboardError: null,

          restaurantDeliveryStats: null,
          isLoadingRestaurantDeliveryStats: false,
          restaurantDeliveryStatsError: null,
        });
      },
    }),
    { name: "kpi-store" }
  )
);
