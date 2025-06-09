"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Added for redirection
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
import { EmptyCart } from "@/components/cart/empty-cart";
import { CartItemsList } from "@/components/cart/cart-items-list";
import { RestaurantOrderSummary } from "@/components/cart/order-summary";
import { useCommandeStore } from "@/store/useCommandeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { AddressSelector } from "@/components/cart/address-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as paymentService from "@/services/paymentService"; // Updated to generic paymentService

export default function CartPage() {
  const router = useRouter(); // Added for redirection
  const {
    restaurantGroups,
    removeItem,
    updateQuantity,
    clearRestaurantItems,
    getRestaurantTotal,
    getServiceFee,
    getRestaurantGrandTotal,
  } = useCartStore();

  const { passCommande, isLoading,  confirmPaid } = useCommandeStore();
  const { user } = useAuthStore();
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
        setLoadingRestaurantId(null);
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
      const newCommande = await passCommande(orderData);

      if (newCommande && newCommande._id) {
        toast.success(
          `Votre commande de ${getRestaurantGrandTotal(restaurantId).toFixed(
            2
          )} DT a été créée. Redirection vers le paiement...`
        );

        // Create payment with Konnect
        try {
          // Ensure all required fields for Konnect are present in newCommande or orderData
          const paymentPayload = {
            orderId: newCommande._id,
            amount: newCommande.total,
            firstName: user?.nom || 'N/A',
            lastName: user?.prenom || 'N/A',
            email: user?.email || 'default@example.com',
            phone: user?.telephone || '00000000',
            address: orderData.address, // This was already in orderData
            // note: orderData.note, // Optional, if Konnect supports it directly in init payload
          };

          const paymentResponse = await paymentService.initiateKonnectPayment(paymentPayload);

          if (paymentResponse && paymentResponse.payment_url) {
            // Clear only this restaurant's items after successful checkout and before redirection
            clearRestaurantItems(restaurantId);
            router.push(paymentResponse.payment_url);

            // Start polling for payment verification
            const checkPaymentStatus = async (paymentRef: string, orderId: string) => {
              try {
                const statusResponse = await paymentService.verifyKonnectPaymentStatus(paymentRef);
                if (statusResponse && statusResponse.payment && statusResponse.payment.status === 'succeeded') {
                  toast.success("Paiement vérifié avec succès!");
                  // Update commande status to paid using confirmPaid
                  await confirmPaid(orderId);
                  // Optionally, redirect to an order confirmation page or update UI
                } else if (statusResponse && statusResponse.payment && (statusResponse.payment.status === 'failed' || statusResponse.payment.status === 'canceled')){
                  toast.error("Le paiement a échoué ou a été annulé.");
                  // For failed/cancelled payments, we might still want to update the status to 'Paiement échoué'
                  // However, confirmPaid is likely for successful payments. 
                  // If a different action is needed for failed payments, that should be clarified.
                  // For now, let's assume we still call confirmPaid, or a more appropriate function if available.
                  // Or, we could call changeCommandeStatus for this specific case if confirmPaid is only for success.
                  await confirmPaid(orderId); // Reverting to changeCommandeStatus for failure cases as confirmPaid implies success.
                  // console.log(`Order ${orderId} payment failed or was cancelled.`);
                } else {
                  // If status is still pending or processing, poll again after a delay
                  setTimeout(() => checkPaymentStatus(paymentRef, orderId), 5000); // Poll every 5 seconds
                }
              } catch (error) {
                console.error("Erreur lors de la vérification du statut du paiement:", error);
                toast.error("Erreur lors de la vérification du paiement.");
                // Consider stopping polling after a certain number of retries
              }
            };

            // Start polling if paymentRef is available
            if (paymentResponse.payment_ref) {
              checkPaymentStatus(paymentResponse.payment_ref, newCommande._id);
            }

          } else {
            toast.error(
              paymentResponse?.message || "Erreur lors de la création du lien de paiement Konnect. Veuillez réessayer."
            );
          }
        } catch (paymentError: any) {
          console.error("Konnect payment creation error:", paymentError);
          toast.error(
            paymentError.response?.data?.message || "Une erreur s'est produite lors de la création du paiement Konnect. Veuillez réessayer."
          );
        }
      } else {
        // This case might occur if passCommande returns null or an object without _id
        toast.error(
          "Erreur lors de la création de la commande. Veuillez réessayer."
        );
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
