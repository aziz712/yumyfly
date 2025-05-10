import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddressSelectorProps {
  address: string;
  setAddress: (address: string) => void;
  coordinates: { lat: number | null; lng: number | null };
  setCoordinates: (coords: { lat: number | null; lng: number | null }) => void;
}

export function AddressSelector({
  address,
  setAddress,
  coordinates,
  setCoordinates,
}: AddressSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState(address);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [retryCount, setRetryCount] = useState(0); // Track failed attempts
  const [showManualInput, setShowManualInput] = useState(false); // Show manual input if geolocation fails

  const saveAddress = () => {
    if (!newAddress.trim()) {
      toast.error("L'adresse de livraison est obligatoire");
      return;
    }

    setAddress(newAddress);
    setIsDialogOpen(false);
    toast.success("Votre adresse de livraison a été mise à jour.");
  };

  const getCurrentLocation = () => {
    setIsLocating(true);
    setLocationError(""); // Clear any previous error messages
    setShowManualInput(false); // Reset manual input visibility

    if (!navigator.geolocation) {
      setLocationError(
        "La géolocalisation n'est pas prise en charge par votre navigateur"
      );
      setIsLocating(false);
      handleRetry();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });

        // Reverse geocoding to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();

          if (data && data.display_name) {
            setNewAddress(data.display_name);
          } else {
            setNewAddress(
              `Localisation: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            );
          }

          toast.success("Localisation détectée avec succès");
        } catch (error) {
          console.error("Error fetching address:", error);
          setNewAddress(
            `Localisation: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          );
        }

        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        console.log(error);
        // Set error message based on the error code
        if (error.code === 1) {
          setLocationError("Vous avez refusé l'accès à votre position");
          setTimeout(() => {
            setLocationError("");
          }, 2000);
        } else {
          setLocationError("Impossible de déterminer votre position");
        }

        setIsLocating(false);
        handleRetry();
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);

    // If retry count exceeds 3, show manual input
    if (retryCount >= 2) {
      setShowManualInput(true);
      setLocationError(
        "Erreur GPS. Veuillez entrer votre adresse manuellement."
      );
    }
  };

  // Reset states when the dialog is opened
  const handleDialogOpen = () => {
    setIsDialogOpen(true);
    setLocationError(""); // Clear error message
    setRetryCount(0); // Reset retry counter
    setShowManualInput(false); // Hide manual input field
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-[#fc8019]">
          Adresse de livraison
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-orange-500 border-orange-500 bg-transparent hover:bg-orange-500 hover:text-white transition-colors"
              onClick={handleDialogOpen}
            >
              {address ? "Modifier" : "Ajouter"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {address
                  ? "Modifier l'adresse de livraison"
                  : "Ajouter une adresse de livraison"}
              </DialogTitle>
              <DialogDescription>
                Utilisez votre position actuelle ou entrez votre adresse
                manuellement.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {!showManualInput && (
                <Button
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={isLocating}
                  className="w-full flex items-center justify-center"
                >
                  {isLocating ? (
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  ) : (
                    <Navigation className="h-4 w-4 mr-2" />
                  )}
                  Localiser automatiquement
                </Button>
              )}

              {(showManualInput || newAddress) && (
                <Input
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Entrez votre adresse manuellement"
                  className="flex-1"
                />
              )}

              {locationError && (
                <p className="text-red-500 text-sm">{locationError}</p>
              )}

              {coordinates.lat && coordinates.lng && (
                <div className="text-sm text-gray-500">
                  Coordonnées: {coordinates.lat.toFixed(6)},{" "}
                  {coordinates.lng.toFixed(6)}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={saveAddress}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {address ? (
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
          <div>
            <p className="font-bold">{address}</p>
            <p className="text-sm text-gray-500">
              Livraison estimée:{" "}
              <span className="font-medium">30-45 minutes</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 p-3 rounded-md border border-red-200 text-red-600 text-sm">
          Veuillez ajouter une adresse de livraison pour continuer
        </div>
      )}
    </div>
  );
}
