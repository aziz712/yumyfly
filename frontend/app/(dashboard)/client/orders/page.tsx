"use client";

import { useEffect, useState, useMemo } from "react";
import { useCommandeStore } from "@/store/useCommandeStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { CalendarIcon, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import OrderCard from "@/components/orders/order-card";
import { useSearchParams, useRouter } from 'next/navigation'; // Corrected import
import { FaCheckCircle, FaTimesCircle, FaWindowClose } from 'react-icons/fa';

const PaymentStatusPopup = () => {
  const searchParams = useSearchParams();
  const router = useRouter(); // Initialize router
  const paymentStatus = searchParams.get('payment_status');
  const orderId = searchParams.get('order_id');
  const paymentRef = searchParams.get('payment_ref');
  const [isVisible, setIsVisible] = useState(false);
  const { deleteCommande, paidCommande } = useCommandeStore();

  useEffect(() => {
    let popupVisibilityTimer: NodeJS.Timeout | undefined;
    let deleteTimer: NodeJS.Timeout | undefined;
    let paidTimer: NodeJS.Timeout | undefined;

    if (paymentStatus && orderId) {
      if (paymentStatus === 'success') {
        setIsVisible(true);
        paidTimer = setTimeout(() => {
          paidCommande(orderId)
          .then(() => {
            setIsVisible(false);
            router.push('/client/orders');
          })
          .catch(err => {
            console.error("Failed to confirm payement:", err);
          });
        }, 3000);
        
      } else if (paymentStatus === 'failed' || !paymentStatus || !paymentRef) {
        setIsVisible(true); 
        deleteTimer = setTimeout(() => {
          deleteCommande(orderId)
          .then(() => {
            setIsVisible(false);
            router.push('/client/orders');
          })
          .catch(err => {
            console.error("Failed to delete command:", err);
          });
        }, 3000); 
      }

      if (paymentStatus === 'success' || paymentStatus === 'failed'){
        popupVisibilityTimer = setTimeout(() => {
            setIsVisible(false);
            //router.push('/client/orders'); // Redirect after popup hides
          }, 3000); 
      }
    }
    return () => {
      if (popupVisibilityTimer) clearTimeout(popupVisibilityTimer);
      if (deleteTimer) clearTimeout(deleteTimer);
      if (paidTimer) clearTimeout(paidTimer);
    };
  }, [paymentStatus, orderId, deleteCommande, paidCommande, router]);

  const handleClosePopup = () => {
    setIsVisible(false);
    router.push('/client/orders'); // Redirect on manual close
  };

  if (!isVisible || !paymentStatus || !orderId) return null;

  const isSuccess = paymentStatus === 'success';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center relative">
        <button
          onClick={handleClosePopup} // Use new handler for manual close
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <FaWindowClose size={20} />
        </button>
        {isSuccess ? (
          <FaCheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        ) : (
          <FaTimesCircle size={48} className="text-red-500 mx-auto mb-4" />
        )}
        <h2 className={`text-xl font-semibold mb-2 ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
          {isSuccess ? 'Paiement Réussi' : 'Échec du Paiement'}
        </h2>
        <p className="text-gray-600 mb-1">ID de la Commande: {orderId}</p>
        <p className="text-gray-600 mb-4">Référence de Paiement: {paymentRef}</p>
        <p className="text-sm text-gray-500">
          {isSuccess
            ? 'Votre paiement a été traité avec succès.'
            : 'Nous n\'avons pas pu traiter votre paiement. Veuillez réessayer ou contacter le support.'}
        </p>
      </div>
    </div>
  );
};

export default function MyOrders() {
  const { getAllMyCommandes, isLoading, error, commandes } = useCommandeStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<string>("newest");

  useEffect(() => {
    getAllMyCommandes();
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
    "en attente": filteredCommandes.filter((c) => c.statut === "en attente"),
    préparation: filteredCommandes.filter((c) => c.statut === "préparation"),
    prête: filteredCommandes.filter((c) => c.statut === "prête"),
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
  };

  // Status badge colors
  const statusBadgeColors = {
    "en attente": "bg-yellow-500 hover:bg-yellow-600",
    préparation: "bg-blue-500 hover:bg-blue-600",
    prête: "bg-purple-500 hover:bg-purple-600",
    "en route": "bg-orange-500 hover:bg-orange-600",
    arrivée: "bg-teal-500 hover:bg-teal-600",
    livrée: "bg-green-500 hover:bg-green-600",
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
            onClick={() => getAllMyCommandes()}
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
      <PaymentStatusPopup />
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
        </Popover>
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger>
            <SelectValue placeholder="Trier par date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Plus récent d'abord</SelectItem>
            <SelectItem value="oldest">Plus ancien d'abord</SelectItem>
          </SelectContent>
        </Select>
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
          <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-6">
            <TabsTrigger value="all">
              Tous ({filteredCommandes.length})
            </TabsTrigger>
            <TabsTrigger value="en attente">
              En attente ({statusGroups["en attente"].length})
            </TabsTrigger>
            <TabsTrigger value="préparation">
              Préparation ({statusGroups["préparation"].length})
            </TabsTrigger>
            <TabsTrigger value="prête">
              Prête ({statusGroups["prête"].length})
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
