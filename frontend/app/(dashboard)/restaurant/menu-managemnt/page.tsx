"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit, Eye, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import PlatsTableSkeleton from "@/components/restaurant/menu-management/plats-table-skeleton";
import usePlatsStore from "@/store/usePlatsStore";
import useRestaurantStore from "@/store/useRestaurantStore";

interface Category {
  _id: string;
  nom: string;
  description: string;
  image: string;
  restaurant: string;
}

export default function PlatsTable() {
  const {
    plats,
    filteredPlats,
    getAllPlats,
    filterPlatsByName,
    filterPlatsByCategory,
    togglePlatStatus,
    deletePlat,
    isLoading,
  } = usePlatsStore();
  const { categories, getAllCategories } = useRestaurantStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [platToDelete, setPlatToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await getAllPlats();
      await getAllCategories();
    };
    loadData();
  }, [getAllPlats, getAllCategories]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterPlatsByName(value);
  };

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    filterPlatsByCategory(value);
  };

  // Handle toggle availability
  const handleToggleStatus = async (platId: string) => {
    await togglePlatStatus(platId);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (platId: string) => {
    setPlatToDelete(platId);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!platToDelete) return;

    setIsDeleting(true);
    try {
      const success = await deletePlat(platToDelete);
      if (success) {
        setIsDeleteDialogOpen(false);
        setPlatToDelete(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Format price to display with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "TND",
    }).format(price);
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string | Category) => {
    if (typeof categoryId === "string") {
      const category = categories.find((cat) => cat._id === categoryId);
      return category ? category.nom : "Catégorie inconnue";
    } else {
      return categoryId.nom;
    }
  };

  return (
    <Card className="border-none rounded-none min-h-screen">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle className="text-2xl">Gestion des plats</CardTitle>
          <CardDescription>Gérez les plats de votre restaurant</CardDescription>
        </div>
        <Button asChild>
          <Link href="/restaurant/menu-managemnt/create">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un plat
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un plat..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <PlatsTableSkeleton />
        ) : filteredPlats.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Catégorie
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlats.map((plat) => (
                  <TableRow key={plat._id}>
                    <TableCell>
                      <div className="relative h-10 w-10 rounded-md overflow-hidden">
                        <Image
                          src={
                            process.env.NEXT_PUBLIC_APP_URL + plat.images[0] ||
                            "/placeholder.svg?height=40&width=40" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg"
                          }
                          alt={plat.nom}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/restaurant/menu-managemnt/${plat._id}`}
                        className="hover:text-blue-500 cursor-pointer"
                      >
                        {" "}
                        {plat.nom}
                      </Link>
                    </TableCell>
                    <TableCell>{formatPrice(plat.prix)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getCategoryName(plat.categorie)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant={plat.disponible ? "default" : "secondary"}
                      >
                        {plat.disponible ? "Disponible" : "Indisponible"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/restaurant/menu-managemnt/${plat._id}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Voir
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/restaurant/menu-managemnt/${plat._id}/edit`}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(plat._id)}
                          >
                            {plat.disponible
                              ? "Marquer indisponible"
                              : "Marquer disponible"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(plat._id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">Aucun plat trouvé</p>
            {searchTerm || selectedCategory !== "all" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  getAllPlats();
                }}
              >
                Effacer les filtres
              </Button>
            ) : (
              <Button asChild>
                <Link href="/restaurant/menu-managemnt/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter votre premier plat
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Êtes-vous sûr de vouloir supprimer ce plat ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le plat sera définitivement
              supprimé de votre menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={isDeleting}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-red-400 cursor-pointer"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
