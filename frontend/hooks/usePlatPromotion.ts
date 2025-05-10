import { useState, useEffect } from 'react';
import { getPlatWithPromotion, getCurrentPlatPrice, isPlatPromotionActive } from '@/services/clientPromotion';
import { Plat } from '@/services/clientPromotion';

export function usePlatPromotion(platId: string) {
  const [plat, setPlat] = useState<Plat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [isPromotionActive, setIsPromotionActive] = useState(false);
  const [promotionPercentage, setPromotionPercentage] = useState<number | null>(null);

  useEffect(() => {
    const fetchPlat = async () => {
      try {
        setLoading(true);
        const platData = await getPlatWithPromotion(platId);
        
        if (platData) {
          setPlat(platData);
          setOriginalPrice(platData.prix);
          setCurrentPrice(getCurrentPlatPrice(platData));
          setIsPromotionActive(isPlatPromotionActive(platData));
          
          if (platData.promotion) {
            setPromotionPercentage(platData.promotion.pourcentage);
          }
        }
      } catch (err) {
        setError('Failed to load plat details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (platId) {
      fetchPlat();
    }
  }, [platId]);

  // Check promotion status periodically to update if promotion expires
  useEffect(() => {
    if (!plat) return;

    const checkPromotionStatus = () => {
      const isActive = isPlatPromotionActive(plat);
      setIsPromotionActive(isActive);
      setCurrentPrice(getCurrentPlatPrice(plat));
    };

    // Check every minute
    const interval = setInterval(checkPromotionStatus, 60000);
    
    return () => clearInterval(interval);
  }, [plat]);

  return {
    plat,
    loading,
    error,
    currentPrice,
    originalPrice,
    isPromotionActive,
    promotionPercentage
  };
}