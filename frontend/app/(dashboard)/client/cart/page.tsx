"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
import { EmptyCart } from "@/components/cart/empty-cart";
import { CartItemsList } from "@/components/cart/cart-items-list";
import { RestaurantOrderSummary } from "@/components/cart/order-summary";
import { useCommandeStore } from "@/store/useCommandeStore";
import { AddressSelector } from "@/components/cart/address-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CartPage() {
  const {
    restaurantGroups,
    removeItem,
    updateQuantity,
    clearRestaurantItems,
    getRestaurantTotal,
    getServiceFee,
    getRestaurantGrandTotal,
  } = useCartStore();

  const { passCommande, isLoading } = useCommandeStore();
  const [address, setAddress] = useState("");
  const [restaurantNotes, setRestaurantNotes] = useState<
    Record<string, string>
  >({});
  const [loadingRestaurantId, setLoadingRestaurantId] = useState<string | null>(
    null
  );
  const [coordinates, setCoordinates] = useState<{
    lat: number | null;
    lng: number | null;
  }>({
    lat: null,
    lng: null,
  });
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

  // Check if cart is empty
  const isCartEmpty = restaurantGroups.length === 0;

  // Show address dialog if cart has items but no address
  useEffect(() => {
    if (!isCartEmpty && !address) {
      setIsAddressDialogOpen(true);
    }
  }, [isCartEmpty, address]);

  // Handle quantity change
  const handleQuantityChange = (
    restaurantId: string,
    itemId: string,
    newQuantity: number
  ) => {
    updateQuantity(restaurantId, itemId, newQuantity);
  };

  // Handle note change for a specific restaurant
  const handleNoteChange = (restaurantId: string, note: string) => {
    setRestaurantNotes((prev) => ({
      ...prev,
      [restaurantId]: note,
    }));
  };

  // Handle checkout for a specific restaurant
  const handleCheckout = async (restaurantId: string) => {
    // Validate address
    if (!address) {
      toast.error("Veuillez ajouter une adresse de livraison pour continuer");
      setIsAddressDialogOpen(true);
      return;
    }

    try {
      setLoadingRestaurantId(restaurantId);

      // Find the restaurant group
      const restaurantGroup = restaurantGroups.find(
        (group) => group.restaurantId === restaurantId
      );

      if (!restaurantGroup) {
        toast.error("Restaurant non trouvé dans le panier");
        return;
      }

      // Prepare order data with coordinates
      const orderData = {
        plats: restaurantGroup.items,
        address,
        note: restaurantNotes[restaurantId] || "",
        coordinates:
          coordinates.lat && coordinates.lng
            ? {
                latitude: coordinates.lat,
                longitude: coordinates.lng,
              }
            : null,
        total: getRestaurantGrandTotal(restaurantId),
        serviceFee: getServiceFee(),
        restaurant: restaurantId,
      };

      console.log("Order data:", orderData);

      // Pass the order data to the API through the store
      const success = await passCommande(orderData);
      if (success) {
        toast.success(
          `Votre commande de ${getRestaurantGrandTotal(restaurantId).toFixed(
            2
          )} DT a été envoyée.`
        );

        // Clear only this restaurant's items after successful checkout
        clearRestaurantItems(restaurantId);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        "Une erreur s'est produite lors de la commande. Veuillez réessayer."
      );
    } finally {
      setLoadingRestaurantId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center mb-6">
        <Link
          href="/client/plats/all"
          className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Retour</span>
        </Link>
        <h1 className="text-2xl font-bold">Votre Panier</h1>
      </div>

      {isCartEmpty ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Common Address Section */}
          <Card>
            <CardHeader>
              <CardTitle>Adresse de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressSelector
                address={address}
                setAddress={setAddress}
                coordinates={coordinates}
                setCoordinates={setCoordinates}
              />
            </CardContent>
          </Card>

          {/* Cart Items Section */}
          <CartItemsList
            restaurantGroups={restaurantGroups}
            onUpdateQuantity={handleQuantityChange}
            onRemoveItem={removeItem}
            onClearRestaurant={clearRestaurantItems}
          />

          {/* Order Summaries Section - One per restaurant */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurantGroups.map((group) => (
              <RestaurantOrderSummary
                key={group.restaurantId}
                restaurantGroup={group}
                total={getRestaurantTotal(group.restaurantId)}
                serviceFee={getServiceFee()}
                grandTotal={getRestaurantGrandTotal(group.restaurantId)}
                address={address}
                setAddress={setAddress}
                note={restaurantNotes[group.restaurantId] || ""}
                setNote={handleNoteChange}
                coordinates={coordinates}
                setCoordinates={setCoordinates}
                onCheckout={handleCheckout}
                isCheckoutLoading={isLoading}
                loadingRestaurantId={loadingRestaurantId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
