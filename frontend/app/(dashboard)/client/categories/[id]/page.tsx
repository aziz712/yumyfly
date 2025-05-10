"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import useClientStore from "@/store/useClientStore";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Heart,
  Plus,
  SlidersHorizontal,
  Check,
  MapPin,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "sonner";

export default function AllPlatsOfCategorie() {
  const { getAllDisponiblePlatsOfCategorie, plats, isLoading } =
    useClientStore();
  const params = useParams();
  const { id } = params as { id: string };
  const { addItem, restaurantGroups } = useCartStore();

  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Fetch data
  useEffect(() => {
    getAllDisponiblePlatsOfCategorie(id);
  }, [getAllDisponiblePlatsOfCategorie, id]);

  // Apply filters
  const filteredPlats = plats.filter((plat) => {
    // Filter by name
    const nameMatch = plat.nom
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Filter by price
    const priceMatch = plat.prix >= priceRange[0] && plat.prix <= priceRange[1];

    // Filter by date
    let dateMatch = true;
    if (dateRange.from && dateRange.to) {
      const platDate = new Date(plat.createdAt);
      dateMatch = platDate >= dateRange.from && platDate <= dateRange.to;
    }

    return nameMatch && priceMatch && dateMatch;
  });

  // Update active filters
  useEffect(() => {
    const newActiveFilters = [];
    if (searchQuery) newActiveFilters.push("search");
    if (priceRange[0] > 0 || priceRange[1] < 500)
      newActiveFilters.push("price");
    if (dateRange.from && dateRange.to) newActiveFilters.push("date");
    setActiveFilters(newActiveFilters);
  }, [searchQuery, priceRange, dateRange]);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 500]);
    setDateRange({ from: undefined, to: undefined });
    setActiveFilters([]);
  };

  // Parse ingredients from string to array
  const parseIngredients = (ingredientsStr: string) => {
    try {
      // Remove the outer array if it's a string representation of an array
      if (
        typeof ingredientsStr === "string" &&
        ingredientsStr.startsWith("[") &&
        ingredientsStr.endsWith("]")
      ) {
        const parsed = JSON.parse(ingredientsStr);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (error) {
      console.error("Error parsing ingredients:", error);
      return [];
    }
  };

  // Add to cart function
  const handleAddToCart = (plat: any) => {
    addItem(plat);

    // Show success toast
    toast.success(`${plat.nom} ajouté au panier`, {
      description: "Vous pouvez modifier la quantité dans le panier",
      action: {
        label: "Voir le panier",
        onClick: () => {
          window.location.href = "/client/cart";
        },
      },
    });
  };

  // Check if item is in cart
  const isInCart = (platId: string) => {
    return restaurantGroups.some((group) =>
      group.items.some((item) => item._id === platId)
    );
  };

  // Get item quantity in cart
  const getCartItemQuantity = (platId: string) => {
    for (const group of restaurantGroups) {
      const item = group.items.find((item) => item._id === platId);
      if (item) return item.quantity;
    }
    return 0;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-2xl font-semibold mb-4">
        Les plats de la catégorie:{" "}
        {(typeof plats[0]?.categorie === "object" &&
          plats[0]?.categorie?.nom) ||
          "Category"}
      </div>
      {/* Search and filters bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Qu'est-ce que tu veux manger aujourd'hui..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12 rounded-lg"
          />
        </div>

        <div className="flex gap-2">
          {/* Filters */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal size={18} />
                Filtres
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
                <SheetDescription>
                  Appliquez des filtres pour trouver exactement ce que vous
                  recherchez
                </SheetDescription>
              </SheetHeader>

              <div className="py-6 space-y-6">
                {/* Price range filter */}
                <div className="space-y-4">
                  <h3 className="font-medium">Gamme de prix</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, 500]}
                      max={500}
                      step={10}
                      value={priceRange}
                      onValueChange={(value) =>
                        setPriceRange(value as [number, number])
                      }
                      className="my-6"
                    />
                    <div className="flex justify-between">
                      <span>{priceRange[0]}DT</span>
                      <span>{priceRange[1]}DT</span>
                    </div>
                  </div>
                </div>

                {/* Date range filter */}
                <div className="space-y-4">
                  <h3 className="font-medium">Date d'ajout</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        {dateRange.from && dateRange.to
                          ? `${format(dateRange.from, "PP")} - ${format(
                              dateRange.to,
                              "PP"
                            )}`
                          : "Select date range"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => setDateRange(range as any)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <SheetFooter>
                <Button onClick={resetFilters} variant="outline">
                  Réinitialiser les filtres
                </Button>
                <SheetTrigger asChild>
                  <Button>Appliquer des filtres</Button>
                </SheetTrigger>
              </SheetFooter>
            </SheetContent>
          </Sheet>
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
          {activeFilters.includes("price") && (
            <Badge variant="secondary" className="px-3 py-1">
              Prix: {priceRange[0]}DT - {priceRange[1]}DT
              <button className="ml-2" onClick={() => setPriceRange([0, 500])}>
                ×
              </button>
            </Badge>
          )}
          {activeFilters.includes("date") && dateRange.from && dateRange.to && (
            <Badge variant="secondary" className="px-3 py-1">
              Date: {format(dateRange.from, "PP")} -{" "}
              {format(dateRange.to, "PP")}
              <button
                className="ml-2"
                onClick={() => setDateRange({ from: undefined, to: undefined })}
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
        {filteredPlats.length}{" "}
        {filteredPlats.length === 1 ? "article" : "articles"} trouvé
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Dish cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlats.length > 0 ? (
              filteredPlats.map((plat) => (
                <Card
                  key={plat._id}
                  className="overflow-hidden transition-all duration-200 hover:shadow-lg"
                >
                  <div className="relative pt-[75%]">
                    <Image
                      src={
                        process.env.NEXT_PUBLIC_APP_URL + plat.images[0] ||
                        "/placeholder.svg?height=200&width=300" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      height={100}
                      width={100}
                      alt={plat.nom}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <button className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white">
                      <Heart size={18} className="text-gray-500" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <Badge className="bg-orange-500 hover:bg-orange-600">
                        {plat.prix.toFixed(2)}DT
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          {typeof plat.categorie === "object" &&
                          plat.categorie?.nom
                            ? plat.categorie.nom
                            : "Catégorie"}
                        </div>
                        <h3 className="font-semibold text-lg">{plat.nom}</h3>
                      </div>
                      <div className="flex items-center bg-amber-50 px-2 py-1 rounded-md">
                        <span className="text-amber-500 mr-1">★</span>
                        <span className="text-sm font-medium">5.0</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1" />
                        <span className="truncate max-w-[120px]">
                          {typeof plat.restaurant === "object"
                            ? plat.restaurant.nom
                            : "Restaurant"}
                        </span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>20-30 min</span>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed max-w-full break-words overflow-hidden text-wrap">
                      {plat.description}
                    </p>

                    {/* Ingredients Checklist */}
                    {plat.ingredients && plat.ingredients.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium mb-2">
                          Ingrédients:
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {parseIngredients(plat.ingredients[0]).map(
                            (ingredient, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <div className="h-4 w-4 rounded-sm border flex items-center justify-center bg-primary/10">
                                  <Check className="h-3 w-3 text-primary" />
                                </div>
                                <span className="text-sm">{ingredient}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <Link href={`/client/plats/${plat._id}`}>
                      <Button variant="outline">Détails</Button>
                    </Link>

                    {/* Add to cart button with quantity indicator */}
                    <div className="flex items-center">
                      {isInCart(plat._id) && (
                        <Badge variant="outline" className="mr-2">
                          {getCartItemQuantity(plat._id)}
                        </Badge>
                      )}
                      <Button
                        size="icon"
                        className={`rounded-full ${
                          isInCart(plat._id)
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-orange-500 hover:bg-orange-600"
                        }`}
                        onClick={() => handleAddToCart(plat)}
                      >
                        <Plus size={18} />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-2">Aucun élément trouvé</div>
                <p className="text-sm text-gray-500">
                  Essayez d'ajuster vos filtres ou de rechercher
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
