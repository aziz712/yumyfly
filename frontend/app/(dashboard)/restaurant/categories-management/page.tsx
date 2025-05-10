"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Edit, Plus, Search, Trash2, X } from "lucide-react";

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
import CategoriesTableSkeleton from "@/components/restaurant/categorie-management/categories-table-skeleton";
import useRestaurantStore from "@/store/useRestaurantStore";
import CreateCategoryModal from "@/components/restaurant/categorie-management/create-category-modal";
import UpdateCategoryModal from "@/components/restaurant/categorie-management/update-category-modal";
import DeleteCategoryDialog from "@/components/restaurant/categorie-management/delete-category-modal";
import RestaurantProfileNotCompleted from "@/components/restaurant/restaurant-profile-not-completed";
// Category type from the store
interface Category {
  _id: string;
  nom: string;
  description: string;
  image: string;
  restaurant: string;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const { getAllCategories, categories, isLoading, error } =
    useRestaurantStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      await getAllCategories();
    };
    loadCategories();
  }, [getAllCategories]);

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Open update modal with selected category
  const handleUpdateClick = (category: Category) => {
    setSelectedCategory(category);
    setIsUpdateModalOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <RestaurantProfileNotCompleted />
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-2xl">Gestion des catégories</CardTitle>
            <CardDescription>
              Gérez les catégories de plats de votre restaurant
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une catégorie
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une catégorie..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <CategoriesTableSkeleton />
          ) : filteredCategories.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Description
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Date de création
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell>
                        <div className="relative h-10 w-10 rounded-md overflow-hidden">
                          <Image
                            src={
                              process.env.NEXT_PUBLIC_APP_URL +
                                category.image ||
                              "/placeholder.svg?height=40&width=40"
                            }
                            alt={category.nom}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {category.nom}
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs">
                        <p className="truncate">{category.description}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateClick(category)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(category)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Supprimer</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                Aucune catégorie trouvée
              </p>
              {searchTerm ? (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Effacer la recherche
                </Button>
              ) : (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter votre première catégorie
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Update Category Modal */}
      {selectedCategory && (
        <UpdateCategoryModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedCategory(null);
          }}
          category={selectedCategory}
        />
      )}

      {/* Delete Category Confirmation */}
      {categoryToDelete && (
        <DeleteCategoryDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setCategoryToDelete(null);
          }}
          category={categoryToDelete}
        />
      )}
    </div>
  );
}
