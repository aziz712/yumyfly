"use client";
import type React from "react";
import { useState, useEffect } from "react";
import Header from "@/components/header/Header";
import SideBar from "@/components/side-bar/side-bar";
import { cn } from "@/lib/utils";
import { livreurSidebarConfig } from "@/constants/side-bar-data";
import { useCheckUserAuth } from "@/utils/checkuserAuth";
export default function LivreurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Use the improved hook that returns both authorization and loading state
  const { isAuthorized, isLoading } = useCheckUserAuth("livreur");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 700px)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsCollapsed(e.matches);
    };
    // Set initial state based on current screen size
    setIsCollapsed(mediaQuery.matches);
    // Add listener for changes
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  // Show loading state while checking authorization
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Only render the livreur dashboard if the user is authorized
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Checking authorization...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header config={livreurSidebarConfig} />
      <SideBar config={livreurSidebarConfig} isCollapsed={isCollapsed} />
      <main
        className={cn(
          "pt-16 transition-all duration-300",
          isCollapsed ? "lg:ml-[70px]" : "lg:ml-[250px]"
        )}
      >
        <div className="h-[calc(100vh-4rem)] overflow-auto pt-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
