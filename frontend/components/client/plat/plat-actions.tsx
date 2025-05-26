"use client";

import { useState } from "react";
import { Heart, ShoppingCart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import useAuthStore from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

// calculatePriceFromPromotion is not needed here if prixApresReduction is used from plat.promotion
// import { calculatePriceFromPromotion } from "@/services/clientPromotion";

interface PlatActionsProps {
  plat: any; // Ideally this should be typed with PlatWithPromotion
  onLike: () => Promise<void>;
  isLiking: boolean;
}

export default function PlatActions({
  plat,
  onLike,
  isLiking,
}: PlatActionsProps) {
  const { user } = useAuthStore((state) => state);
  const { addItem, updateQuantity, restaurantGroups } = useCartStore();
  const [isLiked, setIsLiked] = useState(
    plat.likes?.includes(user?._id) || false
  );
  const [quantity, setQuantity] = useState(1);

  // Get restaurant ID from plat
  const platRestaurantId =
    typeof plat.restaurant === "object" ? plat.restaurant._id : plat.restaurant;

  // Find if this item is in any restaurant group
  const findItemInCart = () => {
    for (const group of restaurantGroups) {
      const item = group.items.find((item) => item._id === plat._id);
      if (item) {
        return { item, group };
      }
    }
    return null;
  };

  const cartInfo = findItemInCart();
  const existingCartItem = cartInfo?.item;
  const existingQuantity = existingCartItem?.quantity || 0;

  const handleLike = async () => {
    setIsLiked(!isLiked);
    await onLike();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: plat.nom,
          text: plat.description,
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleAddToCart = () => {
    if (existingCartItem) {
      // Update quantity if already in cart
      updateQuantity(
        cartInfo!.group.restaurantId,
        plat._id,
        existingQuantity + quantity
      );
      toast.success(
        `Updated ${plat.nom} quantity in cart (${existingQuantity + quantity})`
      );
    } else {
      // Add new item to cart
      const activePromotion = plat.promotion && plat.promotion.isPromotionActive ? plat.promotion : null;
      const priceToAdd = activePromotion
        ? activePromotion.prixApresReduction // Use the pre-calculated price from plat.promotion
        : plat.prix;
      addItem({ ...plat, prix: priceToAdd });
      toast.success(`Added ${quantity} ${plat.nom} to cart`);
    }

    // Reset quantity selector after adding to cart
    setQuantity(1);
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center gap-2">
        <div className="flex border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-none"
            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <div className="flex items-center justify-center w-12">
            {quantity}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-none"
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </Button>
        </div>

        <Button
          className="flex-1 gap-2 bg-primary hover:bg-primary/90"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          {existingCartItem ? "Mettre à jour le panier" : "Ajouter au panier"}
        </Button>
      </div>

      {existingCartItem && (
        <div className="text-sm text-gray-500">
          Déjà dans le panier: {existingQuantity}{" "}
          {existingQuantity > 1 ? "items" : "item"}
        </div>
      )}

      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={isLiked ? "text-red-500" : ""}
                onClick={handleLike}
                disabled={isLiking}
              >
                <Heart className={isLiked ? "fill-red-500" : ""} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isLiked ? "Unlike" : "Like"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Partager</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
