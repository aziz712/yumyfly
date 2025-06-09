import { Building, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface RestaurantCardProps {
  restaurant: any;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100">
            <Image
              width={100}
              height={100}
              src={(
                restaurant.images && restaurant.images.length > 0
                  ? process.env.NEXT_PUBLIC_APP_URL + restaurant.images[0]
                  : "/placeholder.svg?height=100&width=100"
              )}
              alt={restaurant.nom}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{restaurant.nom}</h3>
            <p className="text-sm text-gray-500">YUMMY FLY Partner</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex gap-2">
            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1" />
            <span className="text-gray-700">{restaurant.adresse}</span>
          </div>
          <div className="flex gap-2">
            <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-700">{restaurant.telephone}</span>
          </div>
          <div className="flex gap-2">
            <Building className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1" />
            <div>
              <p className="text-gray-700">Horaires de travail</p>
              <p className="text-gray-500">
                {restaurant.workingHours?.from} - {restaurant.workingHours?.to}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0">
        <Link
          href={`/client/restaurant/${restaurant._id}`}
          className="w-full cursor-pointer"
        >
          <Button variant="outline" className="w-full">
            Voir le restaurant
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
