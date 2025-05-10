"use client";
import { useState, useEffect } from "react";

import React from "react";
import useRestaurantStore from "@/store/useRestaurantStore";
import usePlatsStore from "@/store/usePlatsStore";
import { Plus } from "lucide-react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
type Props = {};

export default function RestaurantProfileNotCompleted({}: Props) {
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
    };

    loadData();
  }, [getOwnerProfile, checkRestaurantDataCompleted, getAllCategories]);
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
}
