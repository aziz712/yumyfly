"use client";

import type React from "react";
import Image from "next/image";
import { MapPin, Phone, Mail, Eye, MoreHorizontal } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface RestaurantCardProps {
  restaurant: Restaurant;
  getStatusBadge: (status: string) => React.ReactNode;
  onViewDetails: (id: string) => void;
  onStatusChange: (restaurant: Restaurant) => void;
}
export default function RestaurantCard({
  restaurant,
  getStatusBadge,

  onViewDetails,
  onStatusChange,
}: RestaurantCardProps) {
  const owner =
    typeof restaurant.proprietaire === "object"
      ? restaurant.proprietaire
      : null;
  console.log({ restaurant });
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image
          src={
            process.env.NEXT_PUBLIC_APP_URL +
              (restaurant.images?.[0] ??
                "/placeholder.svg?height=300&width=500") ||
            "/placeholder.svg?height=300&width=500"
          }
          alt={restaurant.nom}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {owner && getStatusBadge(owner.statut)}
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">
          <Link
            href={`/admin/restaurant-management/restaurant-details/${restaurant._id}`}
            className="hover:text-blue-500"
          >
            {restaurant.nom}
          </Link>
        </CardTitle>
        {restaurant.description && (
          <CardDescription className="line-clamp-2">
            {restaurant.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-2 pb-2">
        {restaurant.adresse && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-sm">{restaurant.adresse}</span>
          </div>
        )}

        {restaurant.telephone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm">{restaurant.telephone}</span>
          </div>
        )}

        {restaurant.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm">{restaurant.email}</span>
          </div>
        )}

        {owner && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium mb-1">Owner</h4>
            <p className="text-sm">
              {owner.prenom} {owner.nom} ({owner.email})
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => onViewDetails(restaurant._id)}
        >
          <Eye className="h-4 w-4" />
          Voir les détails{" "}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Plus d'options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStatusChange(restaurant)}>
              Changer le statut du propriétaire
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
