"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImagePlus, Loader2, Save, Video, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import usePlatsStore from "@/store/usePlatsStore";
import useRestaurantStore from "@/store/useRestaurantStore";

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
  tags: z.string().optional(),
  disponible: z.boolean().default(true),
});

export default function CreatePlatForm() {
  const router = useRouter();
  const { createPlat, isLoading } = usePlatsStore();
  const { categories, getAllCategories } = useRestaurantStore();

  const [activeTab, setActiveTab] = useState("general");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredientsList, setIngredientsList] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [tagsList, setTagsList] = useState<string[]>([]);
  // Initialize form
  const form = useForm<any>({
    resolver: zodResolver(platFormSchema),
    defaultValues: {
      nom: "",
      description: "",
      prix: 0,
      categorie: "",
      ingredients: "",
      tags: "",
      disponible: true,
    },
  });

  const fetchCategories = async () => {
    try {
      await getAllCategories();
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Initialize ingredients list from form value if it exists
    const initialIngredients = form.getValues("ingredients");
    const initialTags = form.getValues("tags");
    if (initialIngredients) {
      setIngredientsList(
        initialIngredients
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      );
    }
    if (initialTags) {
      setTagsList(
        initialTags
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      );
    }
  }, [form]);

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

  // Handle video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Create preview URLs for the new files
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));

      // Update state with new files and preview URLs
      setVideoFiles((prev) => [...prev, ...newFiles]);
      setVideoPreviews((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  // Remove image from preview
  const removeImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index]);

    // Remove the image and its preview URL from state
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove video from preview
  const removeVideo = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(videoPreviews[index]);

    // Remove the video and its preview URL from state
    setVideoFiles((prev) => prev.filter((_, i) => i !== index));
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: any) => {
    console.log("Form values:", values);
    // Validate that at least one image is uploaded
    if (imageFiles.length === 0) {
      toast.error("Veuillez télécharger au moins une image");
      setActiveTab("images");
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
      formData.append("disponible", values.disponible.toString());

      // Append ingredients as array
      if (ingredientsList.length > 0) {
        formData.append("ingredients", JSON.stringify(ingredientsList));
      }
      // Append ingredients as array
      if (tagsList.length > 0) {
        formData.append("tags", JSON.stringify(ingredientsList));
      }
      // Append all images - using "images" as the field name to match backend expectations
      imageFiles.forEach((image) => {
        formData.append("images", image);
      });

      // Append all videos - using "videos" as the field name to match backend expectations
      videoFiles.forEach((video) => {
        formData.append("videos", video);
      });

      console.log("Form data:", formData);

      // Submit the form data
      const success = await createPlat(formData);
      if (success) {
        toast.success("Plat créé avec succès");
        // Clean up object URLs
        imagePreviews.forEach(URL.revokeObjectURL);
        videoPreviews.forEach(URL.revokeObjectURL);
        router.push("/restaurant/menu-managemnt");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Une erreur est survenue lors de la création du plat");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-none rounded-none">
      <CardHeader>
        <CardTitle className="text-2xl">Ajouter un nouveau plat</CardTitle>
        <CardDescription>
          Créez un nouveau plat pour votre menu. Ajoutez des images, des vidéos,
          une description et des ingrédients.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="my-4 py-4"
        >
          <TabsList className="grid grid-cols-1 w-full mb-6 md:grid-cols-3 ">
            <TabsTrigger value="general">Informations générales</TabsTrigger>
            <TabsTrigger value="images">
              Images ({imageFiles.length})
            </TabsTrigger>
            <TabsTrigger value="videos">
              Vidéos ({videoFiles.length})
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="general" className="mt-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Plat Name */}
                    <FormField
                      control={form.control}
                      name="nom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du plat</FormLabel>
                          <FormControl>
                            <Input placeholder="Couscous Royal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Price */}
                    <FormField
                      control={form.control}
                      name="prix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
                              />
                              <span className="ml-2">DT</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Category */}
                    <FormField
                      control={form.control}
                      name="categorie"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catégorie</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une catégorie" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category._id}
                                  value={category._id}
                                >
                                  {category.nom}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Availability */}
                    <FormField
                      control={form.control}
                      name="disponible"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Disponibilité</FormLabel>
                            <FormDescription>
                              Indiquez si ce plat est disponible à la commande
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Ingredients */}
                    <FormField
                      control={form.control}
                      name="ingredients"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Ingrédients</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                placeholder="Ajouter un ingrédient..."
                                value={ingredientInput}
                                onChange={(e) =>
                                  setIngredientInput(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    ingredientInput.trim()
                                  ) {
                                    e.preventDefault();
                                    const newIngredients = [
                                      ...ingredientsList,
                                      ingredientInput.trim(),
                                    ];
                                    setIngredientsList(newIngredients);
                                    field.onChange(newIngredients.join(","));
                                    setIngredientInput("");
                                  }
                                }}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                if (ingredientInput.trim()) {
                                  const newIngredients = [
                                    ...ingredientsList,
                                    ingredientInput.trim(),
                                  ];
                                  setIngredientsList(newIngredients);
                                  field.onChange(newIngredients.join(","));
                                  setIngredientInput("");
                                }
                              }}
                            >
                              Ajouter ingredient
                            </Button>
                          </div>
                          {ingredientsList.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {ingredientsList.map((ingredient, index) => (
                                <div className="bg-gray-100 flex items-center rounded-sm">
                                  <Badge
                                    key={`${ingredient}-${index}`}
                                    variant="secondary"
                                    className="mr-3"
                                  >
                                    {ingredient}
                                  </Badge>
                                  <X
                                    className="h-3 w-3 cursor-pointer bg-black rounded-full text-white"
                                    onClick={() => {
                                      const newIngredients =
                                        ingredientsList.filter(
                                          (_, i) => i !== index
                                        );
                                      setIngredientsList(newIngredients);
                                      field.onChange(newIngredients.join(","));
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          <FormDescription>
                            Ajoutez vos ingrédients un par un
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Tags */}
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Tags</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                placeholder="Ajouter des tags..."
                                value={tagsInput}
                                onChange={(e) => setTagsInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && tagsInput.trim()) {
                                    e.preventDefault();
                                    const newTag = tagsInput.trim();
                                    if (!tagsList.includes(newTag)) {
                                      const newTags = [...tagsList, newTag];
                                      setTagsList(newTags);
                                      field.onChange(newTags.join(","));
                                      setTagsInput("");
                                    } else {
                                      toast.error("Ce tag existe déjà");
                                    }
                                  }
                                }}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                if (tagsInput.trim()) {
                                  const newTag = tagsInput.trim();
                                  if (!tagsList.includes(newTag)) {
                                    const newTags = [...tagsList, newTag];
                                    setTagsList(newTags);
                                    field.onChange(newTags.join(","));
                                    setTagsInput("");
                                  } else {
                                    toast.error("Ce tag existe déjà");
                                  }
                                }
                              }}
                            >
                              Ajouter tag
                            </Button>
                          </div>
                          {tagsList.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {tagsList.map((tag, index) => (
                                <div className="bg-gray-100 flex items-center rounded-sm">
                                  <X
                                    className="h-3 w-3 cursor-pointer bg-black rounded-full text-white"
                                    onClick={() => {
                                      // Remove the tag at the specified index
                                      const newTags = tagsList.filter(
                                        (_, i) => i !== index
                                      );
                                      setTagsList(newTags); // Update the local state
                                      field.onChange(newTags.join(",")); // Update the form state
                                    }}
                                  />
                                  <Badge
                                    key={`${tag}-${crypto.randomUUID()}`}
                                    variant="secondary"
                                    className="flex items-center gap-1"
                                  >
                                    {tag}cscscs
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                          <FormDescription>
                            Ajoutez vos tags un par un
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Décrivez votre plat, sa préparation, ses saveurs..."
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="images" className="mt-8">
                <div className="space-y-6">
                  {/* New Images Upload */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Ajouter des images
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
                  </div>

                  {/* Image Preview Gallery */}
                  {imagePreviews.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Images à ajouter ({imagePreviews.length})
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imagePreviews.map((url, index) => (
                          <div
                            key={`image-${index}`}
                            className="relative group"
                          >
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
                              onClick={() => removeImage(index)}
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
              </TabsContent>

              <TabsContent value="videos" className="mt-8">
                <div className="space-y-6">
                  {/* New Videos Upload */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Ajouter des vidéos
                    </h3>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <label
                        htmlFor="video-upload"
                        className="flex flex-col items-center justify-center cursor-pointer"
                      >
                        <Video className="h-12 w-12 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium mb-1">
                          Cliquez pour télécharger des vidéos
                        </span>
                        <span className="text-xs text-muted-foreground">
                          MP4, MOV, AVI jusqu&apos;à 50MB
                        </span>
                        <input
                          id="video-upload"
                          type="file"
                          accept="video/*"
                          multiple
                          className="hidden"
                          onChange={handleVideoUpload}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Video Preview Gallery */}
                  {videoPreviews.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Vidéos à ajouter ({videoPreviews.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {videoPreviews.map((url, index) => (
                          <div
                            key={`video-${index}`}
                            className="relative group"
                          >
                            <div className="aspect-video relative rounded-md overflow-hidden border bg-gray-100">
                              <video
                                src={url}
                                controls
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Badge className="absolute top-1 left-1 bg-green-500">
                              Nouveau
                            </Badge>
                            <button
                              type="button"
                              onClick={() => removeVideo(index)}
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
              </TabsContent>

              <div className="mt-6 flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isSubmitting || isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Créer le plat
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
