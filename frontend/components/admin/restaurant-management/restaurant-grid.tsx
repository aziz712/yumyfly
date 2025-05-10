"use client";

import type React from "react";
import { MapPin } from "lucide-react";

import RestaurantCard from "@/components/admin/restaurant-management/restaurant-card";
// Define Restaurant interface
interface Restaurant {
  _id: string;
  nom: string;
  description?: string;
  adresse?: string;
  telephone?: string;
  email?: string;

  images?: string[];
  horaires?: Record<string, { ouverture: string; fermeture: string }>;
  proprietaire:
    | string
    | {
        _id: string;
        nom?: string;
        prenom?: string;
        email: string;
        telephone?: string;
        statut: "pending" | "active" | "blocked";
      };
  createdAt: string;
  updatedAt: string;
}

interface RestaurantGridProps {
  restaurants: Restaurant[];
  getStatusBadge: (status: string) => React.ReactNode;
  onViewDetails: (id: string) => void;
  onStatusChange: (restaurant: Restaurant) => void;
}
export default function RestaurantGrid({
  restaurants,
  getStatusBadge,
  onViewDetails,
  onStatusChange,
}: RestaurantGridProps) {
  if (restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-gray-100 p-6 mb-4">
          <MapPin className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">Aucun restaurant trouvé</h3>
        <p className="text-muted-foreground max-w-md">
          Aucun restaurant ne correspond à vos filtres actuels. Essayez
          d'ajuster vos critères de recherche ou d'ajouter un nouveau
          propriétaire.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant._id}
          restaurant={restaurant}
          getStatusBadge={getStatusBadge}
          onViewDetails={onViewDetails}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
