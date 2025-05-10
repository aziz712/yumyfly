import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin } from "lucide-react";

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
  const getInitials = () => {
    const firstInitial = user.prenom ? user.prenom[0] : "";
    const lastInitial = user.nom ? user.nom[0] : "";
    return `${firstInitial}${lastInitial}`;
  };
  console.log("http://localhost:3001" + user.photoProfil);

  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-purple-500 to-[#ff6900]"></div>
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
            <Badge className="mt-2 bg-[#ff6900]">
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
  );
}
