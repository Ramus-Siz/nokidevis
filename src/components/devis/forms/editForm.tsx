// src/components/devis/forms/editForm.tsx
'use client'

import React, { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Trash2, Save, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ComboboxClient } from "@/components/ComboboxClient"
import { ComboboxMateriau } from "@/components/ComboboxMateriau"
import { toast } from "sonner"
import { useQuotationStore, useClientStore, useMaterialStore } from "@/stores"
import type { Quotation, QuotationItem } from "@/types"

// Schéma de validation Zod (identique)
const devisSchema = z.object({
  clientId: z.string().min(1, "Veuillez sélectionner un client."),
  lignesElements: z.array(
    z.object({
      materiauId: z.string().min(1, "Matériau est requis."),
      quantite: z.coerce.number().min(1, "La quantité doit être au moins 1."),
      price_per_unit: z.coerce.number().min(0, "Le prix unitaire doit être positif."),
    })
  ).min(1, "Veuillez ajouter au moins une ligne de matériau."),
});

type DevisFormValues = z.infer<typeof devisSchema>;

interface QuotationEditFormProps {
  initialQuotation: Quotation;
  onSave: () => void;
  onCancel: () => void;
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

  useEffect(() => {
    lignesElements.forEach((ligne, index) => {
      if (ligne.materiauId) {
        const material = getMaterialById(ligne.materiauId);
        if (material && material.price_per_unit !== ligne.price_per_unit) {
          setValue(`lignesElements.${index}.price_per_unit`, material.price_per_unit, { shouldValidate: true });
        }
      }
    });
  }, [lignesElements, getMaterialById, setValue]);

  const total = lignesElements.reduce((acc, l) => {
    const price = l.price_per_unit;
    return acc + price * l.quantite;
  }, 0);

  const onSubmit = async (data: DevisFormValues) => {
    const updatedItems: QuotationItem[] = data.lignesElements.map(item => ({
      material_id: item.materiauId,
      quantity: item.quantite,
      price_per_unit: item.price_per_unit,
    }));

    const updatedQuotation = {
      ...initialQuotation,
      client_id: data.clientId,
      items: updatedItems,
      // Le total n'est pas envoyé si votre backend le calcule, sinon incluez-le
      // total: total, // Décommentez si votre backend ne calcule PAS le total
    };

    try {
      // APPEL À L'API VIA L'ACTION DU STORE
      await updateQuotation(updatedQuotation); // L'action updateQuotation du store gère maintenant l'API et les toasts
      onSave(); // Ferme le modal ou gère la suite UNIQUEMENT après succès API
    } catch (error) {
      // L'erreur est déjà toastée par l'action du store, mais vous pouvez ajouter un log ici
      console.error("Erreur soumission formulaire de devis:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-4">
      {/* ... (le reste du design amélioré du formulaire reste le même) ... */}

      {/* Section Client */}
      <div className="space-y-4 p-6 border rounded-lg shadow-sm bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Informations du Client</h2>
        <div>
          <Label htmlFor="clientId" className="text-gray-700 mb-2">Client</Label>
          <ComboboxClient
            clients={allClients.map(c => ({ id: c.id, name: c.name }))}
            value={watch("clientId")}
            onChange={(val) => setValue("clientId", val, { shouldValidate: true })}
            placeholder="Sélectionner un client..."
          />
          {errors.clientId && (
            <p className="text-sm text-red-600 mt-2 flex items-center">
              <XCircle className="h-4 w-4 mr-1" /> {errors.clientId.message}
            </p>
          )}
        </div>
      </div>

      {/* Section Lignes de matériaux */}
      <div className="space-y-6 p-6 border rounded-lg shadow-sm bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">Détails des Matériaux</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ materiauId: "", quantite: 1, price_per_unit: 0 })}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4" /> Ajouter une ligne
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border p-4 rounded-md bg-white shadow-sm">
            <div className="md:col-span-2">
              <Label htmlFor={`lignesElements.${index}.materiauId`} className="text-gray-700 mb-2">Matériaux</Label>
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
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <XCircle className="h-2 w-2 mr-1" /> {errors.lignesElements[index]?.materiauId?.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor={`lignesElements.${index}.quantite`} className="text-gray-700 mb-2">Quantité</Label>
              <Input
                type="number"
                {...register(`lignesElements.${index}.quantite`)}
                className="w-full"
              />
              {errors.lignesElements?.[index]?.quantite && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <XCircle className="h-4 w-4 mr-1" /> {errors.lignesElements[index]?.quantite?.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor={`lignesElements.${index}.price_per_unit`} className="text-gray-700 mb-2">Prix unitaire (€)</Label>
              <Input
                type="number"
                value={watch(`lignesElements.${index}.price_per_unit`).toFixed(2)}
                {...register(`lignesElements.${index}.price_per_unit`, { valueAsNumber: true })}
                readOnly
                className="w-full bg-gray-100 cursor-not-allowed"
              />
                {errors.lignesElements?.[index]?.price_per_unit && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <XCircle className="h-4 w-4 mr-1" /> {errors.lignesElements[index]?.price_per_unit?.message}
                </p>
              )}
            </div>

            <div className="flex justify-center sm:justify-start items-center">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => remove(index)}
                className="h-9 w-9"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}

        {errors.lignesElements && typeof errors.lignesElements.message === 'string' && (
          <p className="text-sm text-red-600 mt-2 flex items-center">
            <XCircle className="h-4 w-4 mr-1" /> {errors.lignesElements.message}
          </p>
        )}
      </div>

      {/* Total et Boutons d'action */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-t pt-6 mt-8">
        <div className="font-bold text-2xl text-gray-900 mb-4 sm:mb-0">
          Total du devis : <span className="text-blue-700">{total.toFixed(2)} €</span>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel} className="px-6 py-3 text-gray-700 border-gray-300 hover:bg-gray-100">
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </div>
    </form>
  )
}