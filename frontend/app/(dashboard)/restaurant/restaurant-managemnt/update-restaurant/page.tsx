"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Clock,
  ImagePlus,
  Loader2,
  MapPin,
  Phone,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import useRestaurantStore from "@/store/useRestaurantStore";

// Form validation schema
const formSchema = z.object({
  nom: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  adresse: z
    .string()
    .min(5, { message: "L'adresse doit contenir au moins 5 caractères" }),
  telephone: z
    .string()
    .min(8, {
      message: "Le numéro de téléphone doit contenir au moins 8 caractères",
    })
    .regex(/^[0-9+\s()-]+$/, { message: "Format de téléphone invalide" }),
  description: z.string().min(10, {
    message: "La description doit contenir au moins 10 caractères",
  }),
  workingHoursFrom: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Format d'heure invalide (HH:MM)",
  }),
  workingHoursTo: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Format d'heure invalide (HH:MM)",
  }),
});

export default function UpdateRestaurant() {
  const router = useRouter();
  const {
    restaurant,
    getOwnerProfile,
    updateRestaurantInformation,
    isLoading,
    error,
  } = useRestaurantStore();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "",
      adresse: "",
      telephone: "",
      description: "",
      workingHoursFrom: "08:00",
      workingHoursTo: "22:00",
    },
  });

  // Fetch restaurant data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!restaurant) {
          await getOwnerProfile();
        }

        if (restaurant) {
          // Set form values
          form.reset({
            nom: restaurant.nom || "",
            adresse: restaurant.adresse || "",
            telephone: restaurant.telephone || "",
            description: restaurant.description || "",
            workingHoursFrom: restaurant.workingHours?.from || "08:00",
            workingHoursTo: restaurant.workingHours?.to || "22:00",
          });

          // Set existing images
          setExistingImages(restaurant.images || []);
        }
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
        toast.error("Erreur lors du chargement des données du restaurant");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, [restaurant, getOwnerProfile, form]);

  // Handle new image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Create preview URLs for the new files
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));

      // Update state with new files and preview URLs
      setNewImages((prev) => [...prev, ...newFiles]);
      setNewImagePreviews((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  // Remove existing image
  const removeExistingImage = (imageUrl: string) => {
    setImagesToRemove((prev) => [...prev, imageUrl]);
  };

  // Remove new image
  const removeNewImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newImagePreviews[index]);

    // Remove the image and its preview URL from state
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Validate that at least one image will remain after update
    const remainingExistingImages = existingImages.filter(
      (img) => !imagesToRemove.includes(img)
    );
    if (remainingExistingImages.length === 0 && newImages.length === 0) {
      toast.error("Votre restaurant doit avoir au moins une image");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object for submission
      const formData = new FormData();
      formData.append("nom", values.nom);
      formData.append("adresse", values.adresse);
      formData.append("telephone", values.telephone);
      formData.append("description", values.description);
      formData.append("workingHours[from]", values.workingHoursFrom);
      formData.append("workingHours[to]", values.workingHoursTo);

      // Add images to keep (not in imagesToRemove)
      const imagesToKeep = existingImages.filter(
        (img) => !imagesToRemove.includes(img)
      );
      formData.append("images", JSON.stringify(imagesToKeep));

      // Append all new images
      newImages.forEach((image) => {
        formData.append("newImages", image);
      });

      // Submit the form data
      const success = await updateRestaurantInformation(formData);

      if (success) {
        toast.success("Restaurant mis à jour avec succès");
        router.push("/restaurant"); // Redirect to restaurant page
      }
    } catch (error) {
      console.error("Error updating restaurant:", error);
      toast.error(
        "Une erreur est survenue lors de la mise à jour du restaurant"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPageLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div>
      <Card className="border-none rounded-none">
        <CardHeader>
          <CardTitle className="text-2xl">Modifier votre restaurant</CardTitle>
          <CardDescription>
            Mettez à jour les informations de votre restaurant pour garder votre
            profil à jour.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Restaurant Name */}
                <FormField
                  control={form.control}
                  name="nom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du restaurant</FormLabel>
                      <FormControl>
                        <Input placeholder="Le Gourmet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="telephone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de téléphone</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                          <Input placeholder="+212 612345678" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="adresse"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                          <Input
                            placeholder="123 Rue de la Gastronomie, Casablanca"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Working Hours */}
                <div className="md:col-span-2">
                  <div className="flex items-center mb-2">
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    <FormLabel>Horaires d&apos;ouverture</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="workingHoursFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>De</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="workingHoursTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>À</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez votre restaurant, sa cuisine, son ambiance..."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Une bonne description aide vos clients à mieux connaître
                        votre restaurant.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Existing Images */}
                <div className="md:col-span-2">
                  <FormLabel>Images existantes</FormLabel>
                  {existingImages.length > 0 ? (
                    <div className="mt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {existingImages.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <div
                              className={`aspect-square relative rounded-md overflow-hidden border ${
                                imagesToRemove.includes(imageUrl)
                                  ? "opacity-30"
                                  : ""
                              }`}
                            >
                              <Image
                                src={
                                  process.env.NEXT_PUBLIC_APP_URL + imageUrl ||
                                  "/placeholder.svg"
                                }
                                alt={`Restaurant image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                imagesToRemove.includes(imageUrl)
                                  ? setImagesToRemove((prev) =>
                                      prev.filter((img) => img !== imageUrl)
                                    )
                                  : removeExistingImage(imageUrl)
                              }
                              className={`absolute top-1 right-1 p-1 rounded-full transition-opacity ${
                                imagesToRemove.includes(imageUrl)
                                  ? "bg-green-500/70 text-white opacity-100"
                                  : "bg-black/70 text-white opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              {imagesToRemove.includes(imageUrl) ? (
                                <span className="h-4 w-4 flex items-center justify-center">
                                  ↺
                                </span>
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                      {imagesToRemove.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {imagesToRemove.length} image(s) marquée(s) pour
                          suppression
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">
                      Aucune image existante
                    </p>
                  )}
                </div>

                {/* Upload New Images */}
                <div className="md:col-span-2 mt-4">
                  <FormLabel>Ajouter de nouvelles images</FormLabel>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
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

                  {/* New Image Preview Gallery */}
                  {newImagePreviews.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">
                        Nouvelles images ({newImagePreviews.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {newImagePreviews.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square relative rounded-md overflow-hidden border">
                              <Image
                                src={url || "/placeholder.svg"}
                                alt={`New image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <CardFooter className="px-0 pt-6 flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-1/2"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-1/2"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour en cours...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Mettre à jour
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="md:col-span-2">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="md:col-span-2">
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="md:col-span-2">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="md:col-span-2">
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="aspect-square w-full" />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
