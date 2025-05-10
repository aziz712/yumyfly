"use client";

import { useEffect, useState } from "react";
import { useKpiStore } from "@/store/useKpiStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  RefreshCw,
  TrendingUp,
  Truck,
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

export default function DeliveryStatistics() {
  const {
    restaurantDeliveryStats,
    isLoadingRestaurantDeliveryStats,
    restaurantDeliveryStatsError,
    fetchRestaurantDeliveryStatistics,
  } = useKpiStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchRestaurantDeliveryStatistics();
  }, [fetchRestaurantDeliveryStatistics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    await fetchRestaurantDeliveryStatistics();

    setTimeout(() => setIsRefreshing(false), 500);
  };
  if (isLoadingRestaurantDeliveryStats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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

  if (restaurantDeliveryStatsError) {
    return (
      <div className="rounded-md bg-destructive/15 p-6 text-destructive">
        <h3 className="mb-2 font-semibold">
          Erreur lors du chargement des statistiques de livraison
        </h3>
        <p>{restaurantDeliveryStatsError}</p>
        <Button onClick={handleRefresh} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Essayer à nouveau
        </Button>
      </div>
    );
  }

  if (!restaurantDeliveryStats) {
    return null;
  }

  // Prepare data for delivery status chart
  const deliveryStatusData = [
    {
      name: "Delivered",
      value: restaurantDeliveryStats.deliveredCommandes,
      color: "#10b981",
    },
    {
      name: "En Route",
      value: restaurantDeliveryStats.enRouteCommandes,
      color: "#3b82f6",
    },
    {
      name: "Assigned",
      value: restaurantDeliveryStats.assignedCommandes,
      color: "#8b5cf6",
    },
  ].filter((item) => item.value > 0); // Only show statuses with values

  // Format for bar chart
  const deliveryStatusBarData = deliveryStatusData.map((item) => ({
    status: item.name,
    count: item.value,
    fill: item.color,
  }));

  // Calculate total orders
  const totalOrders =
    restaurantDeliveryStats.deliveredCommandes +
    restaurantDeliveryStats.enRouteCommandes +
    restaurantDeliveryStats.assignedCommandes;

  return (
    <div className="space-y-6 p-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Statistiques de livraison
          </h1>
          <p className="text-muted-foreground">
            Aperçu des performances de livraison pour ce restaurant
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Commandes livrées
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {restaurantDeliveryStats.deliveredCommandes}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">
                {totalOrders > 0
                  ? `${Math.round(
                      (restaurantDeliveryStats.deliveredCommandes /
                        totalOrders) *
                        100
                    )}%`
                  : "0%"}
              </span>{" "}
              taux d'achèvement
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Commandes en route
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {restaurantDeliveryStats.enRouteCommandes}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <Clock className="mr-1 h-3 w-3 text-blue-500" />
              <span className="text-blue-500 font-medium">Livraisons</span>{" "}
              actives
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Ordres assignés
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {restaurantDeliveryStats.assignedCommandes}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <Clock className="mr-1 h-3 w-3 text-purple-500" />
              <span className="text-purple-500 font-medium">
                En attente de
              </span>{" "}
              ramassage
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Chiffre d'affaires d'aujourd'hui
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {restaurantDeliveryStats.todaysRevenue.toFixed(2)} DT
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">Gains</span>{" "}
              quotidiens
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              revenus mensuels
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {restaurantDeliveryStats.monthlyRevenue.toFixed(2)} DT
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">
                revenus{" "}
              </span>{" "}
              mensuels
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Status Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Répartition des statuts de livraison</CardTitle>
            <CardDescription>
              Répartition des commandes par statut de livraison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {deliveryStatusBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={deliveryStatusBarData}
                    layout="vertical"
                    margin={{ left: 80 }}
                  >
                    <XAxis type="number" />
                    <YAxis dataKey="status" type="category" width={80} />
                    <Tooltip
                      formatter={(value) => [`${value} orders`, "Count"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">
                    Aucune donnée de livraison disponible
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Pourcentage de statut de livraison</CardTitle>
            <CardDescription>
              Proportion des commandes par statut de livraison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {deliveryStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deliveryStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      dataKey="value"
                      paddingAngle={2}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {deliveryStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} orders`, "Count"]}
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
                    Aucune donnée de livraison disponible
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
