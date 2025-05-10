"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import useRestaurantStore from "@/store/useRestaurantStore";

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

export default function DeleteCategoryDialog({
  isOpen,
  onClose,
  category,
}: {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
}) {
  const { deleteCategory, isLoading } = useRestaurantStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteCategory(category._id);
      if (success) {
        toast.success("Catégorie supprimée avec succès");
        onClose();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(
        "Une erreur est survenue lors de la suppression de la catégorie"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Êtes-vous sûr de vouloir supprimer cette catégorie ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            La suppression de la catégorie &quot;{category.nom}&quot; entraînera
            également la suppression de tous les plats associés à cette
            catégorie. Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting || isLoading}
            className="text-white bg-red-500 cursor-pointer hover:bg-red-600/50"
          >
            {isDeleting || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              "Supprimer"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
