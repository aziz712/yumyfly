"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useClientStore from "@/store/useClientStore";
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
  const { getPlatById, plat, isLoading, likePlat } = useClientStore();
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await getPlatById(id);
    };
    fetchData();
  }, [id, getPlatById]);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    await likePlat(id);
    setIsLiking(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plat) {
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
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Gallery and Restaurant */}
        <div className="lg:col-span-2 space-y-8">
          <PlatGallery images={plat.images} videos={plat.videos || []} />

          <div className="md:hidden">
            <PlatInfo plat={plat} />

            <Separator className="my-6" />
          </div>

          <PlatIngredients ingredients={plat.ingredients} />
          <Separator className="my-6" />
        </div>

        {/* Right column - Info, Actions, Restaurant */}
        <div className="space-y-8">
          <div className="hidden md:block sticky top-24">
            <PlatInfo plat={plat} />

            <Separator className="my-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
