"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useClientStore from "@/store/useClientStore";
import clientPromotionService, { Plat as PlatWithPromotion, Promotion } from "@/services/clientPromotion";
import { Loader } from "lucide-react";
import PlatGallery from "@/components/client/plat/plat-gallery";
import PlatInfo from "@/components/client/plat/plat-info";
import PlatActions from "@/components/client/plat/plat-actions";
import PlatIngredients from "@/components/client/plat/plat-ingredients";
import PlatComments from "@/components/client/plat//plat-comments";
import RestaurantCard from "@/components/client/plat/restaurant-card";
import { Separator } from "@/components/ui/separator";

export default function PlatDetailsPage() {
  const params = useParams();
  const { id } = params as { id: string };
  const { getPlatById, plat: platFromStore, isLoading, likePlat, getRestaurantById } = useClientStore(); // Renamed for clarity
  const [processedPlat, setProcessedPlat] = useState<PlatWithPromotion | null>(null);
  const [fullRestaurantData, setFullRestaurantData] = useState<any | null>(null);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await getPlatById(id);
    };
    fetchData();
  }, [id, getPlatById]); // Removed isLiking from dependencies to avoid re-fetching on like

  useEffect(() => {
    const processPlatWithPromotion = async () => {
      if (platFromStore) {
        const promotion = await clientPromotionService.getPromotionForPlat(platFromStore._id);
        if (promotion && clientPromotionService.isPromotionActive(promotion.dateDebut, promotion.dateFin)) {
          setProcessedPlat({
            ...platFromStore,
            promotion: {
              pourcentage: promotion.pourcentage,
              prixApresReduction: clientPromotionService.calculatePriceFromPromotion(platFromStore.prix, promotion.pourcentage),
              dateDebut: promotion.dateDebut,
              dateFin: promotion.dateFin,
              isPromotionActive: true,
            },
          } as PlatWithPromotion);
        } else {
          setProcessedPlat(platFromStore as PlatWithPromotion);
        }
      } else {
        setProcessedPlat(null);
      }
    };
    processPlatWithPromotion();
  }, [platFromStore]); // Depend on platFromStore to re-process when it changes

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (platFromStore && platFromStore.restaurant) {
        if (typeof platFromStore.restaurant === 'string') {
          const restaurantData = await getRestaurantById(platFromStore.restaurant);
          setFullRestaurantData(restaurantData);
        } else {
          // If platFromStore.restaurant is already an object, use it directly
          setFullRestaurantData(platFromStore.restaurant);
        }
      } else {
        setFullRestaurantData(null);
      }
    };
    fetchRestaurantDetails();
  }, [platFromStore, getRestaurantById]);

  const handleLike = async () => {
    if (isLiking || !platFromStore) return; // Ensure platFromStore exists
    setIsLiking(true);
    await likePlat(platFromStore._id); // Use platFromStore._id
    // After likePlat, platFromStore in the Zustand store will be updated.
    // The useEffect depending on platFromStore will then update processedPlat.
    // PlatActions receives processedPlat, and its internal useEffect will update isLiked.
    setIsLiking(false);
  };

  // Use platFromStore for loading and not found checks initially, then processedPlat for rendering
  if (isLoading && !platFromStore) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoading && !platFromStore) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Plat non trouvé
        </h1>
        <p className="text-gray-600">
          Le plat que vous recherchez n'existe pas ou a été supprimé.
        </p>
      </div>
    );
  }
  // Render content using processedPlat once available
  if (!processedPlat) {
    // This can be a more specific loading state or null if handled by the above checks
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Gallery and Restaurant */}
        <div className="lg:col-span-2 space-y-8">
          <PlatGallery images={processedPlat.images} videos={processedPlat.videos || []} />

          <div className="md:hidden">
            <PlatInfo plat={processedPlat} />
            <PlatActions plat={processedPlat} onLike={handleLike} isLiking={isLiking} />
            <Separator className="my-6" />
          </div>

          <PlatIngredients ingredients={processedPlat.ingredients} />
          <Separator className="my-6" />
          <PlatComments platId={processedPlat._id} comments={processedPlat.commentaires || []} />
        </div>

        {/* Right column - Info, Actions, Restaurant */}
        <div className="space-y-8">
          <div className="hidden md:block sticky top-24">
            <PlatInfo plat={processedPlat} />
            <PlatActions plat={processedPlat} onLike={handleLike} isLiking={isLiking} />
            <Separator className="my-6" />
            <RestaurantCard restaurant={fullRestaurantData} />
          </div>

          <div className="md:hidden">
            <RestaurantCard restaurant={fullRestaurantData} />
          </div>
        </div>
      </div>
    </div>
  );
}
