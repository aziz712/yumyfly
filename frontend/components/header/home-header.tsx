"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Menu, User, MessageCircle } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import logo from "@/public/logo.png";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export default function HomeHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore() as {
    user: any;
    isAuthenticated: boolean;
    logout: () => void;
  };

  const navItems = [
    {
      title: "accueil",
      href: `/`,
      icon: <MessageCircle className="mr-2 h-4 w-4" />,
    },
    {
      title: "à propos de nous",
      href: `/about-us`,
      icon: <MessageCircle className="mr-2 h-4 w-4" />,
    },

    {
      title: "services",
      href: `/services`,
      icon: <MessageCircle className="mr-2 h-4 w-4" />,
    },
    {
      title: "Contactez-nous",
      href: `/contact-us`,
      icon: <MessageCircle className="mr-2 h-4 w-4" />,
    },
  ];
  return (
    !user &&
    !isAuthenticated && (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href={`/`} className="flex items-center gap-2 text-[#155dfc]">
            <Image src={logo} alt="logo" width={60} height={60} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:items-center lg:gap-6">
            {isAuthenticated && (
              <Link
                href={
                  user?.role === "admin"
                    ? "/admin"
                    : user?.role === "restaurant"
                    ? "/restaurant"
                    : user?.role === "livreur"
                    ? "/livreur"
                    : "/client"
                }
                className="text-sm transition-colors font-semibold hover:text-blue-600 ease-in-out duration-300"
              >
                mon tableau de bord
              </Link>
            )}
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="text-sm  transition-colors font-semibold hover:text-blue-600 ease-in-out duration-300"
              >
                {item.title}
              </Link>
            ))}

            <Separator orientation="vertical" className="mx-1 h-6" />
            <div className="flex items-center gap-2">
              {!isAuthenticated && (
                <>
                  <Link href={"/login"}>
                    <Button
                      variant="signInButton"
                      size="sm"
                      className="px-4 hover:border-orange-500 hover:text-orange-500  "
                    >
                      {"se connecter"}
                    </Button>
                  </Link>
                  <Link href={"/register"}>
                    <Button variant="signInButton" size="sm" className="px-4">
                      {"s'inscrire"}
                    </Button>
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <Button
                  variant="outline"
                  className="w-full justify-start bg-red-500 text-white border-0 cursor-pointer hover:border-2 hover:border-red-500"
                  onClick={logout}
                >
                  {"logout"}
                </Button>
              )}
              <div className="flex items-center gap-2"></div>
            </div>
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button size="icon" className="h-9 w-9 p-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="text-left text-2xl font-bold text-primary">
                  <Image src={logo} alt="logo" width={70} height={60} />
                </SheetTitle>
              </SheetHeader>
              <Separator className="my-4" />
              <div className="flex flex-col gap-4 py-4 px-4">
                {isAuthenticated && (
                  <Link
                    href={
                      user?.role === "admin"
                        ? "/admin"
                        : user?.role === "restaurant"
                        ? "/restaurant"
                        : user?.role === "livreur"
                        ? "/livreur"
                        : "/client"
                    }
                    className="flex items-center py-2 text-sm transition-colors font-semibold hover:text-blue-600 ease-in-out duration-300"
                  >
                    <User className="mr-2 h-4 w-4" /> mon tableau de bord
                  </Link>
                )}
                {navItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="flex items-center py-2 text-sm transition-colors font-semibold hover:text-blue-600 ease-in-out duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
                <Separator className="my-2" />
                <div className="flex flex-col gap-2 mt-2">
                  {!isAuthenticated && (
                    <>
                      {" "}
                      <Link href={"/login"}>
                        <Button
                          variant="signInButton"
                          className="w-full justify-start"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="mr-2 h-4 w-4" />
                          {"se connecter"}
                        </Button>
                      </Link>
                      <Link href={"/register"}>
                        <Button
                          variant="signUpButton"
                          className="w-full justify-start"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="mr-2 h-4 w-4" />
                          {"s'inscrire"}
                        </Button>
                      </Link>
                    </>
                  )}
                  {isAuthenticated && (
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-red-500 text-white border-0 cursor-pointer hover:border-2 hover:border-red-500"
                      onClick={logout}
                    >
                      {"logout"}
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    )
  );
}
