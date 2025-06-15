"use client";
import { useCartStore } from "@/store/useCartStore";
import { calculatePriceFromPromotion, isPromotionActive as isPlatPromotionActiveChecker } from "@/services/clientPromotion"; // Renamed to avoid conflict
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";

// Define a more specific type for the plat prop
interface Plat {
  _id: string;
  nom: string;
  prix: number;
  disponible: boolean;
  images: string[];
  categorie?: { nom: string };
  restaurant?: { _id: string; nom: string };  
  description: string;
  ingredients: string[];
  promotion?: {
    pourcentage: number;
    prixApresReduction: number;
    dateDebut: string;
    dateFin: string;
    isPromotionActive: boolean;
  };
}

interface PlatCardProps {
  plat: Plat;
}

export default function PlatCard({ plat }: PlatCardProps) {
  const { addItem, restaurantGroups } = useCartStore();

  // Determine if the promotion is active directly from the plat object
  const activePromotion = plat.promotion && plat.promotion.isPromotionActive && isPlatPromotionActiveChecker(plat.promotion.dateDebut, plat.promotion.dateFin)
    ? plat.promotion
    : null;

  const displayPrice = activePromotion
    ? activePromotion.prixApresReduction
    : plat.prix;

  // Add to cart function
  const handleAddToCart = () => {
    // Use the pre-calculated prixApresReduction if promotion is active
    const priceToAdd = activePromotion
      ? activePromotion.prixApresReduction
      : plat.prix;
     //addItem({ ...plat, prix: priceToAdd, promotion: activePromotion || undefined });

    addItem({
      ...plat,
      prix: priceToAdd,
      promotion: activePromotion || undefined,
      quantity: 1,
      categorie: plat.categorie?.nom || "Catégorie",
      restaurant: plat.restaurant, 
    });

    // Show success toast
    toast.success(`${plat.nom} ajouté au panier`, {
      description: "Vous pouvez modifier la quantité dans le panier",
      action: {
        label: "Voir le panier",
        onClick: () => {
          window.location.href = "/client/cart";
        },
      },
    });
  };

  // Check if item is in cart
  const isInCart = (platId: string) => {
    return restaurantGroups.some((group) =>
      group.items.some((item) => item._id === platId)
    );
  };

  // Get item quantity in cart
  const getCartItemQuantity = (platId: string) => {
    for (const group of restaurantGroups) {
      const item = group.items.find((item) => item._id === platId);
      if (item) return item.quantity;
    }
    return 0;
  };

  return (
    <Card
      key={plat._id}
      className="overflow-hidden transition-all duration-200 h-full hover:shadow-lg flex flex-col"
    >
      {/* Image Section */}
      <div className="relative pt-[75%]">
        <Image
          width={400}
          height={400}
          src={
            (plat.images && plat.images.length > 0
              ? process.env.NEXT_PUBLIC_APP_URL + plat.images[0]
              : "/placeholder.svg") || "/placeholder.svg"
          }
          alt={plat.nom || 'Plat image'}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          {activePromotion && (
            <Badge className="bg-red-500 hover:bg-red-600 mr-2">
              Promo! -{activePromotion.pourcentage}%
            </Badge>
          )}
          <Badge className="bg-orange-500 hover:bg-orange-600">
            {activePromotion && (
              <span className="text-xs line-through mr-1">
                {plat.prix.toFixed(2)}DT
              </span>
            )}
            {displayPrice.toFixed(2)}DT
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <CardContent  className="p-4 flex flex-col flex-grow space-y-4">
        {/* Title and Category */}
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-gray-500 mb-1">
              {plat.categorie?.nom || "Catégorie"}
            </div>
            <h3 className="font-semibold text-lg line-clamp-2">{plat.nom}</h3>
          </div>
        </div>

        {/* Restaurant and Delivery Time */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="flex items-center">
            <MapPin size={14} className="mr-1" />
            <span className="truncate max-w-[120px]">
              {plat.restaurant?.nom || "Restaurant"}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 leading-relaxed max-w-full break-words overflow-hidden text-wrap line-clamp-3">
          {plat.description}
        </p>

        {/* Ingredients Checklist */}
        <div>
          <h4 className="text-sm font-medium mb-2">Ingrédients:</h4>
          {plat.ingredients.length === 0 && (
            <>
              <span>aucun ingrédient fourni</span>
            </>
          )}
          {plat.ingredients && plat.ingredients.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {plat.ingredients.map((ingredient: any, index: any) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-sm"
                >
                  <div className="h-4 w-4 rounded-sm border flex items-center justify-center bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span>{ingredient}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer Section */}
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Link href={`/client/plats/${plat._id}`} className="cursor-pointer">
          <Button
            variant="outline"
            className="cursor-pointer transition-all ease-in-out duration-200 hover:bg-black hover:text-white"
          >
            Détails
          </Button>
        </Link>

        {/* Add to Cart Button */}
        <div className="flex items-center">
          {isInCart(plat._id) && (
            <Badge variant="outline" className="mr-2">
              {getCartItemQuantity(plat._id)}
            </Badge>
          )}
          <Button
            size="icon"
            className={`rounded-full ${isInCart(plat._id)
              ? "bg-green-500 hover:bg-green-600"
              : "bg-orange-500 hover:bg-orange-600"
              } text-white transition-all ease-in-out duration-200 hover:scale-110`}
            onClick={handleAddToCart}
            disabled={!plat.disponible} // Assuming plat has a 'disponible' property
          >
            {isInCart(plat._id) ? (
              <Check size={18} />
            ) : (
              <Plus size={18} />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
