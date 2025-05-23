"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useLivreurStore from "@/store/useLivreurStore";
import { ProfileCard } from "@/components/livreur/profile/profile-card";
import { UpdateProfileModal } from "@/components/livreur/profile/update-profile-modal";
import { ChangePasswordModal } from "@/components/livreur/profile/change-password-modal";
import { LivreurProfileSkeleton } from "@/components/livreur/profile/livreur-profile-skeleton";

export default function LivreurProfile() {
  const { livreurProfile, getProfile, isLoading, error } = useLivreurStore();

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  if (isLoading && !livreurProfile) {
    return <LivreurProfileSkeleton />;
  }

  if (error || !livreurProfile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
            <CardDescription>
              {error ||
                "Impossible de charger le profil. Veuillez vous reconnecter."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/login")}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <h1 className="text-3xl font-bold mb-8">Mon Profil Livreur</h1>

      <div className="grid grid-cols-1 gap-8 w-full">
        <ProfileCard
          user={livreurProfile.user}
          livreur={livreurProfile.livreur}
        />

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Informations</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Consultez et modifiez vos informations personnelles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Prénom</h3>
                    <p className="text-gray-700">
                      {livreurProfile.user.prenom || "Non renseigné"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Nom</h3>
                    <p className="text-gray-700">
                      {livreurProfile.user.nom || "Non renseigné"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Email</h3>
                    <p className="text-gray-700">{livreurProfile.user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Téléphone</h3>
                    <p className="text-gray-700">
                      {livreurProfile.user.telephone || "Non renseigné"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Adresse</h3>
                    <p className="text-gray-700">
                      {livreurProfile.user.adresse || "Non renseignée"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Statut</h3>
                    <p className="text-gray-700">
                      {livreurProfile.livreur.disponibilite
                        ? "Disponible"
                        : "Indisponible"}
                    </p>
                  </div>
                  {livreurProfile.livreur.restaurantId && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Restaurant</h3>
                      <p className="text-gray-700">
                        {livreurProfile.livreur.restaurantId.nom}
                      </p>
                    </div>
                  )}
                </div>
                <div className="pt-4">
                  <UpdateProfileModal
                    user={livreurProfile.user}
                    onProfileUpdated={() => getProfile()}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>
                  Gérez la sécurité de votre compte.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Mot de passe</h3>
                  <p className="text-gray-700">••••••••</p>
                </div>

                <div className="pt-4">
                  <ChangePasswordModal />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
