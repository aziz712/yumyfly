"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";

import { removePromotion } from "@/services/promotionService";

interface DeletePromotionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  promotion: any | null;
  onPromotionDeleted?: () => void;
}

export default function DeletePromotionDialog({
  isOpen,
  onClose,
  promotion,
  onPromotionDeleted,
}: DeletePromotionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!promotion) return;

    try {
      setIsDeleting(true);
      await removePromotion(promotion.plat._id);
      
      toast.success("Promotion supprimée avec succès");
      onClose();
      
      if (onPromotionDeleted) {
        onPromotionDeleted();
      }
    } catch (error: any) {
      console.error("Error deleting promotion:", error);
      toast.error(error.message || "Erreur lors de la suppression de la promotion");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!promotion) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la promotion</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer la promotion pour{" "}
            <span className="font-semibold">{promotion.plat.nom}</span> ?
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}