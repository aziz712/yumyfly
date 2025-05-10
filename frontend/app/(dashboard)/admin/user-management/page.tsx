"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronDown,
  MoreHorizontal,
  UserPlus,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Filter,
  Trash2,
} from "lucide-react";
import useAdminStore from "@/store/useAdminStore";
import useAuthStore from "@/store/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateRestaurantOwner } from "@/app/(dashboard)/admin/restaurant-management/create-restaurant-owner";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

// Define the User interface
interface User {
  _id: string;
  nom?: string;
  prenom?: string;
  email: string;
  telephone?: string;
  adresse?: string;
  photoProfil?: string;
  role: "client" | "restaurant" | "livreur" | "admin";
  statut: "pending" | "active" | "blocked";
}

// Define sort options
type SortField = "nom" | "prenom" | "role" | "statut";
type SortDirection = "asc" | "desc";

export default function UserManagement() {
  const { users, getAllUsers, changeAccountStatus, deleteUser, isLoading } =
    useAdminStore();
  const { user: loggedUser } = useAuthStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  // Filter and sort users whenever the dependencies change
  useEffect(() => {
    let result = [...users];

    // Apply role filter
    if (roleFilter) {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.nom?.toLowerCase().includes(searchLower) ||
          false ||
          user.prenom?.toLowerCase().includes(searchLower) ||
          false ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        const valueA = a[sortField] || "";
        const valueB = b[sortField] || "";

        if (typeof valueA === "string" && typeof valueB === "string") {
          return sortDirection === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        return 0;
      });
    }

    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, sortField, sortDirection]);

  const handleStatusChange = async (
    userId: string,
    newStatus: "active" | "blocked"
  ) => {
    await changeAccountStatus({ userId, statut: newStatus });
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    const success = await deleteUser(userToDelete._id);
    setIsDeleting(false);

    if (success) {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            En attente
          </Badge>
        );
      case "blocked":
        return <Badge className="bg-red-500 hover:bg-red-600">Bloqué</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600">
            Administrateur
          </Badge>
        );
      case "restaurant":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">Restaurant</Badge>
        );
      case "livreur":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600">livreur</Badge>
        );
      case "client":
        return <Badge className="bg-gray-500 hover:bg-gray-600">Client</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="block lg:flex justify-between items-center">
        <h2 className="mb-4 md:m-0 text-2xl font-bold">
          Gestion des utilisateurs
        </h2>
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
            </DialogHeader>
            <CreateRestaurantOwner
              onSuccess={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou par email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Filter className="h-4 w-4" />
                  {roleFilter ? `Role: ${roleFilter}` : "Filter by Role"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuRadioGroup
                  value={roleFilter || ""}
                  onValueChange={(value) => setRoleFilter(value || null)}
                >
                  <DropdownMenuRadioItem value="">
                    Tous les rôles
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="admin">
                    Admin
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="restaurant">
                    Restaurant
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="livreur">
                    livreur
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="client">
                    Client
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("nom")}
                >
                  Utilisateur {getSortIcon("nom")}
                </div>
              </TableHead>
              <TableHead>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("role")}
                >
                  Role {getSortIcon("role")}
                </div>
              </TableHead>
              <TableHead>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("statut")}
                >
                  Status {getSortIcon("statut")}
                </div>
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading &&
              filteredUsers.map((user) => (
                <TableRow key={user._id} className="hover:bg-gray-50">
                  <TableCell>
                    <Link href={`/admin/profile/${user._id}`}>
                      <div className="flex items-center gap-3 hover:text-blue-500">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage
                            src={
                              process.env.NEXT_PUBLIC_APP_URL +
                              (user.photoProfil ?? "")
                            }
                            alt={user.nom || ""}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.nom?.charAt(0) || ""}
                            {user.prenom?.charAt(0) || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.nom} {user.prenom}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.statut)}</TableCell>
                  <TableCell>
                    <p>{user.telephone || "N/A"}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {user.adresse || "N/A"}
                    </p>
                  </TableCell>
                  <TableCell>
                    {loggedUser?._id !== user._id && ( // Prevent self-action
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="w-full">
                              <Button
                                variant="ghost"
                                className="w-full justify-between cursor-pointer"
                              >
                                Changer de statut{" "}
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(user._id, "active")
                                }
                                className="cursor-pointer"
                                disabled={user.statut === "active"}
                              >
                                Définir comme actif
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(user._id, "blocked")
                                }
                                className="cursor-pointer"
                                disabled={user.statut === "blocked"}
                              >
                                Bloquer l'utilisateur
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer l'utilisateur
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            {filteredUsers.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-lg font-medium">
                      Aucun utilisateur trouvé
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Essayez d'ajuster vos critères de recherche ou de filtrage
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Chargement des utilisateurs...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirmer la suppression de l'utilisateur
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {userToDelete?.prenom}{" "}
              {userToDelete?.nom}? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
