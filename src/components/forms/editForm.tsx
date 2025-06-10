'use client'

import React, { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ComboboxClient } from "@/components/ComboboxClient"
import { ComboboxMateriau } from "@/components/ComboboxMateriau"
import { toast } from "sonner"
import { useQuotationStore, useClientStore, useMaterialStore } from "@/stores"
import type { Quotation, QuotationItem } from "@/types"

// Schéma de validation Zod (identique à celui de la création)
const devisSchema = z.object({
  clientId: z.string().min(1, "Client requis"),
  lignesElements: z.array(
    z.object({
      materiauId: z.string().min(1, "Matériau requis"),
      quantite: z.coerce.number().min(1, "Quantité doit être au moins 1"),
      price_per_unit: z.coerce.number().min(0, "Le prix unitaire doit être positif"),
    })
  ).min(1, "Au moins une ligne de matériau est requise"),
});

type DevisFormValues = z.infer<typeof devisSchema>;

interface QuotationEditFormProps {
  initialQuotation: Quotation; // Le devis à éditer
  onSave: () => void; // Callback à appeler après l'enregistrement
  onCancel: () => void; // Callback à appeler si l'utilisateur annule
}

export default function QuotationEditForm({ initialQuotation, onSave, onCancel }: QuotationEditFormProps) {
  const updateQuotation = useQuotationStore((state) => state.updateQuotation);
  const allClients = useClientStore((state) => state.clients);
  const allMaterials = useMaterialStore((state) => state.materials);
  const getMaterialById = useMaterialStore((state) => state.getMaterialById);

  const form = useForm<DevisFormValues>({
    resolver: zodResolver(devisSchema),
    defaultValues: {
      clientId: initialQuotation.client_id,
      lignesElements: initialQuotation.items.map(item => ({
        materiauId: item.material_id,
        quantite: item.quantity,
        price_per_unit: item.price_per_unit,
      })),
    },
  });

  const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "lignesElements" });

  const lignesElements = watch("lignesElements");

  // Met à jour le prix unitaire quand le matériau est sélectionné ou initialisé
  useEffect(() => {
    lignesElements.forEach((ligne, index) => {
      if (ligne.materiauId) {
        const material = getMaterialById(ligne.materiauId);
        // Ne met à jour que si le prix est différent de celui du matériau
        if (material && material.price_per_unit !== ligne.price_per_unit) {
          setValue(`lignesElements.${index}.price_per_unit`, material.price_per_unit, { shouldValidate: true });
        }
      }
    });
  }, [lignesElements, getMaterialById, setValue]);

  const total = lignesElements.reduce((acc, l) => {
    const price = l.price_per_unit; // Utilise le prix unitaire déjà dans la ligne
    return acc + price * l.quantite;
  }, 0);

  const onSubmit = async (data: DevisFormValues) => {
    // Préparer les items pour le store (QuotationItem[])
    const updatedItems: QuotationItem[] = data.lignesElements.map(item => ({
      material_id: item.materiauId,
      quantity: item.quantite,
      price_per_unit: item.price_per_unit,
    }));

    const updatedQuotation = {
      ...initialQuotation, // Garde l'ID et les autres propriétés non modifiées par le formulaire
      client_id: data.clientId,
      items: updatedItems,
      // Le total sera recalculé par `updateQuotation` dans le store
    };

    try {
      updateQuotation(updatedQuotation); // Met à jour le devis via le store
      toast.success("Devis modifié avec succès !");
      onSave(); // Ferme le modal ou gère la suite
    } catch (error) {
      console.error("Erreur lors de la modification du devis:", error);
      toast.error("Erreur lors de la modification du devis.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sélection du client */}
      <div>
        <Label htmlFor="clientId" className="mb-2">Client</Label>
        <ComboboxClient
          clients={allClients.map(c => ({ id: c.id, name: c.name }))}
          value={watch("clientId")}
          onChange={(val) => setValue("clientId", val, { shouldValidate: true })}
          placeholder="Choisir un client"
        />
        {errors.clientId && (
          <p className="text-sm text-red-500 mt-1">{errors.clientId.message}</p>
        )}
      </div>

      {/* Lignes de matériaux */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg mb-4">Matériaux</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => append({ materiauId: "", quantite: 1, price_per_unit: 0 })}
          >
            <Plus className="w-4 h-4 mr-1" /> Ajouter une ligne
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label htmlFor={`lignesElements.${index}.materiauId`} className="mb-2">Matériau</Label>
              <ComboboxMateriau
                value={watch(`lignesElements.${index}.materiauId`)}
                onChange={(val) => {
                  setValue(`lignesElements.${index}.materiauId`, val, { shouldValidate: true });
                  const selectedMaterial = getMaterialById(val);
                  setValue(`lignesElements.${index}.price_per_unit`, selectedMaterial?.price_per_unit ?? 0, { shouldValidate: true });
                }}
                materiaux={allMaterials.map(m => ({ id: m.id, name: m.name, prix: m.price_per_unit }))}
              />
              {errors.lignesElements?.[index]?.materiauId && (
                <p className="text-sm text-red-500 mt-1">{errors.lignesElements[index]?.materiauId?.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor={`lignesElements.${index}.quantite`} className="mb-2">Quantité</Label>
              <Input
                type="number"
                {...register(`lignesElements.${index}.quantite`)}
              />
              {errors.lignesElements?.[index]?.quantite && (
                <p className="text-sm text-red-500 mt-1">{errors.lignesElements[index]?.quantite?.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor={`lignesElements.${index}.price_per_unit`} className="mb-2">Prix unitaire</Label>
              <Input
                type="number"
                value={watch(`lignesElements.${index}.price_per_unit`)}
                {...register(`lignesElements.${index}.price_per_unit`, { valueAsNumber: true })}
                readOnly // Généralement en lecture seule pour éviter les erreurs de saisie
              />
               {errors.lignesElements?.[index]?.price_per_unit && (
                <p className="text-sm text-red-500 mt-1">{errors.lignesElements[index]?.price_per_unit?.message}</p>
              )}
            </div>

            <div className="flex justify-start">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}

        {errors.lignesElements && typeof errors.lignesElements.message === 'string' && (
          <p className="text-sm text-red-500">{errors.lignesElements.message}</p>
        )}
      </div>

      {/* Total et validation */}
      <div className="flex justify-between items-center border-t pt-4">
        <span className="font-semibold text-lg">
          Total : {total.toFixed(2)} $
        </span>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </div>
    </form>
  )
}