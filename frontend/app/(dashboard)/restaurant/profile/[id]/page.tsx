"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import useAdminStore from "@/store/useAdminStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export default function OtherUserProfile() {
  const params = useParams();
  const { id } = params as { id: string };

  const { getUserById, changeAccountStatus, user, isLoading } = useAdminStore();

  useEffect(() => {
    const fetchData = async () => {
      await getUserById(id);
    };
    fetchData();
  }, [id, getUserById]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
            <CardDescription>
              Utilisateur non trouvé ou vous n'avez pas les permissions
              nécessaires.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  // Handle account status toggle
  const handleAccountStatusChange = async () => {
    const newStatus = user.statut === "active" ? "blocked" : "active";
    const success = await changeAccountStatus({
      statut: newStatus,
      userId: user._id,
    });

    if (success) {
      toast.success(
        newStatus === "active"
          ? "Compte activé avec succès"
          : "Compte bloqué avec succès"
      );
      await getUserById(id);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Profil Utilisateur</h1>

      <div className="grid grid-cols-1 gap-8 w-full">
        <Card className="overflow-hidden border-none shadow-md">
          <div className="h-32 bg-gradient-to-r from-purple-500 to-indigo-600" />
          <CardContent className="p-0">
            <div className="flex flex-col items-center sm:flex-row sm:items-start p-6 -mt-12 relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                  {getInitials(user.prenom || "N/A", user.nom || "N/A")}
                </AvatarFallback>
              </Avatar>

              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <h2 className="text-2xl font-bold">
                  {user.prenom} {user.nom}
                </h2>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Badge variant="outline" className="bg-background">
                    Membre depuis {formatDate(user.createdAt)}
                  </Badge>
                </div>
              </div>

              {/* Add Block/Activate Button */}
              <div className="absolute top-4 right-4">
                <Button
                  onClick={handleAccountStatusChange}
                  variant="outline"
                  className="bg-red-500 hover:bg-red-600 text-white hover:text-white cursor-pointer"
                >
                  {user.statut === "active" ? "Bloquer" : "Activer"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="information" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="information">Informations</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="information">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Détails du profil de l'utilisateur.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Prénom
                    </h3>
                    <p className="text-foreground font-medium">
                      {user.prenom || "Non renseigné"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Nom
                    </h3>
                    <p className="text-foreground font-medium">
                      {user.nom || "Non renseigné"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Membre depuis
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
                <CardDescription>Coordonnées de l'utilisateur.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Email
                    </h3>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground font-medium">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Téléphone
                    </h3>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground font-medium">
                        {user.telephone || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Adresse
                    </h3>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground">
                        {user.adresse || "Non renseignée"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
