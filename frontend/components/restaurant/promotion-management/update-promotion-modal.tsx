"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import useRestaurantStore from "@/store/useRestaurantStore";

// Define the Promotion interface
interface Promotion {
  _id: string;
  pourcentage: number;
  dateDebut: string;
  dateFin: string;
  message?: string;
  isPromotionActive: boolean;
  plat: {
    _id: string;
    nom: string;
    prix?: number;
    image?: string;
  };
  prixApresReduction?: number;
  joursRestants?: string;
}

// Define the form schema
const updatePromotionFormSchema = z.object({
  pourcentage: z
    .number()
    .min(1, "Le pourcentage doit être au moins 1%")
    .max(100, "Le pourcentage ne peut pas dépasser 100%"),
  dateDebut: z.date(),
  dateFin: z.date(),
  message: z.string().optional(),
  isActive: z.boolean(),
});

// Fix the import order - move fr import to the top with other imports
import { fr } from "date-fns/locale";

export default function UpdatePromotionModal({
  isOpen,
  onClose,
  promotion,
  onPromotionUpdated
}: {
  isOpen: boolean;
  onClose: () => void;
  promotion: Promotion | null;
  onPromotionUpdated?: () => void;
}) {
  const { updatePromotion, removePromotion, getOwnerProfile } = useRestaurantStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create a fixed reference date for the disabled date check
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Add state for controlling popover manually
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Initialize form with promotion data
  const form = useForm<z.infer<typeof updatePromotionFormSchema>>({
    resolver: zodResolver(updatePromotionFormSchema),
    defaultValues: {
      pourcentage: promotion?.pourcentage || 0,
      dateDebut: promotion?.dateDebut ? new Date(promotion.dateDebut) : new Date(),
      dateFin: promotion?.dateFin ? new Date(promotion.dateFin) : new Date(),
      message: promotion?.message || "",
      isActive: promotion?.isPromotionActive || true,
    },
  });

  // Update form values when promotion changes
  useEffect(() => {
    if (promotion) {
      form.reset({
        pourcentage: promotion.pourcentage,
        dateDebut: new Date(promotion.dateDebut),
        dateFin: new Date(promotion.dateFin),
        message: promotion.message || "",
        isActive: promotion.isPromotionActive,
      });
    }
  }, [promotion, form]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof updatePromotionFormSchema>) => {
    if (!promotion) return;

    setIsSubmitting(true);
    try {
      // If promotion is being deactivated, just remove it
      if (!values.isActive) {
        const success = await removePromotion(promotion.plat._id);
        if (success) {
          // Refresh owner profile to get updated promotions
          await getOwnerProfile();

          // Call the callback if provided
          if (onPromotionUpdated) {
            onPromotionUpdated();
          }

          form.reset();
          onClose();
        }
      } else {
        // Format dates to ISO string
        const formattedData = {
          platId: promotion.plat._id,
          pourcentage: values.pourcentage,
          dateDebut: values.dateDebut.toISOString(),
          dateFin: values.dateFin.toISOString(),
          message: values.message,
        };

        console.log("Updating promotion with data:", formattedData);
        const success = await updatePromotion(promotion.plat._id, formattedData);
        if (success) {
          // Refresh owner profile to get updated promotions
          await getOwnerProfile();

          // Call the callback if provided
          if (onPromotionUpdated) {
            onPromotionUpdated();
          }

          form.reset();
          onClose();
        }
      }
    } catch (error) {
      console.error("Error updating promotion:", error);
      toast.error(
        "Une erreur est survenue lors de la mise à jour de la promotion"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!promotion) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isSubmitting && !open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier la promotion</DialogTitle>
          <DialogDescription>
            Modifiez les détails de la promotion pour{" "}
            <span className="font-semibold">{promotion.plat.nom}</span>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as SubmitHandler<z.infer<typeof updatePromotionFormSchema>>)} className="space-y-6">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Promotion active</FormLabel>
                    <FormDescription>Désactivez la promotion</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pourcentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pourcentage de réduction (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ex: 20"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={!form.watch("isActive")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date Picker - Custom Implementation */}
              <FormField
                control={form.control}
                name="dateDebut"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de début</FormLabel>
                    <div className="relative">
                      <Button
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={!form.watch("isActive")}
                        onClick={() => setStartDateOpen(!startDateOpen)}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                      
                      {startDateOpen && (
                        <div className="absolute z-50 mt-1 bg-white rounded-md border shadow-lg">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date);
                                setStartDateOpen(false);
                              }
                            }}
                            disabled={(date) => date < today}
                            initialFocus
                          />
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* End Date Picker - Custom Implementation */}
              <FormField
                control={form.control}
                name="dateFin"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de fin</FormLabel>
                    <div className="relative">
                      <Button
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={!form.watch("isActive")}
                        onClick={() => setEndDateOpen(!endDateOpen)}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                      
                      {endDateOpen && (
                        <div className="absolute z-50 mt-1 bg-white rounded-md border shadow-lg">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date);
                                setEndDateOpen(false);
                              }
                            }}
                            disabled={(date) => 
                              date < today || 
                              date < form.getValues("dateDebut")
                            }
                            initialFocus
                          />
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Promotion spéciale été"
                      className="resize-none"
                      {...field}
                      disabled={!form.watch("isActive")}
                    />
                  </FormControl>
                  <FormDescription>
                    Un message qui sera affiché avec la promotion
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}