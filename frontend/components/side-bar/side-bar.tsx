"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React from "react";
import SidebarItem from "./side-bar-item";
import useAuthStore from "@/store/useAuthStore";

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

type SideBarProps = {
  config?: SidebarConfig;
  isCollapsed: boolean;
};

// Create a context to manage which submenu is open
const OpenSubmenuContext = React.createContext<{
  openSubmenuId: string | null;
  setOpenSubmenuId: (id: string | null) => void;
}>({
  openSubmenuId: null,
  setOpenSubmenuId: () => {},
});

export default function SideBar({
  config = {
    mainMenu: [],
    otherMenu: [],
  },
  isCollapsed,
}: SideBarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);

  return (
    <OpenSubmenuContext.Provider value={{ openSubmenuId, setOpenSubmenuId }}>
      <aside
        className={cn(
          "hidden lg:h-[calc(100vh-4rem)] lg:bg-white border-r lg:transition-all lg:duration-300 lg:fixed lg:top-16 lg:left-0 lg:z-30  lg:block"
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Main Menu Section */}
          {config.mainMenu.length > 0 && (
            <div className="py-4">
              <div className="px-4 mb-2 text-sm font-medium text-gray-500">
                Main Menu
              </div>

              <div className="space-y-1">
                {config.mainMenu.map((item, index) => (
                  <SidebarItem
                    key={index}
                    id={`main-${index}`}
                    item={item}
                    isActive={
                      pathname === item.path ||
                      pathname.startsWith(item.path + "/")
                    }
                    role={user?.role}
                    isCollapsed={isCollapsed}
                    pathname={pathname}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Menu Section */}
          {config.otherMenu && config.otherMenu.length > 0 && (
            <div className="py-4 border-t">
              <div className="px-4 mb-2 text-sm font-medium text-gray-500">
                Other
              </div>

              <div className="space-y-1">
                {config.otherMenu.map((item, index) => (
                  <SidebarItem
                    key={index}
                    id={`other-${index}`}
                    item={item}
                    isActive={
                      pathname === item.path ||
                      pathname.startsWith(item.path + "/")
                    }
                    role={user?.role}
                    isCollapsed={isCollapsed}
                    pathname={pathname}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </OpenSubmenuContext.Provider>
  );
}
