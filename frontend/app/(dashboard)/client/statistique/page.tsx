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
import { Calendar, DollarSign, Heart, RefreshCw, Utensils } from "lucide-react";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import Link from "next/link";
export default function ClientDashboard() {
  const {
    clientDashboard,
    isLoadingClientDashboard,
    clientDashboardError,
    fetchClientDashboardKpi,
  } = useKpiStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchClientDashboardKpi();
  }, [fetchClientDashboardKpi]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchClientDashboardKpi();
    setTimeout(() => setIsRefreshing(false), 500);
  };
  console.log({ clientDashboard });
  if (isLoadingClientDashboard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
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

  if (clientDashboardError) {
    return (
      <div className="rounded-md bg-destructive/15 p-6 text-destructive">
        <h3 className="mb-2 font-semibold">
          Erreur lors du chargement du tableau de bord du client
        </h3>
        <p>{clientDashboardError}</p>
        <Button onClick={handleRefresh} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Essayer à nouveau
        </Button>
      </div>
    );
  }

  if (!clientDashboard) {
    return null;
  }

  // Prepare data for spending chart if there are orders
  const spendingData = clientDashboard.lastOrders
    .map((order: any) => ({
      date: format(parseISO(order.createdAt), "MMM dd"),
      amount: order.total,
    }))
    .slice(0, 7); // Get last 7 orders for chart

  // Reverse to show chronological order
  spendingData.reverse();
  return (
    <div className="space-y-6 px-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tableau de bord client
          </h1>
          <p className="text-muted-foreground">
            Aperçu de votre activité de commande et de vos dépenses
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
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Argent dépensé ce mois-ci
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {clientDashboard.totalMoneySpentThisMonth.toFixed(2)} DT
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <Calendar className="mr-1 h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">
                Mensuelle
              </span>{" "}
              dépenses
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Argent dépensé à tout moment
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {clientDashboard.totalMoneySpent.toFixed(2)} DT
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <Calendar className="mr-1 h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">
                tout moment
              </span>{" "}
            </p>
          </CardContent>
        </Card>
        {clientDashboard.mostCommandedPlat.plat && (
          <Card className="overflow-hidden border-l-4 border-l-rose-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Plat le plus commandé
                <Utensils className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 items-center ">
                <Image
                  src={
                    process.env.NEXT_PUBLIC_APP_URL +
                    clientDashboard.mostCommandedPlat.plat.images[0]
                  }
                  alt=""
                  width={100}
                  height={100}
                />
                <p className="font-bold text-2xl">
                  {clientDashboard.mostCommandedPlat.plat.nom}
                </p>
              </div>

              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Heart className="mr-1 h-3 w-3 text-rose-500" />
                <span className="text-rose-500 font-medium">
                  Votre plat
                </span>{" "}
                préféré
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your latest food orders</CardDescription>
        </CardHeader>
        <CardContent>
          {clientDashboard.lastOrders.length > 0 ? (
            <div className="space-y-4">
              {clientDashboard.lastOrders.map((order: any, index: number) => (
                <Link
                  href={`/client/restaurant/${order.restaurant?._id}`}
                  className="hover:text-blue-500"
                >
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {order.restaurant?.images?.[0] ? (
                          <AvatarImage
                            src={
                              order.restaurant.images[0] || "/placeholder.svg"
                            }
                            alt={order.restaurant?.nom || "Restaurant"}
                          />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {order.restaurant?.nom?.charAt(0) || "R"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {order.restaurant?.nom || "Unknown Restaurant"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(
                            parseISO(order.createdAt),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                      <Badge
                        variant="outline"
                        className={
                          order.statut === "en attente"
                            ? "bg-orange-50 text-orange-700 hover:bg-orange-50"
                            : order.statut === "livrée"
                            ? "bg-green-50 text-green-700 hover:bg-green-50"
                            : ""
                        }
                      >
                        {order.statut}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <p className="text-muted-foreground">No recent orders</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <Link href={"/client/orders"} className="cursor-pointer">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer hover:bg-black hover:text-white"
            >
              View All Orders
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
