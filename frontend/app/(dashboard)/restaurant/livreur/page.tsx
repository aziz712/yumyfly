"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Search, MoreHorizontal, Loader2 } from "lucide-react";
import useRestaurantStore from "@/store/useRestaurantStore";
import Link from "next/link";

export default function LivreurManagement() {
  const router = useRouter();
  const {
    getAllDeliveries,
    changeDeliveryStatus,
    deleteDelivery,
    livreurs,
    isLoading,
  } = useRestaurantStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredLivreurs, setFilteredLivreurs] = useState<any[]>([]);
  const [livreurToDelete, setLivreurToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState<string | null>(null);

  // Fetch all deliveries on component mount
  useEffect(() => {
    getAllDeliveries();
  }, []);

  // Filter livreurs based on search term and status filter
  useEffect(() => {
    if (!livreurs) return;

    let filtered = [...livreurs];

    // Filter by search term (name or email)
    if (searchTerm) {
      filtered = filtered.filter((livreur) => {
        const user =
          typeof livreur.userId === "object"
            ? livreur.userId
            : { nom: "", prenom: "", email: "" };
        const fullName = `${user.nom} ${user.prenom}`.toLowerCase();
        const email = user.email?.toLowerCase() || "";

        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          email.includes(searchTerm.toLowerCase())
        );
      });
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((livreur) => {
        const user =
          typeof livreur.userId === "object" ? livreur.userId : { statut: "" };
        return user.statut === statusFilter;
      });
    }

    setFilteredLivreurs(filtered);
  }, [livreurs, searchTerm, statusFilter]);

  // Handle status change
  const handleStatusChange = async (
    livreurId: string,
    newStatus: "active" | "blocked"
  ) => {
    setIsChangingStatus(livreurId);
    try {
      await changeDeliveryStatus(livreurId, newStatus);
    } finally {
      setIsChangingStatus(null);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!livreurToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDelivery(livreurToDelete);
      setLivreurToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestion des livreurs</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les livreurs qui livrent les commandes de votre restaurant
          </p>
        </div>
        <Button
          onClick={() => router.push("/restaurant/livreur/add")}
          className="shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un livreur
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Recherchez et filtrez les livreurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par nom ou email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="blocked">Bloqué</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading && !filteredLivreurs.length ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredLivreurs.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-xl font-medium">Aucun livreur trouvé</p>
          <p className="text-muted-foreground mt-2">
            {searchTerm || statusFilter !== "all"
              ? "Essayez de modifier vos filtres de recherche"
              : "Ajoutez votre premier livreur pour commencer"}
          </p>
          {(searchTerm || statusFilter !== "all") && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'ajout</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLivreurs.map((livreur) => {
                const user =
                  typeof livreur.userId === "object"
                    ? livreur.userId
                    : {
                        nom: "",
                        prenom: "",
                        email: "",
                        telephone: "",
                        statut: "",
                        createdAt: "",
                      };

                return (
                  <TableRow key={livreur._id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/restaurant/profile/${user._id}`}
                        className="hover:text-blue-500"
                      >
                        {" "}
                        {user.nom} {user.prenom}
                      </Link>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.telephone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.statut === "active"
                            ? "outline"
                            : user.statut === "blocked"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {user.statut === "active"
                          ? "Actif"
                          : user.statut === "blocked"
                          ? "Bloqué"
                          : "En attente"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.statut === "active" ? (
                            <DropdownMenuItem
                              className="cursor-pointer hover:bg-gray-200"
                              onClick={() =>
                                handleStatusChange(livreur._id, "blocked")
                              }
                              disabled={isChangingStatus === livreur._id}
                            >
                              {isChangingStatus === livreur._id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Bloquer
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(livreur._id, "active")
                              }
                              className="cursor-pointer hover:bg-gray-200"
                              disabled={isChangingStatus === livreur._id}
                            >
                              {isChangingStatus === livreur._id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Activer
                            </DropdownMenuItem>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-gray-200"
                                onSelect={(e) => e.preventDefault()}
                              >
                                Supprimer
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Êtes-vous sûr?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action ne peut pas être annulée. Le
                                  compte du livreur sera définitivement
                                  supprimé.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="cursor-pointer">
                                  Annuler
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    setLivreurToDelete(livreur._id);
                                    handleDelete();
                                  }}
                                  disabled={isDeleting}
                                  className="text-white bg-red-500 hover:bg-red-600 cursor-pointer"
                                >
                                  {isDeleting &&
                                  livreurToDelete === livreur._id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : null}
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
