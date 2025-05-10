"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Filter, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateRestaurantOwner } from "./create-restaurant-owner";
import useClientStore from "@/store/useClientStore";
import useAdminStore from "@/store/useAdminStore";
import { toast } from "sonner";
import RestaurantGrid from "@/components/admin/restaurant-management/restaurant-grid";
// Define Restaurant interface
interface Restaurant {
  _id: string;
  nom: string;
  description?: string;
  adresse?: string;
  telephone?: string;
  email?: string;

  images?: string[];
  horaires?: Record<string, { ouverture: string; fermeture: string }>;
  proprietaire:
    | string
    | {
        _id: string;
        nom?: string;
        prenom?: string;
        email: string;
        telephone?: string;
        statut: "pending" | "active" | "blocked";
      };
  createdAt: string;
  updatedAt: string;
}

export default function RestaurantManagement() {
  const router = useRouter();
  const { getAllRestaurants, restaurants, isLoading, error } = useClientStore();
  const { changeAccountStatus } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(
    []
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    getAllRestaurants();
  }, [getAllRestaurants]);

  // Filter restaurants based on search term and status filter
  useEffect(() => {
    if (!restaurants) return;

    let filtered = [...restaurants];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.nom.toLowerCase().includes(searchLower) ||
          restaurant.adresse?.toLowerCase().includes(searchLower) ||
          restaurant.telephone?.toLowerCase().includes(searchLower) ||
          restaurant.email?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter from dropdown
    if (statusFilter) {
      filtered = filtered.filter((restaurant) => {
        const owner =
          typeof restaurant.proprietaire === "object"
            ? restaurant.proprietaire
            : null;
        return owner?.statut === statusFilter;
      });
    }

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((restaurant) => {
        const owner =
          typeof restaurant.proprietaire === "object"
            ? restaurant.proprietaire
            : null;
        return owner?.statut === activeTab;
      });
    }

    setFilteredRestaurants(filtered);
  }, [restaurants, searchTerm, statusFilter, activeTab]);

  const handleStatusChange = async (
    restaurant: Restaurant,
    newStatus: "active" | "blocked"
  ) => {
    if (
      typeof restaurant.proprietaire !== "object" ||
      !restaurant.proprietaire._id
    ) {
      toast.error("Restaurant owner information is not available");
      return;
    }

    setIsStatusChanging(true);
    try {
      const success = await changeAccountStatus({
        userId: restaurant.proprietaire._id,
        statut: newStatus,
      });
      if (success) {
        toast.success("statut du compte modifié");
      }
      // Refresh the restaurants list
      await getAllRestaurants();
      setIsStatusDialogOpen(false);
      setSelectedRestaurant(null);
    } finally {
      setIsStatusChanging(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Actif</Badge>;

      case "blocked":
        return <Badge className="bg-red-500 hover:bg-red-600">Bloqué</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">
          Chargement des restaurants...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">
          Erreur lors du chargement des restaurants
        </h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => getAllRestaurants()}>Essayer à nouveau</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion de restaurant</h1>
          <p className="text-muted-foreground">
            Gérer tous les restaurants et leurs propriétaires
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 cursor-pointer">
              <UserPlus className="h-4 w-4" />
              Ajouter un propriétaire de restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un propriétaire de restaurant</DialogTitle>
              <DialogDescription>
                Créez un compte de nouveau propriétaire de restaurant. Il
                recevra un e-mail contenant les instructions de connexion.
              </DialogDescription>
            </DialogHeader>
            <CreateRestaurantOwner
              onSuccess={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Recherchez des restaurants par nom, adresse ou contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Filter className="h-4 w-4" />
              {statusFilter ? `Status: ${statusFilter}` : "Filtrer par statut"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuRadioGroup
              value={statusFilter || ""}
              onValueChange={(value) => setStatusFilter(value || null)}
            >
              <DropdownMenuRadioItem value="" className="cursor-pointer">
                Tous les statuts
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="active" className="cursor-pointer">
                Actif
              </DropdownMenuRadioItem>

              <DropdownMenuRadioItem value="blocked" className="cursor-pointer">
                Bloqué
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Tous les restaurants</TabsTrigger>
          <TabsTrigger value="active">Actif</TabsTrigger>

          <TabsTrigger value="blocked">Bloqué</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <RestaurantGrid
            restaurants={filteredRestaurants}
            getStatusBadge={getStatusBadge}
            onViewDetails={(id) =>
              router.push(
                `/admin/restaurant-management/restaurant-details/${id}`
              )
            }
            onStatusChange={(restaurant) => {
              setSelectedRestaurant(restaurant);
              setIsStatusDialogOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="active" className="mt-0">
          <RestaurantGrid
            restaurants={filteredRestaurants}
            getStatusBadge={getStatusBadge}
            onViewDetails={(id) =>
              router.push(
                `/admin/restaurant-management/restaurant-details/${id}`
              )
            }
            onStatusChange={(restaurant) => {
              setSelectedRestaurant(restaurant);
              setIsStatusDialogOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="blocked" className="mt-0">
          <RestaurantGrid
            restaurants={filteredRestaurants}
            getStatusBadge={getStatusBadge}
            onViewDetails={(id) =>
              router.push(
                `/admin/restaurant-management/restaurant-management/${id}`
              )
            }
            onStatusChange={(restaurant) => {
              setSelectedRestaurant(restaurant);
              setIsStatusDialogOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Status Change Dialog */}
      <AlertDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Changer le statut de propriétaire du restaurant
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRestaurant && (
                <>
                  Vous êtes sur le point de modifier le statut du propriétaire
                  du restaurant <strong>{selectedRestaurant.nom}</strong>. Cela
                  affectera leur capacité à gérer le restaurant.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button
              variant="outline"
              className="justify-start border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
              onClick={() =>
                selectedRestaurant &&
                handleStatusChange(selectedRestaurant, "active")
              }
              disabled={isStatusChanging}
            >
              Définir comme actif
            </Button>

            <Button
              variant="outline"
              className="justify-start border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() =>
                selectedRestaurant &&
                handleStatusChange(selectedRestaurant, "blocked")
              }
              disabled={isStatusChanging}
            >
              Bloquer le compte{" "}
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isStatusChanging}>
              Annuler
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
