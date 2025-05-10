"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useClientStore from "@/store/useClientStore";
import { Search, ChevronRight, Clock, Utensils } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function AllCategories() {
  const { getAllCategories, categories, isLoading } = useClientStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort categories based on selected option
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "name-asc") {
      return a.nom.localeCompare(b.nom);
    } else if (sortBy === "name-desc") {
      return b.nom.localeCompare(a.nom);
    }
    return 0;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Catégories d'aliments</h1>
        <p className="text-muted-foreground">
          Découvrez notre délicieuse sélection de catégories alimentaires
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Rechercher des catégories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12 rounded-lg"
          />
        </div>

        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] h-12">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Le plus récent en premier</SelectItem>
              <SelectItem value="oldest">Le plus ancien First</SelectItem>
              <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6 text-sm text-gray-500">
        {sortedCategories.length}{" "}
        {sortedCategories.length === 1 ? "catégorie" : "catégories"} trouvée
      </div>

      {/* Categories grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCategories.length > 0 ? (
            sortedCategories.map((category) => (
              <Link
                href={`/client/categories/${category._id}`}
                key={category._id}
                className="group"
              >
                <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg group-hover:border-[#ff6900]">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      height={100}
                      width={100}
                      src={
                        (process.env.NEXT_PUBLIC_APP_URL || "") +
                          category.image ||
                        "/placeholder.svg?height=300&width=500"
                      }
                      alt={category.nom}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {new Date(category.createdAt).getTime() >
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime() ? (
                      <Badge className="absolute top-4 left-4 bg-white/90 text-black hover:bg-white/80">
                        <Clock size={14} className="mr-1" /> New
                      </Badge>
                    ) : null}
                  </div>
                  <CardContent className="p-6 flex flex-col h-[calc(100%-12rem)]">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {category.nom}
                      </h2>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
                      {category.description}
                    </p>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-sm text-muted-foreground">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary group-hover:translate-x-1 transition-transform"
                      >
                        Explorer <ChevronRight size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-2">Aucune catégorie trouvée</div>
              <p className="text-sm text-gray-500">
                Essayez d'ajuster votre recherche{" "}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
