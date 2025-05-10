// components/DeliveryAssignmentModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
interface DeliveryAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveries: any[];
  onAssign: (deliveryId: string) => void;
}

export function DeliveryAssignmentModal({
  isOpen,
  onClose,
  deliveries,
  onAssign,
}: DeliveryAssignmentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Assigner à un livreur</DialogTitle>
        </DialogHeader>
        <div className="max-h-[500px] overflow-y-auto">
          {deliveries.length === 0 ? (
            <p className="text-center py-4">Aucun livreur disponible</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Livreur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Livraisons</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              typeof delivery.userId === "object"
                                ? process.env.NEXT_PUBLIC_APP_URL +
                                  delivery.userId.photoProfil
                                : ""
                            }
                            alt="Livreur"
                          />
                          <AvatarFallback>
                            {typeof delivery.userId === "object"
                              ? `${delivery.userId.nom.charAt(
                                  0
                                )}${delivery.userId.prenom.charAt(0)}`
                              : "L"}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {typeof delivery.userId === "object"
                            ? `${delivery.userId.nom} ${delivery.userId.prenom}`
                            : "Livreur"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          delivery.disponibilite ? "default" : "secondary"
                        }
                      >
                        {delivery.disponibilite ? "Disponible" : "Occupé"}
                      </Badge>
                    </TableCell>
                    <TableCell>{delivery.completedDeliveries}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{delivery.rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => onAssign(delivery.userId._id)}
                        disabled={!delivery.disponibilite}
                      >
                        Assigner
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
