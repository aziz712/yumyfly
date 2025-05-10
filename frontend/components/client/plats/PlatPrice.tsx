import React from 'react';
import { Plat } from '@/services/clientPromotion';
import { isPlatPromotionActive, getCurrentPlatPrice } from '@/services/clientPromotion';

interface PlatPriceProps {
  plat: Plat;
  className?: string;
}

export default function PlatPrice({ plat, className = '' }: PlatPriceProps) {
  const isPromotionActive = isPlatPromotionActive(plat);
  const currentPrice = getCurrentPlatPrice(plat);
  
  if (!isPromotionActive) {
    return <span className={className}>{plat.prix.toFixed(2)} DT</span>;
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-primary font-semibold">{currentPrice.toFixed(2)} €</span>
      <span className="text-muted-foreground line-through text-sm">{plat.prix.toFixed(2)} €</span>
      <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-md">
        -{plat.promotion?.pourcentage}%
      </span>
    </div>
  );
}