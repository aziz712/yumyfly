"use client";
import { useState, useEffect } from "react";
import useClientStore from "@/store/useClientStore";
import Link from "next/link";
import { Search, MapPin, Clock, Star, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { parse, isWithinInterval } from "date-fns";
import Image from "next/image";

export default function AllRestaurants() {
  const { getAllRestaurants, restaurants, isLoading } = useClientStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState<{
    from: string | null;
    to: string | null;
  }>({
    from: null,
    to: null,
  });
  const [sortOption, setSortOption] = useState("name");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    getAllRestaurants();
  }, [getAllRestaurants]);

  // Update active filters
  useEffect(() => {
    const newActiveFilters = [];
    if (searchQuery) newActiveFilters.push("search");
    if (selectedTimeRange.from && selectedTimeRange.to)
      newActiveFilters.push("time");
    setActiveFilters(newActiveFilters);
  }, [searchQuery, selectedTimeRange]);

  // Filter restaurants
  const filteredRestaurants = restaurants.filter((restaurant) => {
    // Filter by name
    const nameMatch = restaurant.nom
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Filter by working hours
    let timeMatch = true;
    if (selectedTimeRange.from && selectedTimeRange.to) {
      const fromTime = parse(selectedTimeRange.from, "HH:mm", new Date());
      const toTime = parse(selectedTimeRange.to, "HH:mm", new Date());

      const restaurantFromTime = parse(
        restaurant.workingHours?.from?.toString() || "00:00",
        "HH:mm",
        new Date()
      );
      const restaurantToTime = parse(
        restaurant.workingHours?.to?.toString() || "23:59",
        "HH:mm",
        new Date()
      );

      // Check if selected time range is within restaurant working hours
      timeMatch =
        isWithinInterval(fromTime, {
          start: restaurantFromTime,
          end: restaurantToTime,
        }) &&
        isWithinInterval(toTime, {
          start: restaurantFromTime,
          end: restaurantToTime,
        });
    }

    return nameMatch && timeMatch;
  });

  // Sort restaurants
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    switch (sortOption) {
      case "name":
        return a.nom.localeCompare(b.nom);
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      default:
        return 0;
    }
  });

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedTimeRange({ from: null, to: null });
    setActiveFilters([]);
  };

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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-2xl font-semibold mb-6">Restaurants</div>

      {/* Search and filters bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Rechercher un restaurant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12 rounded-lg"
          />
        </div>

        <div className="flex gap-2">
          {/* Sort dropdown */}
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nom (A-Z)</SelectItem>
              <SelectItem value="newest">Plus récent</SelectItem>
              <SelectItem value="oldest">Plus ancien</SelectItem>
            </SelectContent>
          </Select>

          {/* Time filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Clock size={16} />
                Horaires
                {activeFilters.includes("time") && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    1
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h3 className="font-medium">
                  Filtrer par horaires d'ouverture
                </h3>
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="from-time">De</Label>
                      <Input
                        id="from-time"
                        type="time"
                        value={selectedTimeRange.from || ""}
                        onChange={(e) =>
                          setSelectedTimeRange((prev) => ({
                            ...prev,
                            from: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="to-time">À</Label>
                      <Input
                        id="to-time"
                        type="time"
                        value={selectedTimeRange.to || ""}
                        onChange={(e) =>
                          setSelectedTimeRange((prev) => ({
                            ...prev,
                            to: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedTimeRange({ from: null, to: null })
                    }
                    className="mt-2"
                  >
                    Réinitialiser les horaires
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {activeFilters.includes("search") && (
            <Badge variant="secondary" className="px-3 py-1">
              Recherche: {searchQuery}
              <button className="ml-2" onClick={() => setSearchQuery("")}>
                ×
              </button>
            </Badge>
          )}
          {activeFilters.includes("time") &&
            selectedTimeRange.from &&
            selectedTimeRange.to && (
              <Badge variant="secondary" className="px-3 py-1">
                Horaires: {selectedTimeRange.from} - {selectedTimeRange.to}
                <button
                  className="ml-2"
                  onClick={() => setSelectedTimeRange({ from: null, to: null })}
                >
                  ×
                </button>
              </Badge>
            )}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-7"
          >
            Tout effacer
          </Button>
        </div>
      )}

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-500">
        {sortedRestaurants.length}{" "}
        {sortedRestaurants.length === 1
          ? "restaurant trouvé"
          : "restaurants trouvés"}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Restaurant cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRestaurants.length > 0 ? (
              sortedRestaurants.map((restaurant) => (
                <Link
                  href={`/client/restaurant/${restaurant._id}`}
                  key={restaurant._id}
                >
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
                        <h3 className="font-semibold text-lg">
                          {restaurant.nom}
                        </h3>
                        <div className="flex items-center bg-amber-50 px-2 py-1 rounded-md">
                          <Star className="h-4 w-4 text-amber-500 mr-1" />
                          <span className="text-sm font-medium">
                            {" "}
                            {restaurant.averageScore}
                          </span>
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

                      <p className="text-sm text-gray-600 line-clamp-2 mt-3  leading-relaxed max-w-full break-words overflow-hidden text-wrap">
                        {restaurant.description}
                      </p>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
                      {restaurant.categories
                        ?.slice(0, 3)
                        .map((category: any) => (
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
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-2">
                  Aucun restaurant trouvé
                </div>
                <p className="text-sm text-gray-500">
                  Essayez d'ajuster vos filtres ou votre recherche
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
