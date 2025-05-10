"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-gray-100 p-6 rounded-full mb-6">
        <ShoppingCart className="h-12 w-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
      <p className="text-gray-500 mb-6 max-w-md">
        Ajoutez des articles à votre panier pour commencer votre commande.
      </p>
      <Link href="/client/plats/all">
        <Button className="bg-orange-500 hover:bg-orange-600">
          Parcourir les plats
        </Button>
      </Link>
    </div>
  );
}
