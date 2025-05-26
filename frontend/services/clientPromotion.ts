import useClientStore from "@/store/useClientStore";
import { useCartStore } from "@/store/useCartStore";
import { useCommandeStore } from "@/store/useCommandeStore";
import { toast } from "sonner";
import api from "@/app/api/axios";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Define interfaces
export interface Promotion {
  _id: string;
  pourcentage: number;
  dateDebut: string;
  dateFin: string;
  message?: string;
  isPromotionActive: boolean;
  plat: {
    _id: string;
    nom: string;
    prix: number;
    image?: string;
    description?: string;
  };
  joursRestants?: string;
  prixApresReduction?: number;
}

export interface Plat {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  images: string[];
  videos?: string[];
  ingredients: string[];
  categorie?: any;
  restaurant: any;
  disponible: boolean;
  likes: string[];
  commentaires: any[];
  createdAt: string;
  updatedAt: string;
  promotion?: {
    pourcentage: number;
    prixApresReduction: number;
    dateDebut: string;
    dateFin: string;
    isPromotionActive: boolean;
  };
}

// Helper function to check if a promotion is active
export const isPromotionActive = (dateDebut: string, dateFin: string): boolean => {
  const now = new Date();
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  return now >= debut && now <= fin;
};

// Helper function to calculate the promotional price
export const calculatePromotionalPrice = (plat: Plat): number => {
  if (plat.promotion && plat.promotion.isPromotionActive) {
    return plat.promotion.prixApresReduction;
  }
  return plat.prix;
};

// Helper function to calculate the promotional price from a promotion object
export const calculatePriceFromPromotion = (originalPrice: number, pourcentage: number): number => {
  return Number((originalPrice * (1 - pourcentage / 100)).toFixed(2));
};

// Get all active promotions
export const getAllActivePromotions = async (): Promise<Promotion[]> => {
  try {
    const { getAllActivePromotions } = useClientStore.getState();
    const promotions = await getAllActivePromotions();

    // Add calculated fields
    return promotions.map(promo => ({
      ...promo,
      prixApresReduction: calculatePriceFromPromotion(promo.plat.prix, promo.pourcentage),
      joursRestants: getTimeRemaining(promo.dateFin)
    }));
  } catch (error) {
    console.error("Error fetching active promotions:", error);
    toast.error("Impossible de charger les promotions actives");
    return [];
  }
};

// Get all promotions (active and inactive)
export const getAllPromotions = async (): Promise<Promotion[]> => {
  try {
    // Fixed: Using api.get instead of recursive call
    const response = await api.get('/client/promotions');
    const { promotions } = response.data;

    // Add calculated fields
    return promotions.map((promo: Promotion) => ({
      ...promo,
      prixApresReduction: calculatePriceFromPromotion(promo.plat.prix, promo.pourcentage),
      joursRestants: getTimeRemaining(promo.dateFin)
    }));
  } catch (error) {
    console.error("Error fetching all promotions:", error);
    toast.error("Impossible de charger les promotions");
    return [];
  }
};

// Get promotions for a specific plat
export const getPromotionForPlat = async (platId: string): Promise<Promotion | null> => {
  try {
    const response = await api.get(`/promotion/plat/${platId}`);
    const { promotion } = response.data;

    if (!promotion) return null;

    return {
      ...promotion,
      prixApresReduction: calculatePriceFromPromotion(promotion.plat.prix, promotion.pourcentage),
      joursRestants: getTimeRemaining(promotion.dateFin)
    };
  } catch (error) {
    console.error(`Error fetching promotion for plat ${platId}:`, error);
    return null;
  }
};

// Get plat details with promotion applied
export const getPlatWithPromotion = async (platId: string): Promise<Plat | null> => {
  try {
    const { getPlatById } = useClientStore.getState();
    const plat = await getPlatById(platId);

    if (!plat) return null;

    // Try to get promotion for this plat
    const promotion = await getPromotionForPlat(platId);

    // If there's an active promotion, add it to the plat object
    if (promotion && promotion.isPromotionActive) {
      return {
        ...plat,
        promotion: {
          pourcentage: promotion.pourcentage,
          prixApresReduction: promotion.prixApresReduction || 0,
          dateDebut: promotion.dateDebut,
          dateFin: promotion.dateFin,
          isPromotionActive: promotion.isPromotionActive
        }
      };
    }

    return plat;
  } catch (error) {
    console.error(`Error fetching plat with promotion ${platId}:`, error);
    toast.error("Impossible de charger les détails du plat");
    return null;
  }
};

// Add to cart with promotion price
export const addToCartWithPromotion = async (platId: string, quantity: number = 1): Promise<boolean> => {
  try {
    // Get the plat with promotion info
    const plat = await getPlatWithPromotion(platId);

    if (!plat) {
      toast.error("Plat introuvable");
      return false;
    }

    // Fixed: Using addItem from useCartStore
    const { addItem } = useCartStore.getState();

    // Create a cart item with the promotional price if available
    const cartItem = {
      _id: plat._id,
      nom: plat.nom,
      description: plat.description,
      prix: plat.promotion?.isPromotionActive ? plat.promotion.prixApresReduction : plat.prix,
      images: plat.images,
      ingredients: plat.ingredients,
      categorie: plat.categorie || "",
      restaurant: plat.restaurant,
      quantity: quantity
    };

    // Add the item to cart
    addItem(cartItem);

    toast.success(`${plat.nom} ajouté au panier`, {
      description: "Vous pouvez modifier la quantité dans le panier",
      action: {
        label: "Voir le panier",
        onClick: () => {
          window.location.href = "/client/cart";
        },
      },
    });

    return true;
  } catch (error) {
    console.error("Error adding item to cart with promotion:", error);
    toast.error("Impossible d'ajouter au panier");
    return false;
  }
};

// Pass commande with promotion prices
export const passCommandeWithPromotions = async (
  restaurantId: string,
  adresseLivraison: string,
  methodePaiement: string
): Promise<any> => {
  try {
    // Fixed: Using passCommande from the useCommandeStore instead of useClientStore
    const commandeStore = await import('@/store/useCommandeStore');
    const { passCommande } = commandeStore.useCommandeStore.getState();

    // Create the payload for the commande
    const payload = {
      restaurant: restaurantId,
      address: adresseLivraison,
      methodePaiement: methodePaiement
    };

    // This will use the promotion prices from the cart
    const result = await passCommande(payload);

    if (result) {
      toast.success("Commande passée avec succès");
    }

    return result;
  } catch (error) {
    console.error("Error passing commande with promotions:", error);
    toast.error("Erreur lors de la passation de la commande");
    return null;
  }
};

// Calculate time remaining for promotion
export const getTimeRemaining = (endDate: string): string => {
  return formatDistanceToNow(new Date(endDate), {
    addSuffix: true,
    locale: fr
  });
};

// Format promotion badge text
export const getPromotionBadgeText = (pourcentage: number): string => {
  return `-${pourcentage}%`;
};

// Get promotion message or default
export const getPromotionMessage = (promotion: Promotion): string => {
  return promotion.message || `Profitez de ${promotion.pourcentage}% de réduction!`;
};

// Added: Get promotional price for cart items
export const getPromotionalPriceForCart = (platId: string, originalPrice: number): Promise<number> => {
  return new Promise(async (resolve) => {
    try {
      const promotion = await getPromotionForPlat(platId);
      if (promotion && promotion.isPromotionActive) {
        resolve(promotion.prixApresReduction || calculatePriceFromPromotion(originalPrice, promotion.pourcentage));
      } else {
        resolve(originalPrice);
      }
    } catch (error) {
      console.error("Error getting promotional price for cart:", error);
      resolve(originalPrice);
    }
  });
};

// Added: Apply promotions to cart items
export const applyPromotionsToCart = async (cartItems: any[]): Promise<any[]> => {
  try {
    const itemsWithPromotions = await Promise.all(
      cartItems.map(async (item) => {
        const promotion = await getPromotionForPlat(item.plat._id);
        if (promotion && promotion.isPromotionActive) {
          const promotionalPrice = promotion.prixApresReduction ||
            calculatePriceFromPromotion(item.plat.prix, promotion.pourcentage);

          return {
            ...item,
            originalPrice: item.plat.prix,
            promotionalPrice,
            totalPrice: promotionalPrice * item.quantity,
            promotion: {
              _id: promotion._id,
              pourcentage: promotion.pourcentage
            }
          };
        }
        return {
          ...item,
          totalPrice: item.plat.prix * item.quantity
        };
      })
    );

    return itemsWithPromotions;
  } catch (error) {
    console.error("Error applying promotions to cart:", error);
    return cartItems;
  }
};

// Added: Calculate cart total with promotions
export const calculateCartTotalWithPromotions = (cartItems: any[]): number => {
  return cartItems.reduce((total, item) => {
    const itemPrice = item.promotionalPrice || item.plat.prix;
    return total + (itemPrice * item.quantity);
  }, 0);
};

// Function to get the current price of a plat (promotional or original)
export const getCurrentPlatPrice = (plat: Plat): number => {
  if (!plat) return 0;

  // Check if there's an active promotion
  if (plat.promotion) {
    const now = new Date();
    const dateDebut = new Date(plat.promotion.dateDebut);
    const dateFin = new Date(plat.promotion.dateFin);

    // If promotion is active and within date range, return promotional price
    if (plat.promotion.isPromotionActive && now >= dateDebut && now <= dateFin) {
      return plat.promotion.prixApresReduction;
    }
  }

  // Otherwise return original price
  return plat.prix;
};

// Function to check if a plat's promotion is currently active
export const isPlatPromotionActive = (plat: Plat): boolean => {
  if (!plat || !plat.promotion) return false;

  const now = new Date();
  const dateDebut = new Date(plat.promotion.dateDebut);
  const dateFin = new Date(plat.promotion.dateFin);

  return plat.promotion.isPromotionActive && now >= dateDebut && now <= dateFin;
};

// Update the default export to include the new functions
export default {
  getAllActivePromotions,
  getAllPromotions,
  getPromotionForPlat,
  getPlatWithPromotion,
  addToCartWithPromotion,
  passCommandeWithPromotions,
  calculatePromotionalPrice,
  calculatePriceFromPromotion,
  isPromotionActive,
  getTimeRemaining,
  getPromotionBadgeText,
  getPromotionMessage,
  getPromotionalPriceForCart,
  applyPromotionsToCart,
  calculateCartTotalWithPromotions,
  getCurrentPlatPrice,
  isPlatPromotionActive
};