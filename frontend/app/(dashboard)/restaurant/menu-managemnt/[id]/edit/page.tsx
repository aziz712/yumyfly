"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import usePlatsStore from "@/store/usePlatsStore";
import useRestaurantStore from "@/store/useRestaurantStore";

import { GeneralInfoTab } from "@/components/restaurant/menu-management/update-plat/general-info-tab";
import { ImagesTab } from "@/components/restaurant/menu-management/update-plat/images-tab";
import { VideosTab } from "@/components/restaurant/menu-management/update-plat/videos-tab";

// Form validation schema
const platFormSchema = z.object({
  nom: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  description: z.string().min(10, {
    message: "La description doit contenir au moins 10 caractères",
  }),
  prix: z.coerce
    .number({ invalid_type_error: "Le prix doit être un nombre" })
    .positive({ message: "Le prix doit être positif" }),
  categorie: z.string({
    required_error: "Veuillez sélectionner une catégorie",
  }),
  ingredients: z.string().optional(),
  disponible: z.boolean().default(true).optional(),
});

export type PlatFormValues = z.infer<typeof platFormSchema>;

export default function EditPlatPage() {
  const params = useParams();
  const router = useRouter();
  const platId = params.id as string;

  const { currentPlat, getPlatById, updatePlat, isLoading } = usePlatsStore();
  const { categories, getAllCategories } = useRestaurantStore();

  const [activeTab, setActiveTab] = useState("general");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingVideos, setExistingVideos] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Initialize form
  const form = useForm<PlatFormValues>({
    resolver: zodResolver(platFormSchema),
    defaultValues: {
      nom: "",
      description: "",
      prix: 0,
      categorie: "",
      ingredients: "",
      disponible: true,
    },
  });

  // Fetch plat data and categories when page loads
  useEffect(() => {
    const fetchData = async () => {
      setIsPageLoading(true);
      try {
        await getAllCategories();
        const plat = await getPlatById(platId);
        if (plat) {
          // Reset existing media arrays
          setExistingImages(plat.images || []);
          setExistingVideos(plat.videos || []);

          // Reset form values
          form.reset({
            nom: plat.nom,
            description: plat.description,
            prix: plat.prix,
            categorie:
              typeof plat.categorie === "string"
                ? plat.categorie
                : plat.categorie._id,
            ingredients: plat.ingredients.join(", "),
            disponible: plat.disponible,
          });
        } else {
          toast.error("Plat non trouvé");
          router.push("/restaurant/menu-management");
        }
      } catch (error) {
        console.error("Error fetching plat:", error);
        toast.error("Erreur lors du chargement du plat");
        router.push("/restaurant/menu-management");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, [platId, getPlatById, getAllCategories, form, router]);

  // Handle form submission
  const onSubmit = async (values: PlatFormValues) => {
    // Validate that at least one image is present (either existing or new)
    if (existingImages.length === 0 && imageFiles.length === 0) {
      toast.error("Veuillez télécharger au moins une image");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object for submission
      const formData = new FormData();
      formData.append("nom", values.nom);
      formData.append("description", values.description);
      formData.append("prix", values.prix.toString());
      formData.append("categorie", values.categorie);
      formData.append("disponible", (values.disponible ?? true).toString());

      // Parse and append ingredients as array
      if (values.ingredients) {
        const ingredientsArray = values.ingredients
          .split(",")
          .map((item) => item.trim());
        ingredientsArray.forEach((ingredient, index) => {
          formData.append(`ingredients[${index}]`, ingredient);
        });
      }

      // Append existing images to keep
      existingImages.forEach((image, index) => {
        formData.append(`existingImages[${index}]`, image);
      });

      // Append existing videos to keep
      existingVideos.forEach((video, index) => {
        formData.append(`existingVideos[${index}]`, video);
      });

      // Append all new images
      imageFiles.forEach((image) => {
        formData.append("newImages", image);
      });

      // Append all new videos
      videoFiles.forEach((video) => {
        formData.append("newVideos", video);
      });
      console.log("FormData:", formData);
      // Submit the form data
      const success = await updatePlat(platId, formData);

      if (success) {
        toast.success("Plat mis à jour avec succès");

        // Clean up object URLs
        imagePreviews.forEach(URL.revokeObjectURL);
        videoPreviews.forEach(URL.revokeObjectURL);

        // Redirect back to the plats list
        router.push("/restaurant/menu-managemnt");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Une erreur est survenue lors de la mise à jour du plat");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Chargement du plat...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/restaurant/menu-managemnt">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste des plats
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modifier le plat</CardTitle>
          <CardDescription>
            Modifiez les informations, les images et les vidéos de votre plat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 mb-6">
              <TabsTrigger value="general">Informations générales</TabsTrigger>
              <TabsTrigger value="images">
                Images ({existingImages.length + imageFiles.length})
              </TabsTrigger>
              <TabsTrigger value="videos">
                Vidéos ({existingVideos.length + videoFiles.length})
              </TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <TabsContent value="general">
                  <GeneralInfoTab form={form} categories={categories} />
                </TabsContent>

                <TabsContent value="images">
                  <ImagesTab
                    existingImages={existingImages}
                    setExistingImages={setExistingImages}
                    imageFiles={imageFiles}
                    setImageFiles={setImageFiles}
                    imagePreviews={imagePreviews}
                    setImagePreviews={setImagePreviews}
                  />
                </TabsContent>

                <TabsContent value="videos">
                  <VideosTab
                    existingVideos={existingVideos}
                    setExistingVideos={setExistingVideos}
                    videoFiles={videoFiles}
                    setVideoFiles={setVideoFiles}
                    videoPreviews={videoPreviews}
                    setVideoPreviews={setVideoPreviews}
                  />
                </TabsContent>

                <div className="mt-6 flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/restaurant/menu-management")}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isLoading}>
                    {isSubmitting || isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mise à jour en cours...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
