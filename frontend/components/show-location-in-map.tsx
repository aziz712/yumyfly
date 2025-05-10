import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ShowLocationInMapProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export default function ShowLocationInMap({
  isOpen,
  onClose,
  coordinates,
}: ShowLocationInMapProps) {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Géolocalisation n'est pas supportée par votre navigateur");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(userCoords);

        // Calculate distance if we have both coordinates
        if (coordinates) {
          const distance = calculateDistance(
            userCoords.latitude,
            userCoords.longitude,
            coordinates.latitude,
            coordinates.longitude
          );
          setDistance(distance);
        }

        setLoading(false);
      },
      (err) => {
        setError(`Erreur de géolocalisation: ${err.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Calculate distance between two points using the Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  // Estimate travel times
  const getEstimatedTimes = (
    distanceInKm: number
  ): {
    walking: string;
    biking: string;
    driving: string;
  } => {
    const walkingSpeed = 5; // km/h
    const bikingSpeed = 15; // km/h
    const drivingSpeed = 50; // km/h

    const walkingTime = (distanceInKm / walkingSpeed) * 60; // minutes
    const bikingTime = (distanceInKm / bikingSpeed) * 60; // minutes
    const drivingTime = (distanceInKm / drivingSpeed) * 60; // minutes

    return {
      walking: formatTime(walkingTime),
      biking: formatTime(bikingTime),
      driving: formatTime(drivingTime),
    };
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 1) {
      return "moins d'une minute";
    } else if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours} h ${
        remainingMinutes > 0 ? remainingMinutes + " min" : ""
      }`;
    }
  };

  // Format distance
  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    } else {
      return `${distance.toFixed(1)} km`;
    }
  };

  const times = distance ? getEstimatedTimes(distance) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Afficher l'emplacement sur les cartes</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {coordinates && (
            <div className="rounded-md overflow-hidden border h-64">
              <iframe
                title="User Location Map"
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  coordinates.longitude - 0.01
                }%2C${coordinates.latitude - 0.01}%2C${
                  coordinates.longitude + 0.01
                }%2C${coordinates.latitude + 0.01}&layer=mapnik&marker=${
                  coordinates.latitude
                }%2C${coordinates.longitude}`}
                className="w-full h-full border-0"
              ></iframe>
            </div>
          )}

          {!userLocation && !error && (
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={getLocation}
              disabled={loading}
            >
              <MapPin size={16} />
              {loading
                ? "Chargement..."
                : "Voir la distance jusqu'à cet endroit"}
            </Button>
          )}

          {error && (
            <Alert className="bg-red-50">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {userLocation && distance && (
            <div className="p-4 bg-gray-50 rounded-md space-y-3">
              <div className="flex items-center gap-2">
                <Navigation className="text-blue-600" size={18} />
                <p className="font-medium">
                  Distance:{" "}
                  <span className="text-blue-600">
                    {formatDistance(distance)}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Clock size={16} />
                  Temps estimé:
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="p-2 bg-white rounded shadow-sm">
                    <p className="font-medium">À pied</p>
                    <p>{times?.walking}</p>
                  </div>
                  <div className="p-2 bg-white rounded shadow-sm">
                    <p className="font-medium">À vélo</p>
                    <p>{times?.biking}</p>
                  </div>
                  <div className="p-2 bg-white rounded shadow-sm">
                    <p className="font-medium">En voiture</p>
                    <p>{times?.driving}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          {userLocation && coordinates && (
            <a
              href={`https://www.openstreetmap.org/directions?from=${userLocation.latitude},${userLocation.longitude}&to=${coordinates.latitude},${coordinates.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button>Itinéraires</Button>
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
