"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  MapPin,
  Phone,
  Star,
  ChevronLeft,
  Share2,
  Trash,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import useClientStore from "@/store/useClientStore";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useAvisStore } from "@/store/useAvisStore";
import useAuthStore from "@/store/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import PlatCard from "@/components/client/cards/plat-card";
export default function RestaurantPage() {
  const { getRestaurantById, restaurant, isLoading } = useClientStore();
  const { user, isAuthenticated } = useAuthStore();
  const {
    avis,
    loading,
    error,
    fetchAvisForRestaurant,
    deleteAvis,
    updateAvis,
  } = useAvisStore();
  const params = useParams();
  const { id } = params as { id: string };
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { createAvis } = useAvisStore();

  // State for creating avis
  const [note, setNote] = useState<number>(5); // Default rating
  const [commentaire, setCommentaire] = useState<string>("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedAvis, setSelectedAvis] = useState<any>(null);
  const [updateNote, setUpdateNote] = useState(5);
  const [updateCommentaire, setUpdateCommentaire] = useState("");
  useEffect(() => {
    fetchAvisForRestaurant(id);
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      await getRestaurantById(id);
    };
    fetchData();
  }, [id, getRestaurantById]);

  useEffect(() => {
    if (
      restaurant?.categories &&
      restaurant.categories.length > 0 &&
      !activeCategory
    ) {
      setActiveCategory(restaurant.categories[0]._id);
    }
  }, [restaurant, activeCategory]);
  console.log({ restaurant });
  // Check if restaurant is open
  const isRestaurantOpen = () => {
    if (!restaurant?.workingHours) return false;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const [fromHour, fromMinute] = restaurant.workingHours.from
      .split(":")
      .map(Number);
    const [toHour, toMinute] = restaurant.workingHours.to
      .split(":")
      .map(Number);
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const fromTimeInMinutes = fromHour * 60 + fromMinute;
    const toTimeInMinutes = toHour * 60 + toMinute;
    return (
      currentTimeInMinutes >= fromTimeInMinutes &&
      currentTimeInMinutes <= toTimeInMinutes
    );
  };

  // Filter dishes by category
  const getDishesByCategory = (categoryId: string) => {
    if (!restaurant?.plats) return [];
    return restaurant.plats.filter((plat) => plat?.categorie === categoryId);
  };

  // Handle Create Avis
  const handleCreateAvis = async () => {
    if (!restaurant) return;

    try {
      await createAvis({
        avisType: "restaurant",
        restaurant: restaurant._id,
        note,
        commentaire,
      });
      toast.success("Votre avis a été soumis avec succès !");
      setNote(5); // Reset note to default
      setCommentaire(""); // Clear comment
    } catch (error) {
      toast.error("Une erreur est survenue lors de la soumission de l'avis.");
    }
  };
  //handle delete my avis
  const handleDeleteMyAvis = async (avisId: string) => {
    try {
      await deleteAvis(avisId);
    } catch (error) {
      toast.error("Une erreur est survenue lors de la soumission de l'avis.");
    }
  };
  const handleOpenUpdateModal = (avis: any) => {
    setSelectedAvis(avis);
    setUpdateNote(avis.note);
    setUpdateCommentaire(avis.commentaire || "");
    setIsUpdateModalOpen(true);
  };
  const handleUpdateAvis = async () => {
    if (!selectedAvis) return;

    try {
      await updateAvis(selectedAvis._id, {
        note: updateNote,
        commentaire: updateCommentaire,
      });
      await fetchAvisForRestaurant(id);
      setIsUpdateModalOpen(false);
    } catch (error) {
      toast.error("Une erreur est survenue lors de la mise à jour de l'avis.");
    }
  };

  if (isLoading) {
    return <RestaurantPageSkeleton />;
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: restaurant?.nom,
          text: restaurant?.description,
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (!restaurant && !isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Restaurant non trouvé</h1>
        <p className="mb-6">
          Le restaurant que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <Button asChild>
          <Link href="/client/restaurants">
            Retour à la liste des restaurants
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link href="/client/restaurant" className="flex items-center">
            <ChevronLeft className="mr-1 h-5 w-5" />
            Retour aux restaurants
          </Link>
        </Button>
      </div>

      {/* Restaurant Header */}
      <div className="mb-8">
        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6">
          <Image
            src={
              process.env.NEXT_PUBLIC_APP_URL +
                (restaurant?.images?.[0] ?? "/placeholder.svg") ||
              "/placeholder.svg?height=400&width=1200" ||
              "/placeholder.svg"
            }
            alt={restaurant?.nom || "restaurant image"}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <Badge
              className={`mb-3 ${
                isRestaurantOpen()
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isRestaurantOpen() ? "Ouvert" : "Fermé"}
            </Badge>
            <h1 className="text-3xl font-bold text-white mb-2">
              {restaurant?.nom}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{restaurant?.adresse}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                <span>{restaurant?.telephone}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {restaurant?.workingHours
                    ? `${restaurant?.workingHours.from} - ${restaurant?.workingHours.to}`
                    : "Horaires non disponibles"}
                </span>
              </div>
              <div className="flex items-center bg-amber-500/90 px-2 py-1 rounded-md">
                <Star className="h-4 w-4 mr-1 text-white" />
                <span className="font-medium">{restaurant?.averageScore}</span>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-white/80 hover:bg-white"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5 text-gray-700" />
            </Button>
          </div>
        </div>
        {/* Restaurant Description */}
        <div className="bg-muted/30 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-semibold mb-3">
            À propos de ce restaurant
          </h2>
          <p className="text-gray-600 whitespace-pre-line leading-relaxed max-w-full break-words overflow-hidden text-wrap">
            {restaurant?.description}
          </p>
        </div>
      </div>

      {/* Tabs for Menu, Gallery, Info, and Avis */}
      <Tabs defaultValue="menu" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="gallery">Galerie</TabsTrigger>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="avis">Avis</TabsTrigger>
        </TabsList>

        {/* Menu Tab */}
        <TabsContent value="menu" className="mt-0">
          {/* Categories */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              {restaurant?.categories.map((category: any) => (
                <Button
                  key={category._id}
                  variant={
                    activeCategory === category._id ? "default" : "outline"
                  }
                  className={`rounded-full ${
                    activeCategory === category._id
                      ? "bg-orange-500 hover:bg-orange-600"
                      : ""
                  }`}
                  onClick={() => setActiveCategory(category._id)}
                >
                  {category.nom}
                </Button>
              ))}
            </div>
          </div>
          {/* Dishes by Category */}
          {activeCategory && (
            <div>
              <h3 className="text-xl font-semibold mb-4">
                {
                  restaurant?.categories.find(
                    (c: any) => c._id === activeCategory
                  )?.nom
                }
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getDishesByCategory(activeCategory).length > 0 ? (
                  getDishesByCategory(activeCategory).map((plat) => (
                    <PlatCard plat={plat} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">
                      Aucun plat disponible dans cette catégorie
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="mt-0">
          <h2 className="text-2xl font-bold mb-6">Galerie de photos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurant?.images && restaurant?.images.length > 0 ? (
              restaurant.images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-video relative rounded-lg overflow-hidden"
                >
                  <Image
                    width={200}
                    height={200}
                    src={
                      process.env.NEXT_PUBLIC_APP_URL + image ||
                      "/placeholder.svg?height=300&width=500" ||
                      "/placeholder.svg"
                    }
                    alt={`Restaurant image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">Aucune image disponible</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="mt-0">
          <h2 className="text-2xl font-bold mb-6">Informations</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Coordonnées</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Adresse</p>
                    <p className="text-gray-600">{restaurant?.adresse}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <p className="text-gray-600">{restaurant?.telephone}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Horaires d'ouverture
              </h3>
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">Tous les jours</p>
                  <p className="text-gray-600">
                    {restaurant?.workingHours
                      ? `${restaurant.workingHours.from} - ${restaurant?.workingHours.to}`
                      : "Horaires non disponibles"}
                    {restaurant?.workingHours?.to ?? "Horaires non disponibles"}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Catégories</h3>
              <div className="flex flex-wrap gap-2">
                {restaurant?.categories.map((category: any) => (
                  <Badge
                    key={category._id}
                    className="bg-orange-100 text-orange-800 hover:bg-orange-200"
                  >
                    {category.nom}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Avis Tab */}
        <TabsContent value="avis" className="mt-0">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Laisser un avis</h2>
            <div>
              <Label htmlFor="note">Note:</Label>
              <Slider
                id="note"
                min={1}
                max={5}
                step={1}
                value={[note]}
                onValueChange={(value) => setNote(value[0])}
                className="my-4"
              />
              <p className="text-sm text-gray-500">Note actuelle: {note}/5</p>
            </div>
            <div>
              <Label htmlFor="commentaire">Commentaire:</Label>
              <Textarea
                id="commentaire"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Partagez votre expérience..."
                rows={4}
                className="mt-2"
              />
            </div>
            <Button onClick={handleCreateAvis} className="w-full">
              Soumettre l'avis
            </Button>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Avis des clients</h2>
            {avis.map((review) => (
              <div
                key={review._id}
                className="bg-white m-1 p-3 border-2 rounded-2xl border-gray-200"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <h3>{review.client?.nom || "Anonymous"}</h3>
                    <div className="flex items-center">
                      {Array.from({ length: review.note }, (_, index) => (
                        <Star
                          className="h-4 w-4 text-yellow-500 fill-yellow-500"
                          key={index}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {((isAuthenticated && user?._id === review.client?._id) ||
                      user?.role === "admin") && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenUpdateModal(review)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMyAvis(review._id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <p>{review.commentaire}</p>
              </div>
            ))}
            {avis.length === 0 && (
              <div>il n'y a pas d'avis sur ce restaurant</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      {/* Update Avis Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier votre avis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="update-note">Note:</Label>
              <Slider
                id="update-note"
                min={1}
                max={5}
                step={1}
                value={[updateNote]}
                onValueChange={(value) => setUpdateNote(value[0])}
                className="my-4"
              />
              <p className="text-sm text-gray-500">Note: {updateNote}/5</p>
            </div>
            <div>
              <Label htmlFor="update-commentaire">Commentaire:</Label>
              <Textarea
                id="update-commentaire"
                value={updateCommentaire}
                onChange={(e) => setUpdateCommentaire(e.target.value)}
                placeholder="Partagez votre expérience..."
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateModalOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleUpdateAvis}>Mettre à jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RestaurantPageSkeleton() {
  return (
    <div className="container mx-auto py-6 px-4">
      <Skeleton className="h-6 w-40 mb-6" />
      <div className="mb-8">
        <Skeleton className="h-64 md:h-80 w-full rounded-xl mb-6" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
      <Skeleton className="h-12 w-full mb-8" />
      <div className="mb-6">
        <Skeleton className="h-10 w-full max-w-md mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
