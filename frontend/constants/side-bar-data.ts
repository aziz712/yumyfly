import {
  LayoutDashboard,
  Store,
  FileText,
  Truck,
  Command,
  Percent,
  ShoppingCart,
  Utensils,
  FolderPlus,
  ChefHat,
  ChartBarStacked,
  ShieldUser,
  UserCog,
  SquareMenu,
  BadgePlus,
  FolderCog,
  IceCreamBowl,
  Users,
} from "lucide-react";
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
export const adminSidebarConfig: SidebarConfig = {
  mainMenu: [
    {
      title: "Tableau de bord",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Gérer tous les utilisateurs",
      path: "/admin/user-management",
      icon: Users,
      submenu: [
        {
          title: "Tous les utilisateurs",
          path: "/admin/user-management",
          icon: Users,
        },
      ],
    },
    {
      title: "Gérer tous les Restaurant",
      path: "/admin/restaurant-management",
      icon: Store,
      submenu: [
        {
          title: "Tous les restaurants",
          path: "/admin/restaurant-management",
          icon: Store,
        },
      ],
    },
    {
      title: "Gérer tous les commandes",
      path: "/admin/commandes-management",
      icon: Command,
      submenu: [
        {
          title: "All commandes",
          path: "/admin/commandes-management",
          icon: Command,
        },
      ],
    },
  ],
  /*   otherMenu: [
      {
        title: "Apps",
        path: "/admin/apps",
        icon: AppWindow,
      },
      {
        title: "Charts",
        path: "/admin/charts",
        icon: BarChart3,
      },
      {
        title: "Bootstrap",
        path: "/admin/bootstrap",
        icon: LifeBuoy,
      },
      {
        title: "Plugins",
        path: "/admin/plugins",
        icon: Puzzle,
        submenu: [
          {
            title: "Plugin 1",
            path: "/admin/plugins/1",
            icon: Puzzle,
          },
          {
            title: "Plugin 2",
            path: "/admin/plugins/2",
            icon: Puzzle,
          },
        ],
      },
      {
        title: "Widget",
        path: "/admin/widget",
        icon: Settings,
      },
      {
        title: "Forms",
        path: "/admin/forms",
        icon: FileText,
      },
      {
        title: "Table",
        path: "/admin/table",
        icon: TableIcon,
      },
      {
        title: "Pages",
        path: "/admin/pages",
        icon: Files,
      },
    ], */
};

export const clientSidebarConfig: SidebarConfig = {
  mainMenu: [
    {
      title: "accueil",
      path: "/client",
      icon: LayoutDashboard,
    },
    {
      title: "Toutes les catégories",
      path: "/client/categories",
      icon: ChartBarStacked,
    },
    {
      title: "Tous les plats",
      path: "/client/plats/all",
      icon: Utensils,
    },
    {
      title: "Tous les restaurants",
      path: "/client/restaurant/",
      icon: Store,
    },
    {
      title: "Mon panier",
      path: "/client/cart",
      icon: ShoppingCart,
    },
    {
      title: "Mes commandes",
      path: "/client/orders",
      icon: FileText,
    },
  ],
};

export const restaurantSidebarConfig: SidebarConfig = {
  mainMenu: [
    {
      title: "Tableau de bord",
      path: "/restaurant",
      icon: LayoutDashboard,
    },
    {
      title: "mon restaurant",
      path: "/restaurant/restaurant-managemnt",
      icon: ChefHat,
      submenu: [
        {
          title: "profil du restaurant",
          path: "/restaurant/restaurant-managemnt",
          icon: ShieldUser,
        },
        {
          title: "mettre à jour mon restaurant",
          path: "/restaurant/restaurant-managemnt/update-restaurant",
          icon: UserCog,
        },
      ],
    },
    {
      title: "Gestion du menu",
      path: "/restaurant/menu",
      icon: SquareMenu,
      submenu: [
        {
          title: "tous les plats",
          path: "/restaurant/menu-managemnt",
          icon: IceCreamBowl,
        },
        {
          title: "ajouter des plat",
          path: "/restaurant/menu-managemnt/create",
          icon: BadgePlus,
        },
      ],
    },
    {
      title: "Gestion des categories",
      path: "/restaurant",
      icon: FolderCog,
      submenu: [
        {
          title: "Toutes les catégories",
          path: "/restaurant/categories-management",
          icon: FileText,
        },
      ],
    },

    {
      title: "Gestion des promotions",
      path: "/restaurant",
      icon: Percent,
      submenu: [
        {
          title: "Toutes les promotions",
          path: "/restaurant/promotion-management",
          icon: Percent,
        },
      ],
    },
    {
      title: "gérer les livreur",
      path: "/restaurant",
      icon: Truck,
      submenu: [
        {
          title: "Toutes les livreur",
          path: "/restaurant/livreur",
          icon: FileText,
        },
        {
          title: "ajouter  livreur",
          path: "/restaurant/livreur/add",
          icon: FolderPlus,
        },
      ],
    },
    {
      title: "Ordres",
      path: "/restaurant/orders",
      icon: Store,
    },
  ],
};

//livreurSideBarConfig
export const livreurSidebarConfig: SidebarConfig = {
  mainMenu: [
    {
      title: "Tableau de bord",
      path: "/livreur",
      icon: LayoutDashboard,
    },
    {
      title: "Ordres",
      path: "/livreur/orders",
      icon: Truck,
    },
  ],
};
