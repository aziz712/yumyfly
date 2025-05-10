"use client";

import type React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ImagePlus, Trash2, X } from "lucide-react";

interface ImagesTabProps {
  existingImages: string[];
  setExistingImages: React.Dispatch<React.SetStateAction<string[]>>;
  imageFiles: File[];
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
  imagePreviews: string[];
  setImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ImagesTab({
  existingImages,
  setExistingImages,
  imageFiles,
  setImageFiles,
  imagePreviews,
  setImagePreviews,
}: ImagesTabProps) {
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Create preview URLs for the new files
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));

      // Update state with new files and preview URLs
      setImageFiles((prev) => [...prev, ...newFiles]);
      setImagePreviews((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  // Remove new image from preview
  const removeNewImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index]);

    // Remove the image and its preview URL from state
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Images existantes</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {existingImages.map((image, index) => (
              <div key={`existing-${index}`} className="relative group">
                <div className="aspect-square relative rounded-md overflow-hidden border">
                  <Image
                    src={
                      process.env.NEXT_PUBLIC_APP_URL + image ||
                      "/placeholder.svg"
                    }
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Images Upload */}
      <div>
        <h3 className="text-lg font-medium mb-2">
          Ajouter de nouvelles images
        </h3>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <ImagePlus className="h-12 w-12 text-muted-foreground mb-2" />
            <span className="text-sm font-medium mb-1">
              Cliquez pour télécharger des images
            </span>
            <span className="text-xs text-muted-foreground">
              PNG, JPG, JPEG jusqu&apos;à 5MB
            </span>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>
      </div>

      {/* New Image Previews */}
      {imagePreviews.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">
            Nouvelles images à ajouter
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {imagePreviews.map((url, index) => (
              <div key={`new-${index}`} className="relative group">
                <div className="aspect-square relative rounded-md overflow-hidden border">
                  <Image
                    src={url || "/placeholder.svg"}
                    alt={`Nouvelle image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <Badge className="absolute top-1 left-1 bg-green-500">
                  Nouveau
                </Badge>
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
