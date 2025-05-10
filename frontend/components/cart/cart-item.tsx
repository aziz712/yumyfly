"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItem } from "@/store/useCartStore";

interface CartItemComponentProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export function CartItemComponent({
  item,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemComponentProps) {
  return (
    <div className="flex items-start space-x-4 py-4 border-b last:border-0">
      {/* Item Image */}
      <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden">
        <Image
          src={
            process.env.NEXT_PUBLIC_APP_URL + item.images[0] ||
            "/placeholder.svg?height=80&width=80" ||
            "/placeholder.svg"
          }
          alt={item.nom}
          width={80}
          height={80}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-base font-medium">{item.nom}</h4>
        <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
        <div className="mt-1 flex items-center">
          <span className="text-sm font-medium">{item.prix.toFixed(2)} DT</span>
          <span className="mx-2 text-gray-400">×</span>
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
            >
              -
            </Button>
            <span className="w-8 text-center">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Item Total & Remove */}
      <div className="flex flex-col items-end space-y-2">
        <span className="font-medium">
          {(item.prix * item.quantity).toFixed(2)} DT
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => onRemoveItem(item._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
