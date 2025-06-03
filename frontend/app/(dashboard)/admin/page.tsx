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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Sector,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import {
  ArrowUpRight,
  Building2,
  ChefHat,
  Clock,
  DollarSign,
  Download,
  FileBarChart,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";

export default function AdminDashboard() {
  const {
    adminDashboard,
    isLoadingAdminDashboard,
    adminDashboardError,
    fetchAdminDashboardKpi,
  } = useKpiStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAdminDashboardKpi();
  }, [fetchAdminDashboardKpi]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAdminDashboardKpi();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoadingAdminDashboard) {
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

  if (adminDashboardError) {
    return (
      <div className="rounded-md bg-destructive/15 p-6 text-destructive">
        <h3 className="mb-2 font-semibold">Error Loading Dashboard</h3>
        <p>{adminDashboardError}</p>
        <Button onClick={handleRefresh} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  if (!adminDashboard) {
    return null;
  }

  // Prepare data for order status chart
  const orderStatusData = [
    {
      name: "Pending",
      value: adminDashboard.commandesStatistics.enAttente,
      color: "#f59e0b",
    },
    {
      name: "Delivered",
      value: adminDashboard.commandesStatistics.livree,
      color: "#10b981",
    },
    {
      name: "In Route",
      value: adminDashboard.commandesStatistics.enRoute,
      color: "#3b82f6",
    },
    {
      name: "Assigned",
      value: adminDashboard.commandesStatistics.assignee,
      color: "#8b5cf6",
    },
    {
      name: "Preparation",
      value: adminDashboard.commandesStatistics.preparation,
      color: "#ec4899",
    },
    {
      name: "Ready",
      value: adminDashboard.commandesStatistics.prete,
      color: "#06b6d4",
    },
  ].filter((item) => item.value > 0); // Only show statuses with values

  // Format for bar chart
  const orderStatusBarData = orderStatusData.map((item) => ({
    status: item.name,
    count: item.value,
    fill: item.color,
  }));

  // Calculate percentage for each status
  const totalOrders = adminDashboard.totalNumberOfCommandes;
  const percentageData = orderStatusData.map((item) => ({
    ...item,
    percentage: Math.round((item.value / totalOrders) * 100),
  }));

  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;

    return (
      <g>
        <text
          x={cx}
          y={cy}
          dy={-20}
          textAnchor="middle"
          fill="#888888"
          className="text-xs"
        >
          {payload.name}
        </text>
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          fill="#000000"
          className="text-lg font-semibold"
        >
          {value}
        </text>
        <text
          x={cx}
          y={cy}
          dy={20}
          textAnchor="middle"
          fill="#888888"
          className="text-xs"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tableau de bord d'administration
          </h1>
          <p className="text-muted-foreground">
            Aperçu des performances de votre plateforme de livraison de
            restaurant
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
        <Card className="overflow-hidden border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Total Restaurants
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {adminDashboard.totalNumberOfRestaurants}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">
                Partenaires de restauration 
              </span>{" "}
               <span className="pl-1">actifs</span>
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Nombre total d'utilisateurs
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {adminDashboard.totalNumberOfUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">Base </span>{" "}
              <span className="pl-1">d'utilisateurs croissante</span> 
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
              {adminDashboard.totalNumberOfCommandes}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="outline" className="text-xs bg-blue-50">
                <Clock className="mr-1 h-3 w-3" />{" "}
                {adminDashboard.commandesStatistics.enAttente} en attente
              </Badge>
              <Badge variant="outline" className="text-xs bg-green-50">
                <Package className="mr-1 h-3 w-3" />{" "}
                {adminDashboard.commandesStatistics.livree} livré
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Revenu total
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {adminDashboard.totalRevenue.toFixed(2)}DT
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">Flux</span>
              <span className="pl-1">de revenus sain</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Statistics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Répartition du statut des commandes</CardTitle>
                <CardDescription>
                  Répartition des commandes par statut actuel
                </CardDescription>
              </div>
              <FileBarChart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={orderStatusBarData}
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
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pourcentage de statut de commande</CardTitle>
                <CardDescription>
                  Proportion des commandes par statut
                </CardDescription>
              </div>
              <ChartContainer
                config={{
                  pending: {
                    label: "Pending",
                    color: "#f59e0b",
                  },
                  delivered: {
                    label: "Delivered",
                    color: "#10b981",
                  },
                  inRoute: {
                    label: "In Route",
                    color: "#3b82f6",
                  },
                  assigned: {
                    label: "Assigned",
                    color: "#8b5cf6",
                  },
                  preparation: {
                    label: "Preparation",
                    color: "#ec4899",
                  },
                  ready: {
                    label: "Ready",
                    color: "#06b6d4",
                  },
                }}
              >
                <FileBarChart className="h-5 w-5 text-muted-foreground" />
              </ChartContainer>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={percentageData}
                    cx="50%"
                    cy="50%"
                    activeIndex={0}
                    activeShape={renderActiveShape}
                    innerRadius={70}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {percentageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    formatter={(value, entry, index) => {
                      const item = percentageData[index];
                      return `${value} (${item.percentage}%)`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
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
                Dernières commandes dans tous les restaurants
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    Numéro de commande
                  </th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    Client
                  </th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    Restaurant
                  </th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    Articles
                  </th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {adminDashboard.recentOrders.map((order) => (
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
                            src={order.client.photoProfil || ""}
                            alt={`${order.client.nom} ${order.client.prenom}`}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {order.client.nom.charAt(0)}
                            {order.client.prenom.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {order.client.nom} {order.client.prenom}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.client.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <p className="text-sm font-medium">
                        {order.restaurant.nom}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {order.restaurant.adresse}
                      </p>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col gap-1">
                        {order.plats.map((plat: any) => (
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
                        {order.total.toFixed(2)}DT
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {order.payee ? "Paid" : "Unpaid"}
                      </p>
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          order.statut === "en attente" ? "outline" : "default"
                        }
                        className={
                          order.statut === "en attente"
                            ? "bg-orange-50 text-orange-700 hover:bg-orange-50"
                            : order.statut === "livrée"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
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
                      {format(parseISO(order.createdAt), "MMM dd, yyyy HH:mm")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <Link href={"/admin/commandes-management"}>
            <Button variant="outline" size="sm">
              Voir toutes les commandes
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
