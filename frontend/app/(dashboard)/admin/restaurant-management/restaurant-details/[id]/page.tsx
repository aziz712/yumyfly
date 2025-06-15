"use client";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  User,
  Calendar,
  Loader2,
  AlertTriangle,
  Building,
  Trash,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import useClientStore from "@/store/useClientStore";
import { useAvisStore } from "@/store/useAvisStore";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import React from "react";

type RestaurantPageProps = any & {
  params: {
    id: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};
export default function RestaurantPublicPage({ params }: RestaurantPageProps) {
  const { id } = React.use(params) as { id: string };
  const {
    avis,
    loading,
    fetchAvisForRestaurant,
    deleteAvis,
    error: avisErrorfetch,
  } = useAvisStore();
  const router = useRouter();
  const { getRestaurantById, restaurant, isLoading, error } = useClientStore();

  useEffect(() => {
    const fetchData = async () => {
      await getRestaurantById(id);
    };
    fetchData();
  }, [getRestaurantById]);
  useEffect(() => {
    fetchAvisForRestaurant(id);
  }, []);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Actif</Badge>;

      case "blocked":
        return <Badge className="bg-red-500 hover:bg-red-600">Bloqué</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">
          Chargement des détails du restaurant...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">
          Erreur lors du chargement du restaurant
        </h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => getRestaurantById(id)}>Essayer à nouveau</Button>
      </div>
    );
  }
  //handle delete my avis
  const handleDeleteAvis = async (avisId: string) => {
    try {
      await deleteAvis(avisId);
    } catch (error) {
      toast.error("Une erreur est survenue lors de la soumission de l'avis.");
    }
  };
  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Building className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-bold mb-2">Restaurant non trouvé</h3>
        <p className="text-muted-foreground mb-4">
          Le restaurant que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <Button onClick={() => router.push("/admin/restaurant-management")}>
          Retour aux restaurants
        </Button>
      </div>
    );
  }

  const owner =
    typeof restaurant.proprietaire === "object"
      ? restaurant.proprietaire
      : null;

  return (
    <div className="py-4 lg:p-1 space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/admin/restaurant-management")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Détails du restaurant</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="relative h-64">
            <Image
              src={
                process.env.NEXT_PUBLIC_APP_URL +
                (restaurant?.images?.[0] ?? "") ||
                "/placeholder.svg?height=256&width=768"
              }
              alt={restaurant.nom}
              fill
              className="object-cover"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              {owner && getStatusBadge(owner.statut)}
            </div>
          </div>

          <CardHeader>
            <CardTitle className="text-2xl">{restaurant.nom}</CardTitle>
            {restaurant.description && (
              <CardDescription className="text-gray-700 leading-relaxed max-w-full break-words overflow-hidden text-wrap">
                {restaurant.description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs defaultValue="info">
              <TabsList className="flex flex-wrap my-4">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="hours">Horaires d'ouverture</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="avis">avis</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {restaurant.adresse && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium">Address</h3>
                        <p className="text-muted-foreground">
                          {restaurant.adresse}
                        </p>
                      </div>
                    </div>
                  )}

                  {restaurant.telephone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium">Phone</h3>
                        <p className="text-muted-foreground">
                          {restaurant.telephone}
                        </p>
                      </div>
                    </div>
                  )}

                  {restaurant.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium">Email</h3>
                        <p className="text-muted-foreground">
                          {restaurant.email}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Créé</h3>
                      <p className="text-muted-foreground">
                        {formatDate(restaurant.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="hours" className="mt-4">
                {restaurant.workingHours &&
                  restaurant.workingHours.from &&
                  restaurant.workingHours.to ? (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Horaires de travail</h3>
                      <p className="text-muted-foreground">
                        {restaurant.workingHours.from} -{" "}
                        {restaurant.workingHours.to}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Aucune information sur les horaires de travail disponible.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="images" className="mt-4">
                {restaurant.images && restaurant.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {restaurant.images.map((image: string, index: number) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-md overflow-hidden"
                      >
                        <Image
                          src={
                            process.env.NEXT_PUBLIC_APP_URL + image ||
                            "/placeholder.svg?height=200&width=200"
                          }
                          alt={`${restaurant.nom} image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Aucune image supplémentaire disponible.
                  </p>
                )}
              </TabsContent>
              <TabsContent value="avis" className="mt-4">
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Avis des clients</h2>
                  {avis.map((review) => (
                    <div
                      key={review._id}
                      className="bg-white m-1 p-3 border-2 rounded-2xl border-gray-200"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={
                                review.client?.photoProfil
                                  ? process.env.NEXT_PUBLIC_APP_URL +
                                  review.client.photoProfil
                                  : "/placeholder.svg?height=96&width=96"
                              }
                              alt="Profile"
                            />
                            <AvatarFallback className="text-lg">
                              {review.client?.nom}
                            </AvatarFallback>
                          </Avatar>
                          <Link
                            href={`
                            /admin/profile/${review.client?._id}
                            `}
                            className="hover:text-blue-500"
                          >
                            {" "}
                            <h3>{review.client?.nom || "Anonymous"}</h3>
                          </Link>

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
                          {
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteAvis(review._id)}
                                className="h-8 w-8 text-red-500 hover:text-red-700"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </>
                          }
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
          </CardContent>
        </Card>

        <Card className="!h-fit">
          <CardHeader>
            <CardTitle>Informations sur le propriétaire</CardTitle>
            <CardDescription>
              Détails sur le propriétaire du restaurant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 h-auto">
            {owner ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    {owner.photoProfil ? (
                      <Image
                        src={
                          owner.photoProfil
                            ? owner.photoProfil.startsWith("http")
                              ? owner.photoProfil
                              : process.env.NEXT_PUBLIC_APP_URL + owner.photoProfil
                            : "/placeholder.svg"
                        }
                        alt={`${owner.prenom} ${owner.nom}`}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {owner.prenom} {owner.nom}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getStatusBadge(owner.statut)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Email
                    </h4>
                    <p>{owner.email}</p>
                  </div>

                  {owner.telephone && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Téléphone
                      </h4>
                      <p>{owner.telephone}</p>
                    </div>
                  )}

                  {owner.adresse && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Adresse
                      </h4>
                      <p>{owner.adresse}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={() => router.push(`/admin/profile/${owner._id}`)}
                >
                  Voir le profil du propriétaire
                </Button>
              </>
            ) : (
              <div className="text-center py-6">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-medium mb-1">
                  Aucune information sur le propriétaire
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ce restaurant n'a pas de coordonnées de propriétaire
                  disponibles.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/restaurant-management")}
                >
                  Retour aux restaurants
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
