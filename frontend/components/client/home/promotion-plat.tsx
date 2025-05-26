"use client";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/client/home/section-header";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Clock, ShoppingCart, Percent } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import clientPromotionService, { Promotion } from "@/services/clientPromotion";

export default function PromotionPlat() {
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const activePromotions = await clientPromotionService.getAllActivePromotions();
        setPromotions(activePromotions);
      } catch (error) {
        console.error("Error fetching promotions:", error);
        toast.error("Impossible de charger les promotions");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToPanier = async (platId: string, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigation
    event.stopPropagation(); // Stop event propagation

    try {
      await clientPromotionService.addToCartWithPromotion(platId);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Impossible d'ajouter au panier");
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 my-10">
      <SectionHeader title="Promotions Spéciales" viewAllLink="/client/plats/all" />

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : promotions && promotions.length > 0 ? (
        <Carousel
          plugins={[autoplayPlugin.current]}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
            slidesToScroll: 1,
          }}
        >
          <CarouselContent className="-ml-4">
            {promotions.map((promotion) => (
              <CarouselItem
                key={promotion._id}
                className={`pl-4 mx-auto w-full sm:basis-full md:basis-1/2 xl:basis-1/3`}
              >
                <Link
                  href={`/client/plats/${promotion.plat._id}`}
                  key={promotion._id}
                  className="group"
                >
                  <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg group-hover:border-primary max-w-[350px]">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        width={350}
                        height={200}
                        src={
                          (process.env.NEXT_PUBLIC_APP_URL || "") +
                          (promotion.plat.image || "/placeholder.svg")
                        }
                        alt={promotion.plat.nom}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Promotion Badge */}
                      <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                        <Percent className="h-3 w-3 mr-1" />
                        {clientPromotionService.getPromotionBadgeText(promotion.pourcentage)}
                      </Badge>

                      {/* Time Remaining Badge */}
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="outline" className="bg-black/70 text-white border-none">
                          <Clock className="h-3 w-3 mr-1" />
                          {promotion.joursRestants}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{promotion.plat.nom}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {promotion.plat.description || clientPromotionService.getPromotionMessage(promotion)}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">
                            {promotion.prixApresReduction?.toFixed(2)} DT
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {promotion.plat.prix.toFixed(2)} DT
                          </span>
                        </div>

                        <Button

                          size="sm"
                          onClick={(e) => handleAddToPanier(promotion.plat._id, e)}
                          className="rounded-full h-8 w-8 p-0 hover:bg-gray-50 hover:border-2 border hover:text-gray-900 border-gray-700 cursor-pointer hover:scale-130 duration-300"
                        >
                          <ShoppingCart className="h-4 w-4 cursor-pointer" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">Aucune promotion disponible pour le moment.</p>
        </div>
      )}

     
    </div>
  );
}