"use client";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import useClientStore from "@/store/useClientStore";
import { Loader } from "lucide-react";
import PlatGallery from "@/components/client/plat/plat-gallery";
import PlatInfo from "@/components/client/plat/plat-info";
import PlatIngredients from "@/components/client/plat/plat-ingredients";

export default function PlatDetailsPage() {
  const params = useParams();
  const { id } = params as { id: string };
  const { getPlatById, plat, isLoading } = useClientStore();
  const fetchData = async () => {
    await getPlatById(id);
  };
  useEffect(() => {
    fetchData();
  }, [id, getPlatById]);

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
          Dish not found
        </h1>
        <p className="text-gray-600">
          The dish you're looking for doesn't exist or has been removed.
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
          </div>

          <PlatIngredients ingredients={plat.ingredients} />
        </div>

        {/* Right column - Info, Actions, Restaurant */}
        <div className="space-y-8">
          <div className="hidden md:block sticky top-24">
            <PlatInfo plat={plat} />
          </div>
        </div>
      </div>
    </div>
  );
}
