// app/admin/layout.tsx
"use client";
import React, { useEffect } from "react";
import Header from "@/components/header/Header";
import SideBar from "@/components/side-bar/side-bar";
import { cn } from "@/lib/utils";
import { adminSidebarConfig } from "@/constants/side-bar-data";
import { useCheckUserAuth } from "@/utils/checkuserAuth"; // Make sure the import path is correct

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Use the improved hook that returns both authorization and loading state
  const { isAuthorized, isLoading } = useCheckUserAuth("admin");

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 700px)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsCollapsed(e.matches);
    };
    setIsCollapsed(mediaQuery.matches);
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

  // Only render the admin dashboard if the user is authorized
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Checking authorization...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header config={adminSidebarConfig} />
      <SideBar config={adminSidebarConfig} isCollapsed={isCollapsed} />
      <main
        className={cn(
          "pt-16 transition-all duration-300 px-8",
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
