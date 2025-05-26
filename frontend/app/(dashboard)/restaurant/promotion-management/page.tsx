"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Edit, Plus, Search, Trash2, Power } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import useRestaurantStore from "@/store/useRestaurantStore";
import RestaurantProfileNotCompleted from "@/components/restaurant/restaurant-profile-not-completed";
import CreatePromotionModal from "@/components/restaurant/promotion-management/create-promotion-modal";
import UpdatePromotionModal from "@/components/restaurant/promotion-management/update-promotion-modal";
import DeletePromotionDialog from "@/components/restaurant/promotion-management/delete-promotion-modal";
import PromotionsTableSkeleton from "@/components/restaurant/promotion-management/promotions-table-skeleton";

// Define API URL directly since constants file is missing
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Define the Promotion interface
interface Promotion {
  _id: string;
  plat: {
    _id: string;
    nom: string;
    image: string;
    prix: number;
  };
  pourcentage: number;
  prixApresReduction: number;
  dateDebut: string;
  dateFin: string;
  message: string;
  isPromotionActive: boolean;
  joursRestants?: string;
}

export default function PromotionsPage() {
  const { getOwnerProfile, ownerProfile, isLoading, error, updatePromotion } = useRestaurantStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get token from localStorage to avoid module import issues
  const getToken = () => {
    if (typeof window !== 'undefined') {
      // Try to get token from useAuthStore first (most reliable)
      try {
        // Import dynamically to avoid SSR issues
        const authStore = require('@/store/useAuthStore').default;
        const storeToken = authStore.getState().token;
        if (storeToken) {
          console.log("Using token from auth store");
          return storeToken;
        }
      } catch (e) {
        console.warn("Could not access auth store:", e);
      }

      // Try to get token from localStorage as fallback
      try {
        const localToken = localStorage.getItem('token');
        if (localToken) {
          console.log("Using token from localStorage");
          return localToken;
        }
      } catch (e) {
        console.warn("Could not access localStorage:", e);
      }

      console.warn("No token found in storage");
      return '';
    }
    return '';
  };

  // Function to fetch promotions directly from API
  const fetchPromotionsDirectly = async () => {
    try {
      console.log("Fetching promotions directly from API...");

      // Get restaurant ID from owner profile
      if (!ownerProfile?.restaurant?._id) {
        console.error("Restaurant ID not found in owner profile");
        return [];
      }

      const restaurantId = ownerProfile.restaurant._id;
      console.log(`Using restaurant ID: ${restaurantId}`);

      const token = getToken();
      if (!token) {
        console.error("No authentication token available");
        toast.error("Erreur d'authentification. Veuillez vous reconnecter.");
        return [];
      }

      console.log(`Token available (first 10 chars): ${token.substring(0, 10)}...`);

      // Use the correct endpoint with a direct API URL to avoid any path issues
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/promotion/restaurant/${restaurantId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: 'include', // Add credentials to ensure cookies are sent
      });

      console.log(`Response status: ${response.status}`);

      if (response.status === 401) {
        console.error("Authentication failed: 401 Unauthorized");

        // Try to refresh the token or redirect to login
        try {
          // Import auth store to handle token refresh or logout
          const authStore = require('@/store/useAuthStore').default;
          const refreshResult = await authStore.getState().refreshToken?.();

          if (refreshResult) {
            console.log("Token refreshed, retrying request...");
            return fetchPromotionsDirectly(); // Retry with new token
          } else {
            toast.error("Session expirée. Veuillez vous reconnecter.");
            // Redirect to login page after a short delay
            setTimeout(() => {
              window.location.href = "/login";
            }, 2000);
          }
        } catch (e) {
          console.error("Failed to refresh token:", e);
          toast.error("Session expirée. Veuillez vous reconnecter.");
        }

        return [];
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch promotions: ${response.status} ${response.statusText}`);
      }

      // Try to parse the response as JSON
      let data;
      try {
        const text = await response.text();
        console.log("Raw response:", text.substring(0, 200) + (text.length > 200 ? '...' : ''));
        data = text ? JSON.parse(text) : [];
      } catch (e) {
        console.error("Error parsing JSON response:", e);
        return [];
      }

      console.log("Directly fetched promotions:", data);

      // Transform the data to match our Promotion interface
      const formattedPromotions = Array.isArray(data) ? data.map((promo: any) => {
        // Make sure plat data exists
        if (!promo.plat) {
          console.warn("Promotion without plat data:", promo);
          return null;
        }

        // Handle case where plat might be just an ID string
        const platObj = typeof promo.plat === 'string'
          ? { _id: promo.plat, nom: "Chargement...", prix: 0, image: null }
          : promo.plat;

        const rawPlatImage = platObj.image;
        let imageUrl;
        if (!rawPlatImage) {
          imageUrl = "/placeholder-food.jpg"; // Default placeholder
        } else if (rawPlatImage.startsWith('http://') || rawPlatImage.startsWith('https://')) {
          imageUrl = rawPlatImage; // Already a full URL
        } else {
          // Construct full URL from relative path
          const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '');
          imageUrl = `${baseUrl}/${rawPlatImage.startsWith('/') ? rawPlatImage.substring(1) : rawPlatImage}`;
        }

        const prixOriginal = platObj.prix || 0;
        const pourcentage = promo.pourcentage || 0;
        const prixApresReduction = prixOriginal - (prixOriginal * pourcentage / 100);

        // Use the isPromotionActive flag from the backend directly
        // This ensures we respect the manual activation/deactivation status
        const isPromotionActive = promo.isPromotionActive === undefined ?
          // Fallback to date-based calculation if the flag isn't provided
          (() => {
            const now = new Date();
            const dateDebut = new Date(promo.dateDebut);
            const dateFin = new Date(promo.dateFin);
            return now >= dateDebut && now <= dateFin;
          })() :
          // Otherwise use the flag from the backend
          promo.isPromotionActive;

        // Calculate days left
        const diffTime = new Date(promo.dateFin).getTime() - new Date().getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const joursRestants = diffDays <= 0 ? "Terminée" :
          `${diffDays} jour${diffDays > 1 ? 's' : ''} restant${diffDays > 1 ? 's' : ''}`;

        return {
          _id: promo._id,
          plat: {
            _id: platObj._id,
            nom: platObj.nom,
            image: imageUrl, // Use the processed imageUrl
            prix: platObj.prix,
          },
          pourcentage: promo.pourcentage,
          prixApresReduction,
          dateDebut: promo.dateDebut,
          dateFin: promo.dateFin,
          message: promo.message || "",
          isPromotionActive,
          joursRestants,
        };
      }).filter(Boolean) : [];

      console.log("Formatted promotions:", formattedPromotions);

      // Update the state with the latest data
      setPromotions(formattedPromotions as Promotion[]);

      // Return the formatted promotions
      return formattedPromotions;
    } catch (error) {
      console.error("Error fetching promotions directly:", error);
      toast.error("Erreur lors du chargement des promotions");
      return [];
    }
  };

  // Update the refreshPromotions function
  const refreshPromotions = async () => {
    try {
      setIsRefreshing(true);
      console.log("Refreshing promotions...");

      // If we don't have owner profile yet, fetch it first
      if (!ownerProfile?.restaurant?._id) {
        console.log("No owner profile, fetching it first...");
        await getOwnerProfile();
      }

      // Check if token is available
      const token = getToken();
      if (!token) {
        console.error("No authentication token available for refresh");
        toast.error("Erreur d'authentification. Veuillez vous reconnecter.");

        // Try to refresh the token
        try {
          const authStore = require('@/store/useAuthStore').default;
          const refreshResult = await authStore.getState().refreshToken?.();

          if (!refreshResult) {
            setTimeout(() => {
              window.location.href = "/login";
            }, 2000);
            return;
          }
        } catch (e) {
          console.error("Failed to refresh token:", e);
        }
      }

      // Now fetch promotions
      const directPromotions = await fetchPromotionsDirectly();

      // Show appropriate toast based on result
      if (directPromotions && directPromotions.length > 0) {
        toast.success(`${directPromotions.length} promotions trouvées`);
      } else {
        toast.info("Aucune promotion trouvée");
      }
    } catch (error) {
      console.error("Error refreshing promotions:", error);
      toast.error("Erreur lors de la mise à jour des promotions");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load owner profile data once on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Loading owner profile...");
        await getOwnerProfile();
      } catch (err) {
        console.error("Error loading owner profile:", err);
        toast.error("Erreur lors du chargement du profil");
      }
    };
    loadData();
  }, [getOwnerProfile]); // Add getOwnerProfile as dependency

  // Fetch promotions when owner profile changes
  useEffect(() => {
    if (ownerProfile?.restaurant?._id) {
      console.log("Owner profile loaded, fetching promotions...");
      fetchPromotionsDirectly();
    }
  }, [ownerProfile]);

  // Log current promotions state when it changes
  useEffect(() => {
    console.log("Current promotions state:", promotions);
  }, [promotions]);

  // Analyze restaurant data structure
  const analyzeRestaurantData = () => {
    if (!ownerProfile?.restaurant?.plats) {
      console.log("No restaurant data available");
      return;
    }

    console.log("Analyzing restaurant data structure...");

    // Check the first few plats to understand their structure
    const samplePlats = ownerProfile.restaurant.plats.slice(0, 3);

    samplePlats.forEach((plat: any, index: number) => {
      console.log(`Plat ${index + 1}:`, {
        id: plat._id,
        name: plat.nom,
        hasPromotionProperty: 'promotion' in plat,
        promotionValue: plat.promotion,
        hasPromotionsArray: Array.isArray(plat.promotions),
        promotionsArrayLength: Array.isArray(plat.promotions) ? plat.promotions.length : 0,
        allKeys: Object.keys(plat)
      });
    });

    // Look for any promotion-related data in the restaurant object
    const restaurantKeys = Object.keys(ownerProfile.restaurant);
    console.log("Restaurant object keys:", restaurantKeys);

    if (restaurantKeys.includes('promotions')) {
      console.log("Found promotions at restaurant level:", ownerProfile.restaurant.promotions);
    }

    toast.info("Data structure analyzed in console");
  };

  // Filter promotions based on search term with proper null checking
  const filteredPromotions = promotions?.filter((promotion) => {
    // First check if promotion and promotion.plat exist
    if (!promotion || !promotion.plat) return false;

    // Then check if plat.nom exists before trying to use it
    return promotion.plat.nom ?
      promotion.plat.nom.toLowerCase().includes(searchTerm.toLowerCase()) :
      false;
  }) || [];

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Open update modal with selected promotion
  const handleUpdateClick = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsUpdateModalOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (promotion: Promotion) => {
    setPromotionToDelete(promotion);
    setIsDeleteDialogOpen(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: fr });
    } catch (error) {
      console.error("Invalid date format:", dateString);
      return "Date invalide";
    }
  };

  // Debug info component
  const debugInfo = process.env.NODE_ENV === 'development' && (
    <div className="bg-gray-100 p-4 mb-4 rounded-md">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <p>Owner Profile Loaded: {ownerProfile ? 'Yes' : 'No'}</p>
      <p>Restaurant ID: {ownerProfile?.restaurant?._id || 'Not available'}</p>
      <p>Restaurant Plats: {ownerProfile?.restaurant?.plats?.length || 0}</p>
      <p>Extracted Promotions: {promotions.length}</p>
      <p>Filtered Promotions: {filteredPromotions.length}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => console.log({ ownerProfile, promotions, filteredPromotions })}
        >
          Log Data to Console
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={analyzeRestaurantData}
        >
          Analyze Data Structure
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const token = getToken();
            console.log("Current token (first 10 chars):", token ? token.substring(0, 10) + "..." : "No token");
          }}
        >
          Check Token
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const url = `${API_URL}/promotion/restaurant/${ownerProfile?.restaurant?._id}`;
            console.log("API URL:", url);
            window.open(url, '_blank');
          }}
        >
          Test API Endpoint
        </Button>
      </div>
    </div>
  );

  // Function to handle status toggle
  const handleToggleStatus = async (promotion: Promotion) => {
    try {
      const newStatus = !promotion.isPromotionActive;
      // Instead of using togglePromotionStatus, use updatePromotion with the same data
      // but just change the isActive status
      const formattedData = {
        platId: promotion.plat._id,
        image: promotion.plat.image,
        pourcentage: promotion.pourcentage,
        dateDebut: promotion.dateDebut,
        dateFin: promotion.dateFin,
        message: promotion.message || "",
        isActive: newStatus // This is the key change
      };

      const success = await updatePromotion(promotion.plat._id, formattedData);

      if (success) {
        toast.success(`Promotion ${newStatus ? "activée" : "désactivée"} avec succès.`);
        refreshPromotions();
      } else {
        toast.error("Erreur lors de la mise à jour du statut de la promotion.");
      }
    } catch (error) {
      console.error("Error toggling promotion status:", error);
      toast.error("Une erreur est survenue lors de la mise à jour du statut.");
    }
  };

  // Function to handle promotion update
  const handleUpdatePromotion = async (updatedPromotion: Promotion) => {
    try {
      const promotionData = {
        platId: updatedPromotion.plat._id,
        pourcentage: updatedPromotion.pourcentage,
        dateDebut: updatedPromotion.dateDebut,
        dateFin: updatedPromotion.dateFin,
        message: updatedPromotion.message,
        isPromotionActive: updatedPromotion.isPromotionActive
      };
      const success = await updatePromotion(updatedPromotion.plat._id, promotionData);

      if (success) {
        toast.success("Promotion mise à jour avec succès.");
        refreshPromotions();
      } else {
        toast.error("Erreur lors de la mise à jour de la promotion.");
      }
    } catch (error) {
      console.error("Error updating promotion:", error);
      toast.error("Une erreur est survenue lors de la mise à jour.");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <RestaurantProfileNotCompleted />
      {/*process.env.NODE_ENV === 'development' && debugInfo*/}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-2xl">Gestion des promotions</CardTitle>
            <CardDescription>
              Gérez les promotions de plats de votre restaurant
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une promotion
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un plat..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <PromotionsTableSkeleton />
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">
                Une erreur est survenue: {error}
              </p>
              <Button
                variant="outline"
                onClick={refreshPromotions}
                className="mt-4"
              >
                Réessayer
              </Button>
            </div>
          ) : filteredPromotions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Nom du plat</TableHead>
                    <TableHead className="hidden md:table-cell">Réduction</TableHead>
                    <TableHead className="hidden md:table-cell">Date de début</TableHead>
                    <TableHead className="hidden md:table-cell">Date de fin</TableHead>
                    <TableHead className="hidden md:table-cell">Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromotions.map((promotion) => (
                    <TableRow key={promotion._id}>
                      <TableCell>
                        <div className="relative h-10 w-10 rounded-md overflow-hidden">
                          <Image
                            src={promotion.plat.image || "/placeholder-food.jpg"}
                            alt={promotion.plat.nom}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {promotion.plat.nom}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-semibold text-green-600">
                          -{promotion.pourcentage}%
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {promotion.plat.prix.toFixed(2)} DT → {promotion.prixApresReduction.toFixed(2)} DT
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(promotion.dateDebut)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(promotion.dateFin)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full mr-2 ${promotion.isPromotionActive ? "bg-green-500" : "bg-red-500"
                            }`} />
                          {promotion.isPromotionActive ? "Active" : "Inactive"}
                          {promotion.joursRestants && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({promotion.joursRestants})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            className="cursor-pointer hover:bg-gray-200"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(promotion)}
                            title={promotion.isPromotionActive ? "Désactiver" : "Activer"}
                          >
                            <Power className={`h-4 w-4 ${promotion.isPromotionActive ? "text-green-500" : "text-red-500"}`} />
                            <span className="sr-only">
                              {promotion.isPromotionActive ? "Désactiver" : "Activer"}
                            </span>
                          </Button>
                          <Button
                            className="cursor-pointer hover:bg-gray-200"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateClick(promotion)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            className="cursor-pointer hover:bg-red-300"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(promotion)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-2">
                Aucune promotion trouvée. Ajoutez une promotion pour commencer.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Si vous venez d'ajouter une promotion et qu'elle n'apparaît pas, essayez de rafraîchir la page.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={refreshPromotions}
                  disabled={isRefreshing}
                  className="mb-2 sm:mb-0"
                >
                  {isRefreshing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Chargement...
                    </>
                  ) : (
                    "Rafraîchir les données"
                  )}
                </Button>
                <Button
                  variant="default"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Ajouter une promotion
                </Button>
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    variant="outline"
                    onClick={analyzeRestaurantData}
                    className="mt-2 sm:mt-0"
                  >
                    Analyser les données
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreatePromotionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPromotionCreated={refreshPromotions}
      />

      {selectedPromotion && (
        <UpdatePromotionModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          promotion={selectedPromotion}
          onPromotionUpdated={refreshPromotions}
        />
      )}

      <DeletePromotionDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        promotion={promotionToDelete}
        onPromotionDeleted={refreshPromotions}
      />
    </div>
  );
}

