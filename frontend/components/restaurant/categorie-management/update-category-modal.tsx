"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

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

// Form schema for category creation and update
const categoryFormSchema = z.object({
  nom: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  description: z.string().min(10, {
    message: "La description doit contenir au moins 10 caractères",
  }),
});

export default function UpdateCategoryModal({
  isOpen,
  onClose,
  category,
}: {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
}) {
  const { updateCategory, isLoading } = useRestaurantStore();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    category.image
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageChanged, setIsImageChanged] = useState(false);

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      nom: category.nom,
      description: category.description,
    },
  });

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // If there was a previous preview from a file upload (not the original image), revoke it
      if (imagePreview && isImageChanged) {
        URL.revokeObjectURL(imagePreview);
      }

      setImagePreview(URL.createObjectURL(file));
      setIsImageChanged(true);
    }
  };

  // Remove selected image and revert to original
  const removeImage = () => {
    if (imagePreview && isImageChanged) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(category.image);
    setIsImageChanged(false);
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof categoryFormSchema>) => {
    setIsSubmitting(true);

    try {
      // Create FormData object for submission
      const formData = new FormData();
      formData.append("nom", values.nom);
      formData.append("description", values.description);

      // Only append image if it was changed
      if (imageFile) {
        formData.append("categoryImage", imageFile);
      }

      // Submit the form data
      const success = await updateCategory(category._id, formData);

      if (success) {
        toast.success("Catégorie mise à jour avec succès");
        onClose();
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(
        "Une erreur est survenue lors de la mise à jour de la catégorie"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier la catégorie</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de la catégorie &quot;{category.nom}
            &quot;
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la catégorie</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-24" {...field} />
                  </FormControl>
                  <FormDescription>
                    Une description claire aide vos clients à comprendre le type
                    de plats dans cette catégorie.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Image de la catégorie</FormLabel>
              {imagePreview ? (
                <div className="mt-2 relative">
                  <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                    <Image
                      src={
                        process.env.NEXT_PUBLIC_APP_URL + imagePreview ||
                        "/placeholder.svg"
                      }
                      alt="Category preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                  <label
                    htmlFor="update-image-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium mb-1">
                      Cliquez pour télécharger une image
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, JPEG jusqu&apos;à 5MB
                    </span>
                    <input
                      id="update-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              )}
              <FormDescription className="mt-2">
                Choisissez une image représentative pour cette catégorie.
              </FormDescription>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoading}>
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
