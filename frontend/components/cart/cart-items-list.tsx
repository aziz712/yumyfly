"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CartItemComponent } from "./cart-item";
import type { RestaurantGroup } from "@/store/useCartStore";
import { Separator } from "@/components/ui/separator";

interface CartItemsListProps {
  restaurantGroups: RestaurantGroup[];
  onUpdateQuantity: (
    restaurantId: string,
    itemId: string,
    quantity: number
  ) => void;
  onRemoveItem: (restaurantId: string, itemId: string) => void;
  onClearRestaurant: (restaurantId: string) => void;
}

export function CartItemsList({
  restaurantGroups,
  onUpdateQuantity,
  onRemoveItem,
  onClearRestaurant,
}: CartItemsListProps) {
  return (
    <div className="space-y-6">
      {restaurantGroups.map((group) => (
        <Card key={group.restaurantId}>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold flex items-center justify-between">
              <div className="flex items-center">
                <span>{group.restaurantName}</span>
                <Badge className="ml-2 bg-orange-500">
                  {group.items.length} articles
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-500 hover:bg-red-50"
                onClick={() => onClearRestaurant(group.restaurantId)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {group.items.map((item) => (
              <CartItemComponent
                key={item._id}
                item={item}
                onUpdateQuantity={(itemId, quantity) =>
                  onUpdateQuantity(group.restaurantId, itemId, quantity)
                }
                onRemoveItem={(itemId) =>
                  onRemoveItem(group.restaurantId, itemId)
                }
              />
            ))}
            <Separator className="my-4" />
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Link href="/client/plats/all">
          <Button variant="outline">Ajouter plus d'articles</Button>
        </Link>
      </div>
    </div>
  );
}
