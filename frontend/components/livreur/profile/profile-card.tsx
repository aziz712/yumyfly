"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useLivreurStore from "@/store/useLivreurStore";

interface ProfileCardProps {
  user: any;
  livreur: any;
}

export function ProfileCard({ user, livreur }: ProfileCardProps) {
  const { toggleDisponibilite, isLoading } = useLivreurStore();

  const handleToggleDisponibilite = async () => {
    await toggleDisponibilite();
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-green-400 to-teal-500" />
      <CardContent className="relative p-6">
        <div className="absolute -top-12 left-6">
          <Avatar className="h-24 w-24 border-4 border-white">
            <AvatarImage
              src={user.photoProfil || "/placeholder.svg?height=96&width=96"}
              alt={`${user.prenom} ${user.nom}`}
            />
            <AvatarFallback className="text-2xl">
              {user.prenom?.[0]}
              {user.nom?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="mt-14 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              {user.prenom} {user.nom}
            </h2>
            <p className="text-gray-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant={livreur.disponibilite ? "default" : "destructive"}
              >
                {livreur.disponibilite ? "Disponible" : "Indisponible"}
              </Badge>
              {livreur.restaurantId && (
                <Badge variant="outline">{livreur.restaurantId.nom}</Badge>
              )}
            </div>
          </div>
          <Button
            onClick={handleToggleDisponibilite}
            disabled={isLoading}
            variant={livreur.disponibilite ? "destructive" : "default"}
          >
            {livreur.disponibilite
              ? "Passer indisponible"
              : "Passer disponible"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
