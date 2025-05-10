"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface EstimationTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (minutes: number) => void;
  initialEstimation?: number;
}

export function EstimationTimeModal({
  isOpen,
  onClose,
  onSave,
  initialEstimation,
}: EstimationTimeModalProps) {
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(
    initialEstimation || 30
  );

  // Reset to initial value when modal opens
  useEffect(() => {
    if (isOpen) {
      setEstimatedMinutes(initialEstimation || 30);
    }
  }, [isOpen, initialEstimation]);

  const handleSave = () => {
    if (estimatedMinutes > 0) {
      onSave(estimatedMinutes);
    } else {
      alert("Veuillez entrer une estimation valide (minimum 1 minute).");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Estimer le temps de livraison
          </DialogTitle>
          <DialogDescription>
            Veuillez indiquer le temps estimé pour livrer cette commande. Cette
            information sera partagée avec le client.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="estimation">Temps estimé (en minutes)</Label>
              <span className="text-2xl font-bold text-orange-500">
                {estimatedMinutes} min
              </span>
            </div>

            <Slider
              id="estimation"
              min={5}
              max={120}
              step={5}
              value={[estimatedMinutes]}
              onValueChange={(value) => setEstimatedMinutes(value[0])}
              className="py-4"
            />

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>5 min</span>
              <span>60 min</span>
              <span>120 min</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="custom-time">Ou entrez une valeur précise:</Label>
            <Input
              id="custom-time"
              type="number"
              min="1"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              className="w-24"
            />
            <span>minutes</span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            className="bg-orange-500 hover:bg-orange-600"
            disabled={estimatedMinutes <= 0}
          >
            Confirmer et démarrer la livraison
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
