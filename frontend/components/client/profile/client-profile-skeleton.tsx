import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ClientProfileSkeleton() {
  return (
    <div className="w-full p-4">
      <Skeleton className="h-10 w-48 mb-8" />

      <div className="grid grid-cols-1 gap-8 w-full">
        <Card>
          <div className="h-32 bg-gray-200"></div>
          <CardContent className="relative pt-0">
            <div className="flex flex-col items-center -mt-16">
              <Skeleton className="h-32 w-32 rounded-full" />

              <div className="mt-4 text-center">
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-6 w-24 mx-auto mt-2" />
              </div>

              <div className="w-full mt-6 space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-full" />
              </div>
            </div>

            <div className="pt-4">
              <Skeleton className="h-10 w-48" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
