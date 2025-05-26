import useAuthStore from "@/store/useAuthStore";
import { toast } from "sonner";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Promotion {
  _id: string;
  plat: {
    _id: string;
    nom: string;
    description?: string;
    prix: number;
    image: string | null;
    categorie?: string | null;
  };
  pourcentage: number;
  prixApresReduction: number;
  dateDebut: string;
  dateFin: string;
  message?: string;
  isPromotionActive: boolean;
  joursRestants?: string;
}

export interface PromotionFormData {
  platId: string;
  pourcentage: number;
  dateDebut: string;
  dateFin: string;
  promoMessage?: string;
}

// Get all promotions for a restaurant
export const getRestaurantPromotions = async (restaurantId: string): Promise<Promotion[]> => {
  try {
    // Get a fresh token each time to avoid using expired tokens
    const token = useAuthStore.getState().token;
    
    if (!token) {
      console.warn("No authentication token available. User might need to log in again.");
      return [];
    }
    
    console.log(`Fetching promotions for restaurant: ${restaurantId}`);
    console.log(`Using token: ${token.substring(0, 10)}...`); // Log part of token for debugging
    
    const response = await fetch(`${API_URL}/promotion/restaurant/${restaurantId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // Add credentials to ensure cookies are sent with the request
      credentials: 'include',
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.status === 401) {
      console.error("Authentication token expired or invalid. Redirecting to login...");
      // You might want to trigger a logout or redirect to login here
      // For example: useAuthStore.getState().logout();
      return [];
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch promotions: ${response.status} ${response.statusText}`);
    }

    let data = await response.json();
    console.log("Raw promotions data received:", data);
    
    // Handle different response formats
    if (data && data.promotions) {
      data = data.promotions;
    }
    
    // Transform the data to match our Promotion interface if needed
    const formattedPromotions = Array.isArray(data) ? data.map(promo => {
      // Handle case where plat might be an ID string instead of an object
      const platObj = typeof promo.plat === 'string' 
        ? { _id: promo.plat, nom: "Loading...", prix: 0, image: null } 
        : promo.plat || {};
      
      // Ensure we have valid dates for promotion period calculation
      const now = new Date();
      const dateDebut = new Date(promo.dateDebut);
      const dateFin = new Date(promo.dateFin);
      
      // Calculate if promotion is currently active based on dates
      const isActive = now >= dateDebut && now <= dateFin;
      
      // Calculate days remaining
      const diffTime = dateFin.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const joursRestants = diffDays <= 0 ? "Terminée" : 
                           diffDays === 1 ? "1 jour restant" : 
                           `${diffDays} jours restants`;
      
      return {
        _id: promo._id || `temp-${Date.now()}`,
        plat: {
          _id: platObj._id || promo._id || `temp-plat-${Date.now()}`,
          nom: platObj.nom || "Plat sans nom",
          description: platObj.description || "",
          prix: typeof platObj.prix === 'number' ? platObj.prix : 0,
          image: platObj.image || "/placeholder-food.jpg",
          categorie: platObj.categorie || null
        },
        pourcentage: typeof promo.pourcentage === 'number' ? promo.pourcentage : 0,
        prixApresReduction: typeof promo.prixApresReduction === 'number' ? promo.prixApresReduction : 0,
        dateDebut: promo.dateDebut || new Date().toISOString(),
        dateFin: promo.dateFin || new Date(Date.now() + 86400000).toISOString(),
        message: promo.message || "",
        isPromotionActive: promo.isPromotionActive !== undefined ? promo.isPromotionActive : isActive,
        joursRestants: promo.joursRestants || joursRestants
      };
    }) : [];
    
    console.log("Formatted promotions:", formattedPromotions);
    return formattedPromotions;
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return [];
  }
};

// Get all promotions (active and inactive) for a restaurant
export const getAllRestaurantPromotions = async (restaurantId: string): Promise<Promotion[]> => {
  try {
    // Get a fresh token each time to avoid using expired tokens
    const token = useAuthStore.getState().token;
    
    if (!token) {
      console.warn("No authentication token available. User might need to log in again.");
      return [];
    }
    
    console.log(`Fetching all promotions for restaurant: ${restaurantId}`);
    console.log(`Using token: ${token.substring(0, 10)}...`); // Log part of token for debugging
    
    const response = await fetch(`${API_URL}/promotion/restaurant/${restaurantId}/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // Add credentials to ensure cookies are sent with the request
      credentials: 'include',
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.status === 401) {
      console.error("Authentication token expired or invalid. Redirecting to login...");
      // You might want to trigger a logout or redirect to login here
      return [];
    }
    
    if (!response.ok) {
      // If the /all endpoint fails, try the regular endpoint as fallback
      console.log("Falling back to regular promotion endpoint");
      return getRestaurantPromotions(restaurantId);
    }

    const data = await response.json();
    console.log("All promotions data received:", data);
    
    // Transform the data to match our Promotion interface if needed
    const formattedPromotions = Array.isArray(data) ? data.map(promo => {
      // Ensure we have valid dates for promotion period calculation
      const now = new Date();
      const dateDebut = new Date(promo.dateDebut);
      const dateFin = new Date(promo.dateFin);
      
      // Calculate if promotion is currently active based on dates
      const isActive = now >= dateDebut && now <= dateFin;
      
      // Calculate days remaining
      const diffTime = dateFin.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const joursRestants = diffDays <= 0 ? "Terminée" : 
                           diffDays === 1 ? "1 jour restant" : 
                           `${diffDays} jours restants`;
      
      return {
        _id: promo._id,
        plat: {
          _id: promo.plat?._id || promo._id,
          nom: promo.plat?.nom || "Plat sans nom",
          description: promo.plat?.description || "",
          prix: promo.plat?.prix || 0,
          image: promo.plat?.image || "/placeholder-food.jpg",
          categorie: promo.plat?.categorie || null
        },
        pourcentage: promo.pourcentage || 0,
        prixApresReduction: promo.prixApresReduction || 0,
        dateDebut: promo.dateDebut,
        dateFin: promo.dateFin,
        message: promo.message || "",
        isPromotionActive: promo.isPromotionActive !== undefined ? promo.isPromotionActive : isActive,
        joursRestants: promo.joursRestants || joursRestants
      };
    }) : [];
    
    console.log("Formatted all promotions:", formattedPromotions);
    return formattedPromotions;
  } catch (error) {
    console.error("Error fetching all promotions:", error);
    return [];
  }
};

// Apply a promotion to a plat
export const applyPromotion = async (promotionData: PromotionFormData): Promise<any> => {
  try {
    const token = useAuthStore.getState().token;
    
    if (!token) {
      console.warn("No authentication token available. User might need to log in again.");
      throw new Error("Authentication required");
    }
    
    console.log("Applying promotion with data:", promotionData);
    
    const response = await fetch(`${API_URL}/promotion/apply-promotion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(promotionData),
    });

    if (response.status === 401) {
      console.error("Authentication token expired or invalid.");
      throw new Error("Authentication token expired");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to apply promotion");
    }

    return await response.json();
  } catch (error) {
    console.error("Error applying promotion:", error);
    throw error;
  }
};

// Remove a promotion from a plat
export const removePromotion = async (platId: string): Promise<any> => {
  try {
    const token = useAuthStore.getState().token;
    
    if (!token) {
      console.warn("No authentication token available. User might need to log in again.");
      throw new Error("Authentication required");
    }
    
    console.log(`Removing promotion for plat: ${platId}`);
    
    const response = await fetch(`${API_URL}/promotion/remove/${platId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (response.status === 401) {
      console.error("Authentication token expired or invalid.");
      throw new Error("Authentication token expired");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to remove promotion");
    }

    return await response.json();
  } catch (error) {
    console.error("Error removing promotion:", error);
    throw error;
  }
};

// Get a specific promotion by plat ID
export const getPromotionByPlatId = async (platId: string): Promise<Promotion | null> => {
  try {
    const token = useAuthStore.getState().token;
    
    if (!token) {
      console.warn("No authentication token available. User might need to log in again.");
      return null;
    }
    
    console.log(`Fetching promotion for plat: ${platId}`);
    
    const response = await fetch(`${API_URL}/promotion/plat/${platId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    console.log(`Response status for plat ${platId}: ${response.status}`);
    
    if (response.status === 401) {
      console.error("Authentication token expired or invalid.");
      return null;
    }
    
    if (response.status === 404) {
      console.log(`No promotion found for plat ${platId}`);
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch promotion: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Promotion data for plat ${platId}:`, data);
    
    // If no promotion data or empty object, return null
    if (!data || Object.keys(data).length === 0) {
      return null;
    }
    
    // Format the promotion data
    const now = new Date();
    const dateDebut = new Date(data.dateDebut);
    const dateFin = new Date(data.dateFin);
    
    // Calculate if promotion is currently active based on dates
    const isActive = now >= dateDebut && now <= dateFin;
    
    // Calculate days remaining
    const diffTime = dateFin.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const joursRestants = diffDays <= 0 ? "Terminée" : 
                         diffDays === 1 ? "1 jour restant" : 
                         `${diffDays} jours restants`;
    
    return {
      _id: data._id,
      plat: {
        _id: data.plat?._id || platId,
        nom: data.plat?.nom || "Plat sans nom",
        description: data.plat?.description || "",
        prix: typeof data.plat?.prix === 'number' ? data.plat.prix : 0,
        image: data.plat?.image || "/placeholder-food.jpg",
        categorie: data.plat?.categorie || null
      },
      pourcentage: typeof data.pourcentage === 'number' ? data.pourcentage : 0,
      prixApresReduction: typeof data.prixApresReduction === 'number' ? data.prixApresReduction : 0,
      dateDebut: data.dateDebut,
      dateFin: data.dateFin,
      message: data.message || "",
      isPromotionActive: data.isPromotionActive !== undefined ? data.isPromotionActive : isActive,
      joursRestants: joursRestants
    };
  } catch (error) {
    console.error("Error fetching promotion by plat ID:", error);
    return null;
  }
};

// Test API endpoint accessibility
export const testPromotionEndpoint = async (restaurantId: string): Promise<boolean> => {
  try {
    const token = useAuthStore.getState().token;
    
    console.log(`Testing promotion endpoint for restaurant: ${restaurantId}`);
    const testUrl = `${API_URL}/promotion/restaurant/${restaurantId}`;
    console.log(`Test URL: ${testUrl}`);
    
    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log(`Test response status: ${response.status}`);
    console.log(`Test response headers:`, Object.fromEntries([...response.headers]));
    
    // Try to read the response body
    const text = await response.text();
    console.log(`Response body (first 200 chars): ${text.substring(0, 200)}`);
    
    return response.ok;
  } catch (error) {
    console.error("Error testing promotion endpoint:", error);
    return false;
  }
};

// Helper function to ensure we have a valid token
export const ensureValidToken = async (): Promise<string | null> => {
  try {
    let token = useAuthStore.getState().token;
    
    if (!token) {
      console.warn("No token available, user may need to log in");
      return null;
    }
    
    // You could add token validation logic here if needed
    // For example, check if token is expired and refresh it
    
    return token;
  } catch (error) {
    console.error("Error ensuring valid token:", error);
    return null;
  }
};

// Get promotions for multiple plats
export const getPromotionsForPlats = async (platIds: string[]): Promise<Record<string, Promotion>> => {
  try {
    const token = useAuthStore.getState().token;
    
    if (!token || !platIds.length) {
      return {};
    }
    
    console.log(`Fetching promotions for ${platIds.length} plats`);
    
    const response = await fetch(`${API_URL}/promotion/plats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ platIds }),
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch promotions for plats: ${response.status}`);
      return {};
    }
    
    const data = await response.json();
    console.log("Promotions for plats received:", data);
    
    const now = new Date();
    const promotionsMap: Record<string, Promotion> = {};
    
    // Process each promotion and add to map with platId as key
    if (data && Array.isArray(data)) {
      data.forEach(promo => {
        if (!promo.plat || !promo.plat._id) return;
        
        const platId = promo.plat._id;
        const dateDebut = new Date(promo.dateDebut);
        const dateFin = new Date(promo.dateFin);
        const isActive = now >= dateDebut && now <= dateFin;
        
        const diffTime = dateFin.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const joursRestants = diffDays <= 0 ? "Terminée" : 
                             diffDays === 1 ? "1 jour restant" : 
                             `${diffDays} jours restants`;
        
        promotionsMap[platId] = {
          _id: promo._id,
          plat: {
            _id: promo.plat._id,
            nom: promo.plat.nom || "Plat sans nom",
            description: promo.plat.description || "",
            prix: typeof promo.plat.prix === 'number' ? promo.plat.prix : 0,
            image: promo.plat.image || "/placeholder-food.jpg",
            categorie: promo.plat.categorie || null
          },
          pourcentage: promo.pourcentage || 0,
          prixApresReduction: promo.prixApresReduction || 0,
          dateDebut: promo.dateDebut,
          dateFin: promo.dateFin,
          message: promo.message || "",
          isPromotionActive: isActive,
          joursRestants: joursRestants
        };
      });
    }
    
    return promotionsMap;
  } catch (error) {
    console.error("Error fetching promotions for plats:", error);
    return {};
  }
};

/**
 * Toggle promotion status (activate/deactivate)
 */
export const togglePromotionStatus = async (platId: string, isActive: boolean): Promise<boolean> => {
  try {
    const token = useAuthStore.getState().token;
    
    if (!token) {
      console.error("No authentication token available");
      toast.error("Erreur d'authentification. Veuillez vous reconnecter.");
      return false;
    }
    
    console.log(`Toggling promotion status for plat ${platId} to ${isActive ? 'active' : 'inactive'}`);
    
    const response = await fetch(`${API_URL}/promotion/status/${platId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ isActive }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to toggle promotion status: ${response.status}`, errorText);
      throw new Error(`Failed to toggle promotion status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Promotion status updated:", data);
    
    toast.success(isActive 
      ? "Promotion activée avec succès" 
      : "Promotion désactivée avec succès"
    );
    
    return true;
  } catch (error) {
    console.error("Error toggling promotion status:", error);
    toast.error("Erreur lors de la mise à jour du statut de la promotion");
    return false;
  }
};