"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

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

type SidebarItemProps = {
  id: string;
  item: SidebarItemType;
  isActive: boolean;
  isCollapsed: boolean;
  pathname: string;
  role?: string;
  onClick?: () => void; // Add onClick handler
};

export default function SidebarItem({
  id,
  item,
  isActive,
  isCollapsed,
  pathname,
  role = "admin", // Default role is "admin"
  onClick,
}: SidebarItemProps) {
  const { openSubmenuId, setOpenSubmenuId } =
    React.useContext(OpenSubmenuContext);

  // Extract the role-based prefix from the pathname
  const rolePrefix = `/${role}`;
  const currentPathWithoutRole = pathname.startsWith(rolePrefix)
    ? pathname.slice(rolePrefix.length) // Remove the role prefix
    : pathname;

  // Function to check if a path matches the current route
  const isPathActive = (path: string) => {
    const pathWithoutRole = path.startsWith(rolePrefix)
      ? path.slice(rolePrefix.length)
      : path;

    return (
      currentPathWithoutRole === pathWithoutRole ||
      currentPathWithoutRole.startsWith(pathWithoutRole + "/")
    );
  };

  // Check if any submenu item is active
  const hasActiveSubmenu = item.submenu?.some((subItem) =>
    isPathActive(subItem.path)
  );

  // Initialize isOpen state based on active status or if this is the currently open submenu
  const isThisSubmenuOpen = isCollapsed ? openSubmenuId === id : undefined;
  const [isOpen, setIsOpen] = useState(isActive || hasActiveSubmenu);
  const Icon = item.icon;

  // Update isOpen when active status changes
  useEffect(() => {
    if (isActive || hasActiveSubmenu) {
      setIsOpen(true);
      if (isCollapsed && item.submenu && item.submenu.length > 0) {
        setOpenSubmenuId(id);
      }
    }
  }, [
    isActive,
    hasActiveSubmenu,
    isCollapsed,
    id,
    setOpenSubmenuId,
    item.submenu,
  ]);

  // Update isOpen when openSubmenuId changes (in collapsed mode)
  useEffect(() => {
    if (isCollapsed && item.submenu && item.submenu.length > 0) {
      setIsOpen(openSubmenuId === id);
    }
  }, [openSubmenuId, id, isCollapsed, item.submenu]);

  // Handle click on collapsed menu item with submenu
  const handleCollapsedItemClick = () => {
    if (item.submenu && item.submenu.length > 0) {
      if (isCollapsed) {
        setOpenSubmenuId(openSubmenuId === id ? null : id);
      } else {
        setIsOpen(!isOpen);
      }
    }
  };

  // If item has submenu, render as collapsible
  if (item.submenu && item.submenu.length > 0) {
    return (
      <Collapsible
        open={isCollapsed ? isThisSubmenuOpen : isOpen}
        onOpenChange={isCollapsed ? undefined : setIsOpen}
        className="w-full"
      >
        <div className="flex items-center">
          {isCollapsed ? (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    onClick={handleCollapsedItemClick}
                    className={cn(
                      "flex items-center justify-center h-10 w-full cursor-pointer relative",
                      isActive || hasActiveSubmenu
                        ? "text-orange-500 bg-orange-50"
                        : "text-gray-700 hover:text-orange-500 hover:bg-orange-50/50"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {/* Small indicator for submenu */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      {isThisSubmenuOpen ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <CollapsibleTrigger className="flex items-center w-full px-4 py-2 text-left">
              <div
                className={cn(
                  "flex items-center w-full rounded-md",
                  isActive || hasActiveSubmenu
                    ? "text-orange-500 bg-orange-50"
                    : "text-gray-700 hover:text-orange-500 hover:bg-orange-50/50"
                )}
              >
                <Icon className="h-5 w-5 mr-2" />
                <span className="flex-1">{item.title}</span>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CollapsibleTrigger>
          )}
        </div>

        <CollapsibleContent className="cursor-pointer">
          <div
            className={cn(
              "space-y-1 mt-1",
              isCollapsed
                ? "absolute left-20 top-4 bg-white shadow-lg rounded-md border min-w-[200px] py-2 z-50"
                : "pl-9"
            )}
          >
            <div>
              {item.submenu.map((subItem, index) => {
                const isSubItemActive = isPathActive(subItem.path);
                return (
                  <Link
                    key={index}
                    href={subItem.path}
                    onClick={() => {
                      if (isCollapsed) {
                        setOpenSubmenuId(null);
                      }
                      onClick?.();
                    }}
                    className={cn(
                      "flex items-center px-4 py-2 text-sm rounded-md",
                      isSubItemActive
                        ? "bg-orange-50 text-orange-500 font-medium"
                        : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    )}
                  >
                    <subItem.icon className="h-4 w-4 mr-2" />
                    <span>{subItem.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Simple menu item without submenu
  return (
    <>
      {isCollapsed ? (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={item.path}
                onClick={onClick}
                className={cn(
                  "flex items-center justify-center h-10 w-full rounded-md transition-colors",
                  isActive
                    ? "text-orange-500 bg-orange-50"
                    : "text-gray-700 hover:text-orange-500 hover:bg-orange-50/50"
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              <p>{item.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Link
          href={item.path}
          onClick={onClick}
          className={cn(
            "flex items-center px-4 py-2 rounded-md transition-colors",
            isActive
              ? "bg-orange-50 text-orange-500 font-medium"
              : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
          )}
        >
          <Icon className="h-5 w-5 mr-2" />
          <span>{item.title}</span>
        </Link>
      )}
    </>
  );
}
