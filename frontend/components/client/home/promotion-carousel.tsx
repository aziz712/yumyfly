"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Mock promotions data
const promotions = [
  {
    id: "1",
    title: "EVERYDAY IS WING DAY",
    price: " 6.99 DT",
    description: "Sauced up goodness!",
    image:
      "https://www.southernliving.com/thmb/bCrxpdhq9KTcDsqrjEdqbnV0_V0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/27793_SnacT_FireQuesadillas_209-1-9423bf482c1f464581040613234d2f27.jpg",
    backgroundColor: "from-orange-400 to-red-700",
  },
  {
    id: "2",
    title: "PIZZA MADNESS",
    price: " 8.99 DT",
    description: "Buy one, get one free!",
    image:
      "https://www.southernliving.com/thmb/bCrxpdhq9KTcDsqrjEdqbnV0_V0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/27793_SnacT_FireQuesadillas_209-1-9423bf482c1f464581040613234d2f27.jpg",
    backgroundColor: "from-blue-500 to-purple-700",
  },
  {
    id: "3",
    title: "BURGER BONANZA",
    price: " 5.59 DT",
    description: "Limited time offer!",
    image:
      "https://www.southernliving.com/thmb/bCrxpdhq9KTcDsqrjEdqbnV0_V0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/27793_SnacT_FireQuesadillas_209-1-9423bf482c1f464581040613234d2f27.jpg",
    backgroundColor: "from-green-500 to-teal-700",
  },
];

export default function PromotionCarousel() {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {promotions.map((promo) => (
          <CarouselItem key={promo.id}>
            <Card
              className={`overflow-hidden relative h-64 bg-gradient-to-r ${promo.backgroundColor}`}
            >
              <div className="flex h-full">
                <div className="flex-1 p-8 flex flex-col justify-center text-white">
                  <div className="text-2xl lg:text-4xl font-bold mb-2">
                    {promo.price}
                  </div>
                  <h2 className="text-xl lg:text-3xl font-bold mb-2">
                    {promo.title}
                  </h2>
                  <p className="lg:text-xl mb-4">{promo.description}</p>
                  <div className="text-sm">Limited time offer. Order now!</div>
                </div>
                <div className="w-1/2 relative">
                  <Image
                    src={`https://www.southernliving.com/thmb/bCrxpdhq9KTcDsqrjEdqbnV0_V0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/27793_SnacT_FireQuesadillas_209-1-9423bf482c1f464581040613234d2f27.jpg`}
                    alt={promo.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );
}
