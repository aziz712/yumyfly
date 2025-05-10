"use client";

import { useEffect, useState, useMemo } from "react";
import { useCommandeStore } from "@/store/useCommandeStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import OrderCard from "@/components/orders/order-card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AssignedOrdersToLivreur() {
  const { getAllAssignedCommandes, isLoading, error, commandes } =
    useCommandeStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<string>("newest");

  useEffect(() => {
    getAllAssignedCommandes();
  }, []);

  const filteredCommandes = useMemo(() => {
    if (!commandes) return [];

    let filtered = [...commandes];

    // Filter by search term (restaurant name)
    if (searchTerm) {
      filtered = filtered.filter(
        (commande) =>
          typeof commande.restaurant === "object" &&
          commande.restaurant.nom
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by payment status
    if (paymentFilter !== "all") {
      const isPaid = paymentFilter === "paid";
      filtered = filtered.filter((commande) => commande.payee === isPaid);
    }

    // Filter by date
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filtered = filtered.filter((commande) => {
        const commandeDate = new Date(commande.createdAt).toDateString();
        return commandeDate === filterDate;
      });
    }
    if (sortOrder === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortOrder === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    return filtered;
  }, [commandes, searchTerm, paymentFilter, dateFilter, sortOrder]);

  // Group commandes by status
  const statusGroups = {
    assignée: filteredCommandes.filter((c) => c.statut === "assignée"),

    "en route": filteredCommandes.filter((c) => c.statut === "en route"),
    arrivée: filteredCommandes.filter((c) => c.statut === "arrivée"),
    livrée: filteredCommandes.filter((c) => c.statut === "livrée"),
  };

  // Status color mapping
  const statusColors = {
    "en attente": "bg-yellow-100 text-yellow-800 border-yellow-300",
    préparation: "bg-blue-100 text-blue-800 border-blue-300",
    prête: "bg-purple-100 text-purple-800 border-purple-300",
    "en route": "bg-orange-100 text-orange-800 border-orange-300",
    arrivée: "bg-teal-100 text-teal-800 border-teal-300",
    livrée: "bg-green-100 text-green-800 border-green-300",
    assignée: "bg-blue-100 text-blue-800 border-blue-300",
  };

  // Status badge colors
  const statusBadgeColors = {
    "en attente": "bg-yellow-500 hover:bg-yellow-600",
    préparation: "bg-blue-500 hover:bg-blue-600",
    prête: "bg-purple-500 hover:bg-purple-600",
    "en route": "bg-orange-500 hover:bg-orange-600",
    arrivée: "bg-teal-500 hover:bg-teal-600",
    livrée: "bg-green-500 hover:bg-green-600",
    assignée: "bg-blue-500 hover:bg-blue-600",
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy, HH:mm", { locale: fr });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Une erreur est survenue</p>
          <p>{error}</p>
          <Button
            onClick={() => getAllAssignedCommandes()}
            className="mt-4"
            variant="outline"
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Mes Commandes</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un restaurant..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Statut de paiement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="paid">Payées</SelectItem>
            <SelectItem value="unpaid">Non payées</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !dateFilter && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFilter
                ? format(dateFilter, "PPP", { locale: fr })
                : "Filtrer par date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateFilter}
              onSelect={setDateFilter}
              initialFocus
            />
            {dateFilter && (
              <div className="p-3 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setDateFilter(undefined)}
                >
                  Effacer
                </Button>
              </div>
            )}
          </PopoverContent>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger>
              <SelectValue placeholder="Trier par date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récent d'abord</SelectItem>
              <SelectItem value="oldest">Plus ancien d'abord</SelectItem>
            </SelectContent>
          </Select>
        </Popover>
      </div>

      {filteredCommandes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            Aucune commande trouvée
          </p>
          {(searchTerm || paymentFilter !== "all" || dateFilter) && (
            <Button
              onClick={() => {
                setSearchTerm("");
                setPaymentFilter("all");
                setDateFilter(undefined);
              }}
              className="mt-4"
              variant="outline"
            >
              Effacer les filtres
            </Button>
          )}
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-8 mb-6">
            <TabsTrigger value="all">
              Tous ({filteredCommandes.length})
            </TabsTrigger>

            <TabsTrigger value="assignée">
              assignée ({statusGroups["assignée"].length})
            </TabsTrigger>
            <TabsTrigger value="en route">
              En route ({statusGroups["en route"].length})
            </TabsTrigger>
            <TabsTrigger value="arrivée">
              Arrivée ({statusGroups["arrivée"].length})
            </TabsTrigger>
            <TabsTrigger value="livrée">
              Livrée ({statusGroups["livrée"].length})
            </TabsTrigger>
          </TabsList>

          {/* All orders tab */}
          <TabsContent
            value="all"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCommandes.map((commande) => (
              <OrderCard
                key={commande._id}
                commande={commande}
                statusColors={statusColors}
                statusBadgeColors={statusBadgeColors}
                formatDate={formatDate}
              />
            ))}
          </TabsContent>

          {/* Status-specific tabs */}
          {Object.keys(statusGroups).map((status) => (
            <TabsContent
              key={status}
              value={status}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {statusGroups[status as keyof typeof statusGroups].map(
                (commande) => (
                  <OrderCard
                    key={commande._id}
                    commande={commande}
                    statusColors={statusColors}
                    statusBadgeColors={statusBadgeColors}
                    formatDate={formatDate}
                  />
                )
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
