"use client";
import { useEffect, useMemo } from "react";
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

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function PopularDishesCarousel() {
  const { getRecommandedPlats, recommandedPlats, isLoading } = useClientStore();
  const { user } = useAuthStore();
  const fetchData = async () => {
    if (user?._id) {
      await getRecommandedPlats(user._id);
    }
  };

  useEffect(() => {
    fetchData();
  }, [getRecommandedPlats]);
  console.log({ recommandedPlats });
  const randomPlats = useMemo(
    () => getRandomItems(recommandedPlats, 4),
    [recommandedPlats]
  );
  console.log(recommandedPlats);
  if (isLoading) {
    return (
      <div>
        <SectionHeader title="Popular Dishes" viewAllLink="/dishes" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              categoryObj = { nom: plat.categorie };
            } else if (plat.categorie && typeof plat.categorie === "object") {
              categoryObj = { nom: plat.categorie.nom };
            }

            let restaurantObj = undefined;
            if (typeof plat.restaurant === "string" && plat.restaurant) {
              restaurantObj = { nom: plat.restaurant };
            } else if (plat.restaurant && typeof plat.restaurant === "object") {
              restaurantObj = { nom: plat.restaurant.nom };
            }

            return (
              <CarouselItem
                key={plat._id}
                className="pl-2 md:pl-4 basis-1/1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <PlatCard
                  plat={{
                    ...plat,
                    categorie: categoryObj,
                    restaurant: restaurantObj,
                  }}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
