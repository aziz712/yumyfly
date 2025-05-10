"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, Phone, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import useRestaurantStore from "@/store/useRestaurantStore";
import usePlatsStore from "@/store/usePlatsStore";
export default function MyRestaurantPage() {
  const {
    ownerProfile,
    restaurant,
    categories,
    getOwnerProfile,
    checkRestaurantDataCompleted,
    getAllCategories,
    error,
  } = useRestaurantStore();
  const { getAllPlats, isLoading, plats } = usePlatsStore();

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [hasRestaurant, setHasRestaurant] = useState(false);
  console.log({ ownerProfile, restaurant, categories, plats });
  useEffect(() => {
    const loadData = async () => {
      await getOwnerProfile();
      const hasCompletedRestaurant = await checkRestaurantDataCompleted();
      setHasRestaurant(hasCompletedRestaurant);

      if (hasCompletedRestaurant) {
        await getAllCategories();
        await getAllPlats();
      }

      setIsDataLoaded(true);
    };

    loadData();
  }, [getOwnerProfile, checkRestaurantDataCompleted, getAllCategories]);

  if (!isDataLoaded) {
    return <RestaurantPageSkeleton />;
  }
  console.log({ ownerProfile, restaurant, categories });
  if (!hasRestaurant || restaurant === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-muted flex items-center justify-center">
          <Plus className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-3">
          Vous n&apos;avez pas encore créé votre restaurant
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Pour commencer à gérer votre restaurant et recevoir des commandes,
          veuillez compléter les informations de votre établissement.
        </p>
        <Button asChild size="lg">
          <Link href="/restaurant/restaurant-managemnt/create-restaurant">
            Créer mon restaurant
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Restaurant Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{restaurant?.nom}</h1>
            <div className="flex items-center mt-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{restaurant?.adresse}</span>
            </div>
          </div>
          <Button className="mt-4 md:mt-0" asChild>
            <Link href="/restaurant/restaurant-managemnt/update-restaurant">
              Modifier les informations
            </Link>
          </Button>
        </div>

        {/* Restaurant Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center">
              <Phone className="h-5 w-5 mr-3 text-primary" />
              <div>
                <p className="text-sm font-medium">Téléphone</p>
                <p className="text-lg">{restaurant?.telephone}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center">
              <Clock className="h-5 w-5 mr-3 text-primary" />
              <div>
                <p className="text-sm font-medium">Horaires d&apos;ouverture</p>
                <p className="text-lg">
                  {restaurant?.workingHours.from} -{" "}
                  {restaurant?.workingHours.to}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center">
              <Info className="h-5 w-5 mr-3 text-primary" />
              <div>
                <p className="text-sm font-medium">Propriétaire</p>
                <p className="text-lg">
                  {ownerProfile?.user?.nom} {ownerProfile?.user?.prenom}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <div className="bg-muted/50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-3">
            À propos de notre restaurant
          </h2>
          <p className="text-gray-600 whitespace-pre-line  leading-relaxed max-w-full break-words overflow-hidden text-wrap">
            {restaurant?.description}
          </p>
        </div>
      </div>

      {/* Tabs for Gallery, Dishes, and Categories */}
      <Tabs defaultValue="gallery" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="gallery">Galerie</TabsTrigger>
          <TabsTrigger value="dishes">Plats</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
        </TabsList>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="mt-0">
          <h2 className="text-2xl font-bold mb-6">Galerie de photos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurant?.images && restaurant.images.length > 0 ? (
              restaurant.images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-video relative rounded-lg overflow-hidden"
                >
                  <Image
                    src={
                      process.env.NEXT_PUBLIC_APP_URL + image ||
                      "/placeholder.svg?height=300&width=500"
                    }
                    alt={`Restaurant image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">Aucune image disponible</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Dishes Tab */}
        <TabsContent value="dishes" className="mt-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Nos plats</h2>
            <Button asChild>
              <Link href="/restaurant/menu-managemnt">Gérer les plats</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plats.map((dish) => (
              <Card key={dish._id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <Image
                    src={
                      process.env.NEXT_PUBLIC_APP_URL + dish.images[0] ||
                      "/placeholder.svg"
                    }
                    alt={dish.nom}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{dish.nom}</h3>

                  <p className="text-primary font-medium">{dish.prix} DT</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Catégories</h2>
            <Button asChild>
              <Link href="/restaurant/categories-management">
                Gérer les catégories
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <Card key={category._id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <Image
                      src={
                        process.env.NEXT_PUBLIC_APP_URL + category.image ||
                        "/placeholder.svg?height=200&width=400"
                      }
                      alt={category.nom}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{category.nom}</h3>
                    <p className="text-gray-600 whitespace-pre-line  leading-relaxed max-w-full break-words overflow-hidden text-wrap">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">
                  Aucune catégorie disponible
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/restaurant/restaurant-managemnt/categories/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une catégorie
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RestaurantPageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-10 w-48 mt-4 md:mt-0" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>

        <Skeleton className="h-40 w-full mb-8" />
      </div>

      <Skeleton className="h-12 w-full mb-8" />
      <Skeleton className="h-8 w-48 mb-6" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}
