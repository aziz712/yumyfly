"use client";
import { useEffect, useMemo, useState } from "react"; // Added useState
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { SectionHeader } from "@/components/client/home/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import useClientStore from "@/store/useClientStore";
import PlatCard from "../cards/plat-card";
import useAuthStore from "@/store/useAuthStore";

// Define Categorie interface locally if not already globally available or imported
interface Categorie {
  _id: string;
  nom: string;
  // Add other properties if needed
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function PopularDishesCarousel() {
  const { getRecommandedPlats, recommandedPlats, isLoading, getRestaurantById, getAllCategories, categories: allCategories } = useClientStore(); // Added getAllCategories and allCategories
  const { user } = useAuthStore();
  // Removed unused getRestaurantById from here as it's destructured above

  const [fetchedRestaurants, setFetchedRestaurants] = useState<Record<string, { nom: string }>>({});

  const fetchData = async () => {
    if (user?._id) {
      await getRecommandedPlats(user._id);
    }
    await getAllCategories(); // Fetch all categories
  };

  useEffect(() => {
    fetchData();
  }, [user?._id]); // Added user?._id to dependency array to refetch if user changes

  const randomPlats = useMemo(
    () => getRandomItems(recommandedPlats, 4),
    [recommandedPlats]
  );

  // Effect to fetch restaurant names when randomPlats changes
  useEffect(() => {
    const fetchRestaurantNames = async () => {
      const newFetchedRestaurants: Record<string, { nom: string }> = {};
      for (const plat of randomPlats) {
        if (typeof plat.restaurant === 'string' && !fetchedRestaurants[plat.restaurant]) {
          try {
            const restaurantDetails = await getRestaurantById(plat.restaurant);
            if (restaurantDetails) {
              newFetchedRestaurants[plat.restaurant] = { nom: restaurantDetails.nom };
            }
          } catch (error) {
            console.error(`Failed to fetch restaurant ${plat.restaurant}:`, error);
            // Optionally set a default or error name
            newFetchedRestaurants[plat.restaurant] = { nom: "Restaurant not found" }; 
          }
        }
      }
      if (Object.keys(newFetchedRestaurants).length > 0) {
        setFetchedRestaurants(prev => ({ ...prev, ...newFetchedRestaurants }));
      }
    };

    if (randomPlats.length > 0) {
      fetchRestaurantNames();
    }
  }, [randomPlats, getRestaurantById]); // Removed fetchedRestaurants from deps to avoid loop

  if (isLoading && randomPlats.length === 0) { // Ensure skeleton shows if plats are not yet loaded
    return (
      <div>
        <SectionHeader title="Popular Dishes" viewAllLink="/dishes" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-40 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Popular Dishes" viewAllLink="/client/plats/all" />

      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {randomPlats.map((plat) => {
            let categoryObj = undefined;
            if (typeof plat.categorie === "string" && plat.categorie) {
              const foundCategory = allCategories.find(cat => cat._id === plat.categorie);
              categoryObj = foundCategory ? { nom: foundCategory.nom } : { nom: plat.categorie }; // Fallback to ID if not found
            } else if (plat.categorie && typeof plat.categorie === "object") {
              categoryObj = { nom: (plat.categorie as Categorie).nom }; // Type assertion
            }

            let restaurantObj = undefined;
            if (typeof plat.restaurant === "string" && plat.restaurant) {
              // Use fetched restaurant name if available, otherwise use ID as fallback
              restaurantObj = fetchedRestaurants[plat.restaurant] 
                              ? { _id: plat.restaurant, nom: fetchedRestaurants[plat.restaurant].nom } 
                              : { _id: plat.restaurant, nom: "Loading..." }; // Or some placeholder
            } else if (plat.restaurant && typeof plat.restaurant === "object") {
              // Ensure _id is included if it exists on the object
              const restaurantData = plat.restaurant as { _id?: string, nom: string };
              restaurantObj = { nom: restaurantData.nom, _id: restaurantData._id || plat._id }; // Fallback _id to plat._id if not present
            }

            return (
              <CarouselItem
                key={plat._id}
                className="pl-2 md:pl-4 basis-1/1 sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <PlatCard
                  plat={{
                    ...plat,
                    categorie: categoryObj,
                    restaurant: restaurantObj,
                  }}
                  //restaurantId={typeof plat.restaurant === 'string' ? plat.restaurant : (plat.restaurant as any)?._id}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
