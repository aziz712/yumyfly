"use client";

import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RestaurantGroup } from "@/store/useCartStore";

interface RestaurantOrderSummaryProps {
  restaurantGroup: RestaurantGroup;
  total: number;
  serviceFee: number;
  grandTotal: number;
  address: string;
  setAddress: (address: string) => void;
  note: string;
  setNote: (restaurantId: string, note: string) => void;
  coordinates: { lat: number | null; lng: number | null };
  setCoordinates: (coords: { lat: number | null; lng: number | null }) => void;
  onCheckout: (restaurantId: string) => void;
  isCheckoutLoading: boolean;
  loadingRestaurantId: string | null;
}

export function RestaurantOrderSummary({
  restaurantGroup,
  total,
  serviceFee,
  grandTotal,
  address,
  setAddress,
  note,
  setNote,
  coordinates,
  setCoordinates,
  onCheckout,
  isCheckoutLoading,
  loadingRestaurantId,
}: RestaurantOrderSummaryProps) {
  const isLoading = loadingRestaurantId === restaurantGroup.restaurantId;

  return (
    <Card className="bg-[#fff2e7] border-[#fc8019]">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#fc8019] font-bold text-xl">
          Commande: {restaurantGroup.restaurantName}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Note Section */}
        <div>
          <h3 className="text-sm font-medium text-[#fc8019] mb-2">
            Note pour {restaurantGroup.restaurantName}
          </h3>
          <Textarea
            placeholder="Instructions spéciales, allergies, etc."
            className="h-20 bg-white"
            value={note}
            onChange={(e) =>
              setNote(restaurantGroup.restaurantId, e.target.value)
            }
          />
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Sous-total</span>
            <span>{total.toFixed(2)} DT</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Frais de service et livraison</span>
            <span>+{serviceFee.toFixed(2)} DT</span>
          </div>

          <Separator />

          <div className="flex justify-between font-bold text-lg pt-2">
            <span>Total</span>
            <span className="text-orange-500">{grandTotal.toFixed(2)} DT</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg"
          onClick={() => onCheckout(restaurantGroup.restaurantId)}
          disabled={isLoading || !address}
        >
          {isLoading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Traitement...
            </>
          ) : (
            "Commander maintenant"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
