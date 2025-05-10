import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Gallery and Restaurant */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery skeleton */}
          <div className="space-y-4">
            <Skeleton className="w-full aspect-[16/9] rounded-xl" />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="w-20 h-20 rounded-md flex-shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Mobile info skeleton */}
          <div className="md:hidden space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-full" />
            <Separator className="my-6" />
          </div>

          {/* Ingredients skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Comments skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />

            <div className="space-y-6 mt-8">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Info, Actions, Restaurant */}
        <div className="space-y-8">
          <div className="hidden md:block space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-full" />
            <Separator className="my-6" />
          </div>

          {/* Restaurant card skeleton */}
          <Skeleton className="w-full h-64 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
