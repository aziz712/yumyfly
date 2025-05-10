"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Clock, MapPin } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import { useCommandeStore } from "@/store/useCommandeStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DeliveryAssignmentModal } from "@/components/delivery-assignment-modal";
import useRestaurantStore from "@/store/useRestaurantStore";
import { toast } from "sonner";
import Link from "next/link";
import { EstimationTimeModal } from "../livreur/estimation-date-modal";
import ShowLocationInMap from "../show-location-in-map";
import Image from "next/image";

interface CommandeCardProps {
  commande: any;
  statusColors: Record<string, string>;
  statusBadgeColors: Record<string, string>;
  formatDate: (dateString: string) => string;
}

export default function OrderCard({
  commande,
  statusColors,
  statusBadgeColors,
  formatDate,
}: CommandeCardProps) {
  const statusColor =
    statusColors[commande.statut] ||
    "bg-gray-100 text-gray-800 border-gray-300";
  const statusBadgeColor =
    statusBadgeColors[commande.statut] || "bg-gray-500 hover:bg-gray-600";
  const { user } = useAuthStore();
  const {
    changeCommandeStatus,
    assignCommande,
    estimationLivraison,
    confirmPaid,
  } = useCommandeStore();
  const [showEstimationModal, setShowEstimationModal] = useState(false);
  const [showLocationInMap, setShowLocationInMap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const { livreurs, getAllDeliveries } = useRestaurantStore();

  // Add this useEffect to load deliveries when modal opens
  useEffect(() => {
    if (showDeliveryModal) {
      getAllDeliveries();
    }
  }, [showDeliveryModal, getAllDeliveries]);

  // Define available status options based on user role
  const getAvailableStatuses = () => {
    if (!user) return [];

    switch (user.role) {
      case "restaurant":
        return ["en attente", "préparation", "prête", "assignée"];
      case "livreur":
        // For delivery person, enforce the proper workflow
        if (commande.statut === "assignée") {
          return ["en route"];
        } else if (commande.statut === "en route") {
          return ["arrivée"];
        } else if (commande.statut === "arrivée") {
          return ["livrée"];
        }
        return [];
      default:
        return [];
    }
  };

  // Filter available statuses based on current status
  // This prevents going backward in the order process
  const getNextStatuses = () => {
    const allStatuses = [
      "en attente",
      "préparation",
      "prête",
      "assignée",
      "en route",
      "arrivée",
      "livrée",
    ];
    const currentIndex = allStatuses.indexOf(commande.statut);
    const availableStatuses = getAvailableStatuses();

    // Only show statuses that come after the current one in the process
    return availableStatuses.filter((status) => {
      const statusIndex = allStatuses.indexOf(status);
      return statusIndex > currentIndex;
    });
  };

  const nextStatuses = getNextStatuses();
  const canChangeStatus =
    nextStatuses.length > 0 && commande.statut !== "livrée";

  // Handle status change
  const handleStatusChange = async (
    newStatus:
      | "en attente"
      | "préparation"
      | "prête"
      | "assignée"
      | "en route"
      | "arrivée"
      | "livrée"
  ) => {
    if (newStatus === "assignée") {
      setShowDeliveryModal(true);
      return;
    }

    if (newStatus === "en route") {
      // Always show estimation modal when changing to "en route"
      setShowEstimationModal(true);
      return;
    }

    if (newStatus === "livrée") {
      await confirmPaid(commande._id);
      return;
    }

    try {
      setIsLoading(true);
      await changeCommandeStatus(commande._id, newStatus);
      toast.success(`Statut mis à jour: ${newStatus}`);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignDelivery = async (livreurId: string) => {
    try {
      setIsLoading(true);
      // First assign the delivery person
      await assignCommande(commande._id, livreurId);
      setShowDeliveryModal(false);
    } catch (error) {
      toast.error("Erreur lors de l'assignation du livreur");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEstimation = async (estimatedMinutes: number) => {
    try {
      setIsLoading(true);
      // First update the estimation time
      await estimationLivraison(commande._id, estimatedMinutes);

      // Then change the status to "en route"
      await changeCommandeStatus(commande._id, "en route");

      toast.success(
        `Livraison en route, temps estimé: ${estimatedMinutes} minutes`
      );
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'estimation.");
    } finally {
      setIsLoading(false);
      setShowEstimationModal(false);
    }
  };

  return (
    <Card className={`border-2 ${statusColor} overflow-hidden`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              Commande #{commande._id.substring(commande._id.length - 5)}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatDate(commande.createdAt)}
            </p>
          </div>
          <Badge className={statusBadgeColor}>{commande.statut}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mb-4">
          <Link
            href={
              user?.role === "admin"
                ? `/admin/restaurant-management/restaurant-details/${commande.restaurant._id}`
                : user?.role === "client"
                ? `/client/restaurant/${commande.restaurant._id}`
                : `/livreur/restaurant/${commande.restaurant._id}`
            }
            className="flex justify-start gap-2 "
          >
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarImage
                src={`${
                  commande?.restaurant?.images &&
                  process.env.NEXT_PUBLIC_APP_URL +
                    commande?.restaurant?.images[0]
                }  `}
                alt="User"
              />
              <AvatarFallback className="bg-orange-200 text-orange-800">
                {typeof commande.restaurant === "object"
                  ? commande.restaurant.nom?.charAt(0)
                  : "R"}
              </AvatarFallback>
            </Avatar>
            <p className="font-bold">
              {typeof commande.restaurant === "object"
                ? commande.restaurant.nom
                : "Restaurant"}
            </p>
          </Link>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Articles commandés:</h4>
          <ul className="space-y-2">
            {commande.plats.map((plat: any, index: number) => (
              <li key={index} className="">
                <Link
                  href={
                    user?.role === "admin"
                      ? `/admin/plat/${plat._id}`
                      : user?.role === "client"
                      ? `/client/plats/${plat._id}`
                      : `/livreur/plats/${plat._id}`
                  }
                  className="flex justify-between items-center "
                >
                  <div className="flex items-center gap-2">
                    {plat.images && plat.images.length > 0 && (
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                        <Image
                          height={100}
                          width={100}
                          src={
                            process.env.NEXT_PUBLIC_APP_URL + plat.images[0] ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg"
                          }
                          alt={plat.nom}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder.svg?height=40&width=40";
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{plat.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        x{plat.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium">{plat.prix} DT</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {commande.note && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <h4 className="font-medium mb-1">Note:</h4>
            <p className="text-sm">{commande.note}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t pt-4">
        <Link
          href={
            user?.role === "admin"
              ? `/admin/profile/${commande.client._id}`
              : user?.role === "client"
              ? `/client/profile/${commande.client._id}`
              : `/livreur/profile/${commande.client._id}`
          }
          className="flex justify-start gap-2 "
        >
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage
              src={`${process.env.NEXT_PUBLIC_APP_URL || ""}${
                commande.client.photoProfil || ""
              }`}
              alt="User"
            />
            <AvatarFallback className="bg-orange-200 text-orange-800">
              {commande.client.nom?.charAt(0)}
              {commande.client.prenom?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <p className="font-bold">
            {commande.client.nom} {commande.client.prenom}
          </p>
        </Link>
      </CardFooter>
      <CardFooter className="flex justify-between border-t pt-4">
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="font-bold text-lg">{commande.total} DT</p>
        </div>
        <Badge variant={commande.payee ? "default" : "outline"}>
          {commande.payee ? "Payée" : "Non payée"}
        </Badge>
      </CardFooter>

      <CardFooter className="flex flex-col items-start gap-2 border-t pt-4">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5 text-orange-500" />
          <span>{commande.address || "Adresse non spécifiée"}</span>
        </div>

        {commande.estimationLivraison && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span>
              Estimation de livraison:{" "}
              <strong>{commande.estimationLivraison} min</strong>
            </span>
          </div>
        )}
      </CardFooter>

      {commande?.coordinates && user?.role === "livreur" && (
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            onClick={() => setShowLocationInMap(true)}
            className="w-full bg-transparent border-2 border-black text-black cursor-pointer font-bold hover:text-white"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Voir la position sur la carte
          </Button>
        </CardFooter>
      )}

      {/* Only show status change options for restaurant and livreur roles */}
      {canChangeStatus &&
        (user?.role === "restaurant" || user?.role === "livreur") && (
          <CardFooter className="flex justify-center border-t pt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="bg-transparent border-black border-2 text-black font-bold w-full h-12 cursor-pointer hover:text-white hover:bg-black"
                  disabled={isLoading}
                >
                  {isLoading ? "Mise à jour..." : "Changer le statut"}{" "}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {nextStatuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() =>
                      handleStatusChange(
                        status as
                          | "en attente"
                          | "préparation"
                          | "prête"
                          | "assignée"
                          | "en route"
                          | "arrivée"
                          | "livrée"
                      )
                    }
                    className="cursor-pointer"
                  >
                    <Badge
                      className={`mr-2 ${statusBadgeColors[status] || ""}`}
                      variant="outline"
                    >
                      •
                    </Badge>
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardFooter>
        )}
      <DeliveryAssignmentModal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        deliveries={livreurs}
        onAssign={handleAssignDelivery}
      />
      <EstimationTimeModal
        isOpen={showEstimationModal}
        onClose={() => setShowEstimationModal(false)}
        onSave={handleSaveEstimation}
        initialEstimation={commande.estimationLivraison || 30}
      />
      <ShowLocationInMap
        coordinates={commande?.coordinates}
        isOpen={showLocationInMap}
        onClose={() => setShowLocationInMap(false)}
      />
    </Card>
  );
}
