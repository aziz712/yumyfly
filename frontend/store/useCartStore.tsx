import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  images: string[];
  ingredients: string[];
  categorie: string;
  restaurant: any; // Can be string ID or object with restaurant details
  quantity: number;
}

export interface RestaurantGroup {
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
}

interface CartState {
  restaurantGroups: RestaurantGroup[];
  addItem: (item: CartItem) => void;
  removeItem: (restaurantId: string, itemId: string) => void;
  updateQuantity: (
    restaurantId: string,
    itemId: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  clearRestaurantItems: (restaurantId: string) => void;
  initializeCart: () => void;
  getRestaurantTotal: (restaurantId: string) => number;
  getServiceFee: () => number;
  getRestaurantGrandTotal: (restaurantId: string) => number;
  getTotalItemCount: () => number;
  getRestaurantItemCount: (restaurantId: string) => number;
  getAllRestaurants: () => RestaurantGroup[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantGroups: [],
      restaurantName: "",

      addItem: (item) => {
        const { restaurantGroups } = get();

        // Extract restaurant info
        const itemRestaurantId =
          typeof item.restaurant === "object"
            ? item.restaurant._id
            : item.restaurant;
        const itemRestaurantName =
          typeof item.restaurant === "object"
            ? item.restaurant.nom
            : "Restaurant";

        // Find if this restaurant already has a group
        const existingGroupIndex = restaurantGroups.findIndex(
          (group) => group.restaurantId === itemRestaurantId
        );

        if (existingGroupIndex >= 0) {
          // Restaurant group exists, check if item exists in this group
          const existingGroup = restaurantGroups[existingGroupIndex];
          const existingItemIndex = existingGroup.items.findIndex(
            (i) => i._id === item._id
          );

          if (existingItemIndex >= 0) {
            // Item exists, update quantity
            const updatedGroups = [...restaurantGroups];
            updatedGroups[existingGroupIndex].items[
              existingItemIndex
            ].quantity += 1;
            set({ restaurantGroups: updatedGroups });
          } else {
            // Item doesn't exist, add it to the group
            const updatedGroups = [...restaurantGroups];
            updatedGroups[existingGroupIndex].items.push({
              ...item,
              quantity: 1,
            });
            set({ restaurantGroups: updatedGroups });
          }
        } else {
          // Create a new restaurant group
          const newGroup: RestaurantGroup = {
            restaurantId: itemRestaurantId,
            restaurantName: itemRestaurantName,
            items: [{ ...item, quantity: 1 }],
          };
          set({ restaurantGroups: [...restaurantGroups, newGroup] });
        }
      },

      removeItem: (restaurantId, itemId) => {
        const { restaurantGroups } = get();

        // Find the restaurant group
        const groupIndex = restaurantGroups.findIndex(
          (group) => group.restaurantId === restaurantId
        );

        if (groupIndex >= 0) {
          const updatedGroups = [...restaurantGroups];
          // Remove the item from the group
          updatedGroups[groupIndex].items = updatedGroups[
            groupIndex
          ].items.filter((item) => item._id !== itemId);

          // If group is now empty, remove the group
          if (updatedGroups[groupIndex].items.length === 0) {
            updatedGroups.splice(groupIndex, 1);
          }

          set({ restaurantGroups: updatedGroups });
        }
      },

      updateQuantity: (restaurantId, itemId, quantity) => {
        const { restaurantGroups } = get();

        // Find the restaurant group
        const groupIndex = restaurantGroups.findIndex(
          (group) => group.restaurantId === restaurantId
        );

        if (groupIndex >= 0) {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            get().removeItem(restaurantId, itemId);
          } else {
            // Update quantity
            const updatedGroups = [...restaurantGroups];
            const itemIndex = updatedGroups[groupIndex].items.findIndex(
              (item) => item._id === itemId
            );

            if (itemIndex >= 0) {
              updatedGroups[groupIndex].items[itemIndex].quantity = quantity;
              set({ restaurantGroups: updatedGroups });
            }
          }
        }
      },

      clearCart: () => set({ restaurantGroups: [] }),

      clearRestaurantItems: (restaurantId) => {
        const { restaurantGroups } = get();
        const updatedGroups = restaurantGroups.filter(
          (group) => group.restaurantId !== restaurantId
        );
        set({ restaurantGroups: updatedGroups });
      },

      initializeCart: () => {
        // This function is called on app initialization
        // The persist middleware will automatically restore the state
      },

      getRestaurantTotal: (restaurantId) => {
        const { restaurantGroups } = get();
        const group = restaurantGroups.find(
          (group) => group.restaurantId === restaurantId
        );

        if (!group) return 0;

        return group.items.reduce(
          (total, item) => total + item.prix * item.quantity,
          0
        );
      },

      getServiceFee: () => {
        return 3.0; // Fixed service fee of 3.00DT per restaurant
      },

      getRestaurantGrandTotal: (restaurantId) => {
        const { getRestaurantTotal, getServiceFee } = get();
        return getRestaurantTotal(restaurantId) + getServiceFee();
      },

      getTotalItemCount: () => {
        const { restaurantGroups } = get();
        return restaurantGroups.reduce((count, group) => {
          return (
            count +
            group.items.reduce(
              (groupCount, item) => groupCount + item.quantity,
              0
            )
          );
        }, 0);
      },

      getRestaurantItemCount: (restaurantId) => {
        const { restaurantGroups } = get();
        const group = restaurantGroups.find(
          (group) => group.restaurantId === restaurantId
        );

        if (!group) return 0;

        return group.items.reduce((count, item) => count + item.quantity, 0);
      },

      getAllRestaurants: () => {
        return get().restaurantGroups;
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
