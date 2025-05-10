"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { adminSidebarConfig } from "@/constants/side-bar-data";
import React from "react";
import SidebarItem from "./side-bar-item";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Image from "next/image";
import logo from "@/public/logo.png";
import useAuthStore from "@/store/useAuthStore";

// Create a context to manage which submenu is open
const SheetOpenSubmenuContext = React.createContext<{
  openSubmenuId: string | null;
  setOpenSubmenuId: (id: string | null) => void;
}>({
  openSubmenuId: null,
  setOpenSubmenuId: () => {},
});
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
type SheetProps = {
  config?: SidebarConfig;
};

export default function SideBarSheet({
  config = {
    mainMenu: [],
    otherMenu: [],
  },
}: SheetProps) {
  const pathname = usePathname();
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore();

  // Reset open submenu when sheet closes
  useEffect(() => {
    if (!open) {
      setOpenSubmenuId(null);
    }
  }, [open]);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="text-white hover:bg-orange-600 cursor-pointer bg-transparent"
        >
          <Menu size={24} />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[280px] bg-white">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center">
            <Image
              src={logo || "/placeholder.svg"}
              alt="Logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full mr-2"
            />
            <span className="text-orange-500 font-bold">YUMMY FLY</span>
          </SheetTitle>
        </SheetHeader>

        <SheetOpenSubmenuContext.Provider
          value={{ openSubmenuId, setOpenSubmenuId }}
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
                      id={`sheet-main-${index}`}
                      item={item}
                      isActive={
                        pathname === item.path ||
                        pathname.startsWith(item.path + "/")
                      }
                      isCollapsed={false}
                      pathname={pathname}
                      onClick={() => setOpen(false)}
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
                      id={`sheet-other-${index}`}
                      item={item}
                      isActive={
                        pathname === item.path ||
                        pathname.startsWith(item.path + "/")
                      }
                      isCollapsed={false}
                      pathname={pathname}
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </SheetOpenSubmenuContext.Provider>
      </SheetContent>
    </Sheet>
  );
}
