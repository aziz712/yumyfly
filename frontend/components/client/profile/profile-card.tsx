"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import useClientStore from "@/store/useClientStore";
import useAuthStore from "@/store/useAuthStore";
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

interface ProfileCardProps {
  user: User;
}

export function ProfileCard({ user }: ProfileCardProps) {
  const router = useRouter();
  const { deleteClientAccount, isLoading } = useClientStore();
  const { logout } = useAuthStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getInitials = () => {
    const firstInitial = user.prenom ? user.prenom[0] : "";
    const lastInitial = user.nom ? user.nom[0] : "";
    return `${firstInitial}${lastInitial}`;
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteClientAccount();
      if (success) {
        // Clear auth store and redirect to home page
        await logout();
        router.push("/");
      }
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-purple-500 to-indigo-600">
          {/* Delete Account Button */}
          <div className="flex items-center justify-end p-4">
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer mon compte
            </Button>
          </div>
        </div>
        <CardContent className="relative pt-0">
          <div className="flex flex-col items-center -mt-16">
            <Avatar className="h-32 w-32 border-4 border-white bg-white">
              <AvatarImage
                src={
                  process.env.NEXT_PUBLIC_APP_URL +
                  (user.photoProfil ?? "/default-profile.png")
                }
                alt="Profile"
              />
              <AvatarFallback className="text-2xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="mt-4 text-center">
              <h2 className="text-2xl font-bold">
                {user.prenom} {user.nom}
              </h2>
              <Badge className="mt-2 bg-purple-500">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>

            <div className="w-full mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <span>{user.email}</span>
              </div>

              {user.telephone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <span>{user.telephone}</span>
                </div>
              )}

              {user.adresse && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span>{user.adresse}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Supprimer votre compte ?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Êtes-vous sûr de vouloir supprimer votre compte ? Cette action
                est irréversible et toutes vos données seront définitivement
                supprimées.
              </p>
              <p className="font-semibold">
                Vous ne pourrez pas récupérer votre compte ou vos données après
                cette action.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={isDeleting}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer définitivement"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
