// This file provides a utility to reset all stores when a user logs out

import { useCartStore } from "./useCartStore";
import  { useClientStore }  from "./useClientStore";
import { useCommandeStore } from "./useCommandeStore";
import useLivreurStore from "./useLivreurStore";
import usePlatsStore from "./usePlatsStore";
import useRestaurantStore from "./useRestaurantStore";
import useAdminStore from "./useAdminStore";

/**
 * Resets all application stores to their initial state
 * Call this function when a user logs out to ensure no data persists
 */
export const resetAllStores = () => {
  // Reset cart store
  useCartStore.getState().clearCart();

  // Reset client store
  const clientStore = useClientStore.getState();
  clientStore.clearError();

  // Reset commande store
  useCommandeStore.getState().resetState();

  // Reset livreur store
  const livreurStore = useLivreurStore.getState();
  livreurStore.clearError();

  // Reset plats store
  const platsStore = usePlatsStore.getState();
  platsStore.clearError();
  platsStore.setCurrentPlat(null);

  // Reset restaurant store
  const restaurantStore = useRestaurantStore.getState();
  restaurantStore.clearError();

  // Reset admin store
  const adminStore = useAdminStore.getState();
  adminStore.clearError();

  // Force localStorage cleanup for persisted stores
  localStorage.removeItem("cart-storage");
  localStorage.removeItem("commande-storage");
  localStorage.removeItem("livreur-storage");
  localStorage.removeItem("plats-storage");
  localStorage.removeItem("restaurant-storage");
};

// 10. Update Store Reset Function

// Make sure to reset promotions when resetting the store
// In the resetAllStores function, add reset for promotions
// Reset restaurant store
const restaurantStore = useRestaurantStore.getState();
restaurantStore.clearError();
// Reset promotions if they exist in the store
if ('promotions' in restaurantStore) {
  restaurantStore.promotions = [];
}

// Reset client store
const clientStore = useClientStore.getState();
clientStore.clearError();
// Reset promotions if they exist in the store
if ('promotions' in clientStore) {
  clientStore.promotions = [];
}
// No changes needed here as the issue is likely elsewhere in the code.
// Ensure that the promotions are reset in the respective stores
