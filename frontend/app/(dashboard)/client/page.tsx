"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import useClientStore from "@/store/useClientStore";
import PromotionCarousel from "@/components/client/home/promotion-carousel";
import CategoriesCarousel from "@/components/client/home/categories-carousel";
import PopularDishesCarousel from "@/components/client/home/popular-dishes-carousel";
import RestaurantsCarousel from "@/components/client/home/restaurants-carousel";
import PromotionPlat from "@/components/client/home/promotion-plat";

export default function AccueilPage() {
  const { getAllDisponiblePlats, isLoading } = useClientStore();
  const { initializeCart } = useCartStore();

  useEffect(() => {
    // Initialize cart from localStorage if available
    initializeCart();

    // Fetch available dishes
    const fetchData = async () => {
      await getAllDisponiblePlats();
    };

    fetchData();
  }, [getAllDisponiblePlats, initializeCart]);

  return (
    <>
      <div className="xl:flex-1 m-4">
        <div className="mb-8">
          {" "}
          <PromotionCarousel />
        </div>
        <section className="mb-8">
          <CategoriesCarousel />
        </section>
        <section className="mb-8">
          <PromotionPlat />
        </section>
        <section className="mb-8">
          <PopularDishesCarousel />
        </section>

        <section>
          <RestaurantsCarousel />
        </section>
      </div>
    </>
  );
}
