"use client";
import Link from "next/link";
import type React from "react";

import { useRouter } from "next/navigation";
import { Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UserDropdown from "@/components/header/UserDropdown";
import Image from "next/image";
import logo from "@/public/logo.png";
import useAuthStore from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { Badge } from "@/components/ui/badge";
import SideBarSheet from "../side-bar/side-bar-sheet";

// Define types for our sidebar items
export type SidebarItemType = {
  title: string;
  path: string;
  icon: React.ElementType;
  submenu?: SidebarItemType[];
};

export type SidebarConfig = {
  mainMenu: SidebarItemType[];
  otherMenu?: SidebarItemType[];
};

type HeaderProps = {
  config?: SidebarConfig;
};

export default function Header({
  config = {
    mainMenu: [],
    otherMenu: [],
  },
}: HeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { restaurantGroups, getTotalItemCount } = useCartStore();

  // Calculate total items in cart
  const cartItemsCount = getTotalItemCount();

  // Handle search submission
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;

    if (query.trim()) {
      // Redirect to the "All Plats" page with the search query
      router.push(`/client/plats/all?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    user &&
    isAuthenticated && (
      <header className="h-16 fixed top-0 left-0 right-0 z-40 bg-orange-500 shadow-md flex items-center px-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            {/* Logo */}
            <Link href={`/${user?.role}`} className="flex items-center">
              <Image
                src={logo || "/placeholder.svg"}
                alt="Logo"
                width={70}
                height={70}
                className="h-16 w-16 rounded-full mr-2"
              />
              <span className="hidden text-white text-lg font-bold md:block">
                YUMMY FLY
              </span>
            </Link>

            <div className="lg:hidden">
              <SideBarSheet config={config} />
            </div>
          </div>
          {user?.role === "restaurant" ||
            (user?.role === "client" && (
              <form
                onSubmit={handleSearch}
                className="flex-1 w-full max-w-[700px] mx-4 relative"
              >
                {/* Search bar with orange blur effect */}
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-400 opacity-30 blur-md rounded-md"></div>
                  <div className="relative">
                    <Search
                      color="white"
                      width={20}
                      height={20}
                      size={24}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-600"
                    />
                    <Input
                      type="search"
                      name="search"
                      placeholder="Qu'est-ce que tu veux manger aujourd'hui ?"
                      className="pl-9 bg-white/60 border-orange-300 h-12 focus-visible:ring-orange-500"
                    />
                  </div>
                </div>
              </form>
            ))}

          <div className="flex items-center gap-4">
            {/* Cart icon with counter */}
            {user?.role === "client" && isAuthenticated && (
              <Link href="/client/cart" className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-orange-600 cursor-pointer bg-transparent relative"
                >
                  <ShoppingCart size={24} />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-white text-orange-600 font-bold border-2 border-orange-500 px-1.5 min-w-[20px] h-5 flex items-center justify-center rounded-full">
                      {cartItemsCount}
                    </Badge>
                  )}
                  <span className="sr-only">Panier</span>
                </Button>
              </Link>
            )}

            {/* User dropdown */}
            <UserDropdown />
          </div>
        </div>
      </header>
    )
  );
}
