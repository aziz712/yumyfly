"use client";
import { useState, useEffect, Suspense } from "react";
import useClientStore from "@/store/useClientStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { Search, SlidersHorizontal, ShoppingCart } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PlatCard from "@/components/client/cards/plat-card";
import { format } from "date-fns";

export default function AllDisponiblePlatsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AllDisponiblePlats />
    </Suspense>
  );
}

function AllDisponiblePlats() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    getAllDisponiblePlats,
    getAllCategories,
    plats,
    categories,
    isLoading,
  } = useClientStore();
  const { getTotalItemCount } = useCartStore();

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("newest");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      await getAllDisponiblePlats();
      await getAllCategories();
    };
    fetchData();
  }, [getAllDisponiblePlats, getAllCategories]);

  // Sync searchQuery with URL query string
  useEffect(() => {
    const initialSearchQuery = searchParams.get("search") || "";
    setSearchQuery(initialSearchQuery);
  }, [searchParams]);

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
    // Filter by category
    let categoryMatch = true;
    if (selectedCategories.length > 0) {
      categoryMatch =
        typeof plat?.categorie === "object" &&
        selectedCategories.includes(plat.categorie._id);
    }
    return nameMatch && priceMatch && dateMatch && categoryMatch;
  });

  // Sort filtered plats
  const sortedPlats = [...filteredPlats].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return a.prix - b.prix;
      case "price-high":
        return b.prix - a.prix;
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

  // Update active filters
  useEffect(() => {
    const newActiveFilters = [];
    if (searchQuery) newActiveFilters.push("search");
    if (priceRange[0] > 0 || priceRange[1] < 500)
      newActiveFilters.push("price");
    if (dateRange.from && dateRange.to) newActiveFilters.push("date");
    if (selectedCategories.length > 0) newActiveFilters.push("category");
    setActiveFilters(newActiveFilters);
  }, [searchQuery, priceRange, dateRange, selectedCategories]);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 500]);
    setDateRange({ from: undefined, to: undefined });
    setSelectedCategories([]);
    setSortOption("newest");
    setActiveFilters([]);
    router.replace("/client/plats/all");
  };

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      router.replace(`/client/plats/all?search=${encodeURIComponent(value)}`);
    } else {
      router.replace("/client/plats/all");
    }
  };

  // Get total cart items count
  const cartItemsCount = getTotalItemCount();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Tous les plats disponibles</h1>
        {/* Cart button with counter */}
        <Link href="/client/cart">
          <Button variant="outline" className="relative">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Panier
            {cartItemsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white">
                {cartItemsCount}
              </Badge>
            )}
          </Button>
        </Link>
      </div>
      {/* Search and filters bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Que voulez-vous manger aujourd'hui..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
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
              <SelectItem value="newest">Plus récent</SelectItem>
              <SelectItem value="oldest">Plus ancien</SelectItem>
              <SelectItem value="price-low">Prix: croissant</SelectItem>
              <SelectItem value="price-high">Prix: décroissant</SelectItem>
            </SelectContent>
          </Select>
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
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
                <SheetDescription>
                  Appliquez des filtres pour trouver exactement ce que vous
                  cherchez
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 px-4 space-y-6">
                {/* Categories filter */}
                <div className="space-y-4">
                  <h3 className="font-medium">Catégories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <div
                        key={category._id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`category-${category._id}`}
                          checked={selectedCategories.includes(category._id)}
                          onCheckedChange={() => toggleCategory(category._id)}
                        />
                        <Label htmlFor={`category-${category._id}`}>
                          {category.nom}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Price range filter */}
                <div className="space-y-4">
                  <h3 className="font-medium">Fourchette de prix</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, 500]}
                      max={500}
                      step={2}
                      value={priceRange}
                      onValueChange={(value) =>
                        setPriceRange(value as [number, number])
                      }
                      className="my-6"
                    />
                    <div className="flex justify-between">
                      <span>{priceRange[0]}DT</span>
                      <span>{priceRange[1]} DT</span>
                    </div>
                  </div>
                </div>
              </div>
              <SheetFooter>
                <Button onClick={resetFilters} variant="outline">
                  Réinitialiser les filtres
                </Button>
                <SheetTrigger asChild>
                  <Button>Appliquer les filtres</Button>
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
              <button className="ml-2" onClick={() => handleSearchChange("")}>
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
          {activeFilters.includes("category") && (
            <Badge variant="secondary" className="px-3 py-1">
              Catégories: {selectedCategories.length}
              <button
                className="ml-2"
                onClick={() => setSelectedCategories([])}
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
        {sortedPlats.length} {sortedPlats.length === 1 ? "plat" : "plats"}{" "}
        trouvé{sortedPlats.length !== 1 ? "s" : ""}
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
            {sortedPlats.length > 0 ? (
              sortedPlats.map((plat) => <PlatCard key={plat._id} plat={plat} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-2">Aucun plat trouvé</div>
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
