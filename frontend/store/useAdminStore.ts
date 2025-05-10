import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import api from "@/app/api/axios";
import type { AxiosError } from "axios";

// Define User interface based on the mongoose schema
interface User {
  _id: string;
  nom?: string;
  prenom?: string;
  email: string;
  telephone?: string;
  adresse?: string;
  photoProfil?: string;
  role: "client" | "restaurant" | "livreur" | "admin";
  disponibilite?: boolean;
  statut: "pending" | "active" | "blocked";
  createdAt: string;
  updatedAt: string;
}

// Define Admin Profile Update interface
interface AdminProfileUpdate {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  photoProfil?: string;
}

// Define Restaurant Owner Creation interface
interface RestaurantOwnerData {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone: string;
  adresse: string;
}

// Define Account Status Update interface
interface AccountStatusUpdate {
  userId: string;
  statut: "active" | "blocked";
}

// Define admin state interface
interface AdminState {
  adminProfile: User | null;
  users: User[];
  isLoading: boolean;
  error: string | null;
  user: User | null; // Add user property to the state
  // Admin Profile Actions
  getAdminProfile: () => Promise<User | null>;
  updateAdminProfile: (data: AdminProfileUpdate | FormData) => Promise<boolean>;

  // User Management Actions
  getAllUsers: () => Promise<User[]>;
  changeAccountStatus: (data: AccountStatusUpdate) => Promise<boolean>;
  createRestaurantOwner: (
    data: RestaurantOwnerData | FormData
  ) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  getUserById: (userId: string) => Promise<User | null>;

  // Utility Actions
  clearError: () => void;
}

const useAdminStore = create<AdminState>()(
  devtools((set, get) => ({
    adminProfile: null,
    users: [],
    isLoading: false,
    error: null,

    // Get Admin Profile
    getAdminProfile: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get("/admin/profile");
        const { admin } = response.data;

        set({
          adminProfile: admin,
          isLoading: false,
        });

        return admin;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message || "Failed to fetch admin profile";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return null;
      }
    },

    // Update Admin Profile
    updateAdminProfile: async (data: AdminProfileUpdate | FormData) => {
      set({ isLoading: true, error: null });
      try {
        // Check if data is FormData for multipart/form-data request (with image)
        const isFormData = data instanceof FormData;

        // Configure request headers based on data type
        const config = isFormData
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : undefined;

        const response = await api.put("/admin/profile", data, config);
        const { admin } = response.data;

        set({
          adminProfile: admin,
          isLoading: false,
        });

        toast.success("Profile updated successfully");
        return true;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          "Failed to update admin profile";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return false;
      }
    },

    // Get All Users
    getAllUsers: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get("/admin/users");
        const { users } = response.data;

        set({
          users,
          isLoading: false,
        });

        return users;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message || "Failed to fetch users";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return [];
      }
    },

    // Change Account Status
    changeAccountStatus: async (data: AccountStatusUpdate) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.put(`/admin/users/status`, {
          statut: data.statut,
          userId: data.userId,
        });
        const { user } = response.data;

        // Update the user in the users array
        const { users } = get();
        const updatedUsers = users.map((u) => (u._id === user._id ? user : u));

        set({
          users: updatedUsers,
          isLoading: false,
        });

        return true;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          "Failed to update account status";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return false;
      }
    },

    // Create Restaurant Owner
    createRestaurantOwner: async (data: RestaurantOwnerData | FormData) => {
      set({ isLoading: true, error: null });
      try {
        // Check if data is FormData for multipart/form-data request (with image)
        const isFormData = data instanceof FormData;

        // Configure request headers based on data type
        const config = isFormData
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : undefined;

        const response = await api.post(
          "/admin/restaurant-owner",
          data,
          config
        );
        const { restaurantOwner } = response.data;

        // Add the new restaurant owner to the users array
        const { users } = get();

        set({
          users: [...users, restaurantOwner],
          isLoading: false,
        });

        toast.success("Restaurant owner created successfully");
        return true;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          "Failed to create restaurant owner";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return false;
      }
    },

    // Delete User
    deleteUser: async (userId: string) => {
      set({ isLoading: true, error: null });
      try {
        await api.delete(`/admin/users/${userId}`);

        // Remove the deleted user from the users array
        const { users } = get();
        const updatedUsers = users.filter((user) => user._id !== userId);

        set({
          users: updatedUsers,
          isLoading: false,
        });

        toast.success("User deleted successfully");
        return true;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message || "Failed to delete user";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return false;
      }
    },
    //getUserById
    getUserById: async (userId: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get(`/admin/users/${userId}`);
        const { user } = response.data;

        set({
          isLoading: false,
          user,
        });

        return user;
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message || "Failed to fetch user";

        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return null;
      }
    },

    // Clear error
    clearError: () => set({ error: null }),
  }))
);

export default useAdminStore;
