import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Tag } from "lucide-react";
import Link from "next/link";

interface PlatInfoProps {
  plat: any;
}

export default function PlatInfo({ plat }: PlatInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{plat.nom}</h1>
        {plat.disponible ? (
          <Badge className="bg-green-500 hover:bg-green-600">Disponible</Badge>
        ) : (
          <Badge variant="destructive">Indisponible</Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Tag className="h-4 w-4" />
          <Link
            href={`/client/categories/${plat.categorie._id}`}
            className="hover:text-primary hover:underline"
          >
            {plat.categorie.nom}
          </Link>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1">
          <CalendarDays className="h-4 w-4" />
          {new Date(plat.createdAt).toLocaleDateString()}
        </div>
        <span>•</span>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {plat.restaurant.workingHours?.from} -{" "}
          {plat.restaurant.workingHours?.to}
        </div>
      </div>

      <div className="text-2xl font-bold text-primary">
        {plat.prix.toFixed(2)} DT
      </div>

      <p className="text-gray-700 leading-relaxed max-w-full break-words overflow-hidden text-wrap">
        {plat.description}
      </p>
    </div>
  );
}
