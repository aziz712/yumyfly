"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import useRestaurantStore from "@/store/useRestaurantStore";
import usePlatsStore from "@/store/usePlatsStore";

// Define the form schema
const promotionFormSchema = z.object({
  platIds: z.array(z.string()).min(1, "Veuillez sélectionner au moins un plat"),
  pourcentage: z
    .number()
    .min(1, "Le pourcentage doit être au moins 1%")
    .max(100, "Le pourcentage ne peut pas dépasser 100%"),
  dateDebut: z.date(),
  dateFin: z.date(),
  message: z.string().optional(),
});

export default function CreatePromotionModal({
  isOpen,
  onClose,
  onPromotionCreated
}: {
  isOpen: boolean;
  onClose: () => void;
  onPromotionCreated?: () => void;
}) {
  const { applyPromotion, getOwnerProfile } = useRestaurantStore();
  const { getAllPlats, plats } = usePlatsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availablePlats, setAvailablePlats] = useState<any[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  
  // Add state for date pickers
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  // Add search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Reference date for validation
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Initialize form
  const form = useForm<z.infer<typeof promotionFormSchema>>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      platIds: [],
      pourcentage: 10,
      dateDebut: new Date(),
      dateFin: new Date(new Date().setDate(new Date().getDate() + 7)), // Default to 7 days from now
      message: "",
    },
  });

  // Load plats when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadPlats = async () => {
        try {
          await getAllPlats();
        } catch (error) {
          console.error("Error loading plats:", error);
          toast.error("Erreur lors du chargement des plats");
        }
      };
      loadPlats();
    }
  }, [isOpen, getAllPlats]);

  // Filter plats to only include those without active promotions
  useEffect(() => {
    if (plats) {
      const platsWithoutPromotion = plats.filter(
        (plat) => !plat?.promotion || !plat.promotion.isPromotionActive
      );
      setAvailablePlats(platsWithoutPromotion);
    }
  }, [plats]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof promotionFormSchema>) => {
    setIsSubmitting(true);
    try {
      // Format dates to ISO string
      const formattedData = {
        platId: values.platIds, // This is already an array
        pourcentage: values.pourcentage,
        dateDebut: values.dateDebut.toISOString(),
        dateFin: values.dateFin.toISOString(),
        message: values.message,
      };

      console.log("Applying promotion with data:", formattedData);
      const success = await applyPromotion(formattedData);
      
      if (success) {
        // Refresh owner profile to get updated promotions
        await getOwnerProfile();
        
        // Call the callback if provided
        if (onPromotionCreated) {
          onPromotionCreated();
        }
        
        toast.success("Promotion appliquée avec succès");
        form.reset();
        onClose();
      }
    } catch (error) {
      console.error("Error applying promotion:", error);
      toast.error("Une erreur est survenue lors de l'application de la promotion");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter plats based on search query
  const filteredPlats = availablePlats.filter(plat => 
    plat.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter une promotion</DialogTitle>
          <DialogDescription>
            Créez une nouvelle promotion pour un ou plusieurs plats
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="platIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plats</FormLabel>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value.length && "text-muted-foreground"
                      )}
                      onClick={() => setOpenCombobox(!openCombobox)}
                    >
                      {field.value.length > 0
                        ? `${field.value.length} plat(s) sélectionné(s)`
                        : "Sélectionner des plats"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                    
                    {openCombobox && (
                      <div className="absolute z-50 w-full mt-1 bg-white rounded-md border shadow-lg">
                        <div className="p-2">
                          <Input 
                            placeholder="Rechercher un plat..." 
                            className="mb-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="max-h-60 overflow-auto p-1">
                          {filteredPlats.length === 0 ? (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              Aucun plat trouvé.
                            </div>
                          ) : (
                            filteredPlats.map((plat) => (
                              <div
                                key={plat._id}
                                className={cn(
                                  "flex items-center px-2 py-2 cursor-pointer rounded-sm",
                                  field.value.includes(plat._id) 
                                    ? "bg-primary/10" 
                                    : "hover:bg-muted"
                                )}
                                onClick={() => {
                                  const currentValues = [...field.value];
                                  const index = currentValues.indexOf(plat._id);
                                  if (index === -1) {
                                    currentValues.push(plat._id);
                                  } else {
                                    currentValues.splice(index, 1);
                                  }
                                  field.onChange(currentValues);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value.includes(plat._id)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <span>{plat.nom} - {plat.prix.toFixed(2)} DT</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <FormDescription>
                    Sélectionnez un ou plusieurs plats pour appliquer la même promotion
                  </FormDescription>
                  <FormMessage />
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
                    Création...
                  </>
                ) : (
                  "Créer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}