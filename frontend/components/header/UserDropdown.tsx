import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
type Props = {};
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function UserDropdown({}: Props) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login page after logout
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }
  const initials =
    user?.nom && user?.prenom
      ? `${user.nom.charAt(0)}${user.prenom.charAt(0)}`
      : "U";
  console.log({ user });
  return (
    <div>
      {" "}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-white h-[45px] cursor-pointer hover:bg-white/90">
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarImage
                src={`${process.env.NEXT_PUBLIC_APP_URL || ""}${
                  user.photoProfil || ""
                }`}
                alt="User"
              />
              <AvatarFallback className="bg-orange-200 text-orange-800">
                {initials}{" "}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-[#747981] font-bold md:block">
              {" "}
              {user?.nom} {user?.prenom}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium"> {user?.nom}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator />

          {user.role === "client" && (
            <Link href={`/${user?.role}/statistique`}>
              <DropdownMenuItem className="cursor-pointer duration-300 transition-all ease-in-out hover:bg-orange-500 hover:text-white group">
                <Settings className="mr-2 h-4 w-4 duration-300 transition-all ease-in-out hover:bg-orange-500 hover:text-white group" />
                <span>statistique</span>
              </DropdownMenuItem>
            </Link>
          )}
          <Link href={`/${user?.role}/profile`}>
            <DropdownMenuItem className="cursor-pointer duration-300 transition-all ease-in-out hover:bg-orange-500 hover:text-white group">
              <User className="mr-2 h-4 w-4 duration-300 transition-all ease-in-out hover:bg-orange-500 hover:text-white group" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer duration-300 transition-all ease-in-out hover:!bg-red-500 hover:text-white group"
          >
            <LogOut className="mr-2 h-4 w-4  duration-300 transition-all ease-in-out group-hover:text-white" />
            <span>Se déconnecter</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
