import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  viewAllLink?: string;
}

export function SectionHeader({ title, viewAllLink }: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold">{title}</h2>

      {viewAllLink && (
        <Link
          href={viewAllLink}
          className="text-orange-500 flex items-center hover:underline text-lg font-medium"
        >
          Tout voir <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      )}
    </div>
  );
}
