"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { SectionHeader } from "@/components/client/home/section-header";
import useClientStore from "@/store/useClientStore";
import { MapPin, Clock, Phone } from "lucide-react";

export default function RestaurantsCarousel() {
  const { getAllRestaurants, restaurants, isLoading } = useClientStore();
  const [randomRestaurants, setRandomRestaurants] = useState<any[]>([]);

  // Check if restaurant is open
  const isRestaurantOpen = (workingHours: { from: string; to: string }) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const [fromHour, fromMinute] = workingHours.from.split(":").map(Number);
    const [toHour, toMinute] = workingHours.to.split(":").map(Number);

    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const fromTimeInMinutes = fromHour * 60 + fromMinute;
    const toTimeInMinutes = toHour * 60 + toMinute;

    return (
      currentTimeInMinutes >= fromTimeInMinutes &&
      currentTimeInMinutes <= toTimeInMinutes
    );
  };

  useEffect(() => {
    // Fetch all restaurants
    getAllRestaurants();
  }, [getAllRestaurants]);

  useEffect(() => {
    // Shuffle and select random restaurants when the list is updated
    if (restaurants.length > 0) {
      const shuffled = [...restaurants].sort(() => Math.random() - 0.5); // Shuffle array
      setRandomRestaurants(shuffled.slice(0, 10)); // Select first 10 random restaurants
    }
  }, [restaurants]);

  if (isLoading) {
    return (
      <div className="w-full py-8">
        <SectionHeader
          title="Restaurants populaires"
          viewAllLink="/client/restaurant"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <Card key={index} className="h-full overflow-hidden animate-pulse">
              <div className="relative pt-[56.25%] bg-gray-200" />
              <CardContent className="p-4">
                <div className="h-6 w-3/4 bg-gray-300 rounded mb-2" />
                <div className="h-4 w-1/2 bg-gray-300 rounded mb-2" />
                <div className="h-4 w-full bg-gray-300 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="w-full py-8">
        <SectionHeader
          title="Restaurants populaires"
          viewAllLink="/client/restaurant"
        />
        <div className="text-center text-gray-500 mt-8">
          Aucun restaurant trouvé.
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Restaurants populaires"
        viewAllLink="/client/restaurant"
      />

      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {randomRestaurants.map((restaurant) => (
            <CarouselItem
              key={restaurant._id}
              className="pl-2 md:pl-4 basis-1/1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <Link href={`/client/restaurant/${restaurant._id}`}>
                <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg">
                  <div className="relative pt-[56.25%]">
                    <Image
                      width={100}
                      height={100}
                      src={
                        (process.env.NEXT_PUBLIC_APP_URL || "") +
                          restaurant.images?.[0] ||
                        "/placeholder.svg?height=200&width=300" ||
                        "/placeholder.svg"
                      }
                      alt={restaurant.nom}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge
                        className={`${
                          restaurant.workingHours &&
                          isRestaurantOpen({
                            from: String(restaurant.workingHours?.from),
                            to: String(restaurant.workingHours?.to),
                          })
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      >
                        {restaurant.workingHours &&
                        isRestaurantOpen({
                          from: String(restaurant.workingHours?.from),
                          to: String(restaurant.workingHours?.to),
                        })
                          ? "Ouvert"
                          : "Fermé"}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {restaurant.nom}
                      </h3>
                      <div className="flex items-center bg-amber-50 px-2 py-1 rounded-md">
                        <Star className="h-4 w-4 text-amber-500 mr-1" />
                        <span className="text-sm font-medium">4.8</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <MapPin size={14} className="shrink-0" />
                      <span className="truncate">{restaurant.adresse}</span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <Phone size={14} className="shrink-0" />
                      <span>{restaurant.telephone}</span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock size={14} className="shrink-0" />
                      <span>
                        {restaurant.workingHours
                          ? `${restaurant.workingHours.from} - ${restaurant.workingHours.to}`
                          : "Horaires non disponibles"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mt-3 leading-relaxed max-w-full break-words overflow-hidden text-wrap">
                      {restaurant.description}
                    </p>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
                    {restaurant.categories?.slice(0, 3).map((category: any) => (
                      <Badge
                        key={category._id}
                        variant="outline"
                        className="bg-orange-50"
                      >
                        {category.nom}
                      </Badge>
                    ))}
                    {restaurant.categories?.length > 3 && (
                      <Badge variant="outline" className="bg-orange-50">
                        +{restaurant.categories.length - 3}
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
