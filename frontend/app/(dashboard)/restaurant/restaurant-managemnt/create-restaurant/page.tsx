"use client";

import type React from "react";

import { useState } from "react";
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

export default function CreateRestaurant() {
  const router = useRouter();
  const { completeRestaurantInformation, isLoading, error } =
    useRestaurantStore();
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
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

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Create preview URLs for the new files
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));

      // Update state with new files and preview URLs
      setUploadedImages((prev) => [...prev, ...newFiles]);
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  // Remove image from preview
  const removeImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);

    // Remove the image and its preview URL from state
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Validate that at least one image is uploaded
    if (uploadedImages.length === 0) {
      toast.error("Veuillez télécharger au moins une image");
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

      // Append all images
      uploadedImages.forEach((image) => {
        formData.append("newImages", image);
      });

      // Submit the form data
      const success = await completeRestaurantInformation(formData);

      if (success) {
        toast.success("Restaurant créé avec succès");
        router.push("/restaurant"); // Redirect to restaurant page
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Une erreur est survenue lors de la création du restaurant");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="">
      <Card className="border-none rounded-none">
        <CardHeader>
          <CardTitle className="text-2xl">Créer votre restaurant</CardTitle>
          <CardDescription>
            Remplissez les informations ci-dessous pour créer votre restaurant
            et commencer à recevoir des commandes.
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

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <FormLabel>Images du restaurant</FormLabel>
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
                        PNG, JPG, JPEG jusqu&apos;à 5MB (minimum 1 image)
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
                  <FormDescription className="mt-2">
                    Téléchargez des photos de votre restaurant, de
                    l&apos;intérieur, de la façade, etc.
                  </FormDescription>

                  {/* Image Preview Gallery */}
                  {previewUrls.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">
                        Aperçu des images ({previewUrls.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square relative rounded-md overflow-hidden border">
                              <Image
                                src={url || "/placeholder.svg"}
                                alt={`Preview ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
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
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Créer mon restaurant
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
