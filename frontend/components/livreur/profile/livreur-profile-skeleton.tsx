import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LivreurProfileSkeleton() {
  return (
    <div className="w-full p-4">
      <Skeleton className="h-10 w-48 mb-8" />

      <div className="grid grid-cols-1 gap-8 w-full">
        <Card className="overflow-hidden">
          <div className="h-32 bg-gray-200" />
          <CardContent className="relative p-6">
            <div className="absolute -top-12 left-6">
              <Skeleton className="h-24 w-24 rounded-full" />
            </div>

            <div className="mt-14 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="flex items-center gap-2 mt-2">
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
              <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Informations</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Skeleton className="h-10 w-40" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="pt-4">
                  <Skeleton className="h-10 w-48" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
