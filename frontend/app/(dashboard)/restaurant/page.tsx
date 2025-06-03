"use client";

import { useEffect, useState } from "react";
import { useKpiStore } from "@/store/useKpiStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ChefHat,
  Clock,
  DollarSign,
  Download,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  Utensils,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import Link from "next/link";

export default function RestaurantDashboard() {
  const {
    restaurantOwnerDashboard,
    isLoadingRestaurantOwnerDashboard,
    restaurantOwnerDashboardError,
    fetchRestaurantOwnerDashboardKpi,
  } = useKpiStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchRestaurantOwnerDashboardKpi();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    await fetchRestaurantOwnerDashboardKpi();

    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoadingRestaurantOwnerDashboard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (restaurantOwnerDashboardError) {
    return (
      <div className="rounded-md bg-destructive/15 p-6 text-destructive">
        <h3 className="mb-2 font-semibold">
          Error Loading Restaurant Dashboard
        </h3>
        <p>{restaurantOwnerDashboardError}</p>
        <Button onClick={handleRefresh} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }
  if (!restaurantOwnerDashboard) {
    return null;
  }
  console.log(restaurantOwnerDashboard.mostCommandedPlats[0]);
  // Prepare data for popular dishes chart
  const popularDishesData = restaurantOwnerDashboard.mostCommandedPlats.map(
    (item) => ({
      name: item._id.nom || "Unknown Dish",
      value: item.totalQuantity,
    })
  );

  // Generate colors for the pie chart
  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#06b6d4",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tableau de bord du restaurant
          </h1>
          <p className="text-muted-foreground">
            Aperçu des performances de votre restaurant
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="shrink-0"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Actualiser les données
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Revenu total
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {restaurantOwnerDashboard.totalRevenue.toFixed(2)} DT
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">
                Bénéfice
              </span>{" "}
              <span className="pl-1">global</span>
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Total des commandes
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {restaurantOwnerDashboard.totalCommandes}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="mr-1 h-3 w-3 text-blue-500" />
              <span className="text-blue-500 font-medium">Complété</span> 
              <span className="pl-1">orders</span>
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              personnel de livraison
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {restaurantOwnerDashboard.totalLivreurs}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="mr-1 h-3 w-3 text-purple-500" />
              <span className="text-purple-500 font-medium">Équipe</span> 
              <span className="pl-1">de livraison active </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Popular Dishes Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Plats les plus populaires</CardTitle>
                <CardDescription>Vos plats les plus vendus</CardDescription>
              </div>
              <Utensils className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {popularDishesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={popularDishesData}
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <XAxis type="number" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        value.length > 15
                          ? `${value.substring(0, 15)}...`
                          : value
                      }
                    />
                    <Tooltip
                      formatter={(value) => [`${value} orders`, "Quantity"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">
                    Aucune donnée de plat disponible
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Répartition de la popularité des plats</CardTitle>
                <CardDescription>
                  Proportion des commandes par plat
                </CardDescription>
              </div>
              <ChefHat className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {popularDishesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={popularDishesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      dataKey="value"
                      paddingAngle={2}
                      label={({ name, percent }) =>
                        `${name.substring(0, 10)}... ${(percent * 100).toFixed(
                          0
                        )}%`
                      }
                      labelLine={false}
                    >
                      {popularDishesData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} orders`, "Quantity"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">
                    Aucune donnée de plat disponible
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Commandes récentes</CardTitle>
              <CardDescription>
                Dernières commandes dans votre restaurant
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {restaurantOwnerDashboard.recentOrders &&
          restaurantOwnerDashboard.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      ID de commande
                    </th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      Client
                    </th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      Articles
                    </th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      Total
                    </th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      Statut
                    </th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {restaurantOwnerDashboard.recentOrders.map((order: any) => (
                    <tr key={order._id} className="border-b hover:bg-muted/50">
                      <td className="py-3 text-sm">
                        <span className="font-mono text-xs">
                          {order._id.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={order.client?.photoProfil || ""}
                              alt={`${order.client?.nom || ""} ${
                                order.client?.prenom || ""
                              }`}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {order.client?.nom?.charAt(0) || "C"}
                              {order.client?.prenom?.charAt(0) || ""}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {order.client?.nom || ""}{" "}
                              {order.client?.prenom || ""}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.client?.email || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-col gap-1">
                          {order.plats?.map((plat: any) => (
                            <div
                              key={plat._id}
                              className="flex items-center gap-1"
                            >
                              <span className="text-xs font-medium">
                                {plat.nom}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                x{plat.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-sm font-medium">
                          ${order.total?.toFixed(2) || "0.00"}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {order.payee ? "Paid" : "Unpaid"}
                        </p>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={
                            order.statut === "en attente"
                              ? "outline"
                              : "default"
                          }
                          className={
                            order.statut === "en attente"
                              ? "flex bg-orange-50 text-orange-700 hover:bg-orange-50"
                              : order.statut === "livrée"
                              ? "flex bg-green-100 text-green-700 hover:bg-green-100"
                              : ""
                          }
                        >
                          {order.statut === "en attente" ? (
                            <Clock className="mr-1 h-3 w-3" />
                          ) : order.statut === "livrée" ? (
                            <Package className="mr-1 h-3 w-3" />
                          ) : order.statut === "en route" ? (
                            <Truck className="mr-1 h-3 w-3" />
                          ) : order.statut === "préparation" ? (
                            <ChefHat className="mr-1 h-3 w-3" />
                          ) : null}
                          {order.statut}
                        </Badge>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">
                        {order.createdAt
                          ? format(
                              parseISO(order.createdAt),
                              "MMM dd, yyyy HH:mm"
                            )
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <p className="text-muted-foreground">Aucune commande récente</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <Link href={"/restaurant/orders"}>
            <Button variant="outline" size="sm">
              Voir toutes les commandes
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
