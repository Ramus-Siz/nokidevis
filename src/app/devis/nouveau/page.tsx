'use client'

import { useState, useEffect } from "react" // Ajoutez useEffect
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ComboboxClient } from "@/components/ComboboxClient"
import { ComboboxMateriau } from "@/components/ComboboxMateriau"

// Importez vos stores Zustand
import { useQuotationStore, useClientStore, useMaterialStore } from "@/stores"
// Importez vos types
import type { QuotationItem } from "@/types"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { format } from "date-fns"
import { toast } from "sonner"

// Supprimez les données statiques (elles viendront des stores)
// const clients = [...]
// const materiaux = [...]

// Schéma de validation Zod mis à jour pour correspondre à QuotationItem
const devisSchema = z.object({
  clientId: z.string().min(1, "Client requis"),
  lignesElements: z.array(
    z.object({
      materiauId: z.string().min(1, "Matériau requis"),
      quantite: z.coerce.number().min(1, "Quantité doit être au moins 1"),
      // Ajout de price_per_unit au schéma car il fait partie de QuotationItem
      price_per_unit: z.coerce.number().min(0, "Le prix unitaire doit être positif"),
    })
  ).min(1, "Au moins une ligne de matériau est requise"),
})

type DevisFormValues = z.infer<typeof devisSchema>

export default function NouveauDevisPage() {
  const router = useRouter()

  // --- INTÉGRATION ZUSTAND ---
  const addQuotation = useQuotationStore((state) => state.addQuotation)
  const allClients = useClientStore((state) => state.clients)
  const allMaterials = useMaterialStore((state) => state.materials)
  const getMaterialById = useMaterialStore((state) => state.getMaterialById)
  // --- FIN INTÉGRATION ZUSTAND ---

  const form = useForm<DevisFormValues>({
    resolver: zodResolver(devisSchema),
    defaultValues: {
      clientId: "",
      lignesElements: [{ materiauId: "", quantite: 1, price_per_unit: 0 }], // Incluez price_per_unit
    },
  })

  const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form
  const { fields, append, remove } = useFieldArray({ control, name: "lignesElements" })

  const lignesElements = watch("lignesElements")

  // Met à jour le prix unitaire quand le matériau est sélectionné
  useEffect(() => {
    lignesElements.forEach((ligne, index) => {
      if (ligne.materiauId) {
        const material = getMaterialById(ligne.materiauId);
        // Mettre à jour price_per_unit seulement si le matériau est trouvé et que le prix n'est pas déjà correct
        if (material && material.price_per_unit !== ligne.price_per_unit) {
          setValue(`lignesElements.${index}.price_per_unit`, material.price_per_unit, { shouldValidate: true });
        }
      }
    });
  }, [lignesElements, getMaterialById, setValue]);


  // Utilise les matériaux du store pour obtenir le prix
  const getPrixMateriau = (id: string) => {
    return getMaterialById(id)?.price_per_unit ?? 0;
  }

  // Le calcul du total utilise désormais les prix des lignes d'éléments
  const total = lignesElements.reduce((acc, l) => {
    // Utilisez le price_per_unit stocké dans la ligne, ou le prix du matériau si non défini
    const price = l.price_per_unit > 0 ? l.price_per_unit : getPrixMateriau(l.materiauId);
    return acc + price * l.quantite
  }, 0)

  const onSubmit = async (data: DevisFormValues) => {
    console.log("Données du formulaire soumises :", data)

    // Préparer les items pour le store (QuotationItem[])
    const items: QuotationItem[] = data.lignesElements.map(item => ({
      material_id: item.materiauId,
      quantity: item.quantite,
      price_per_unit: item.price_per_unit, // Utilisez le prix unitaire qui a été défini
    }));

    const newQuotationData = {
      client_id: data.clientId,
      date: format(new Date(), "yyyy-MM-dd"), // Format de date YYYY-MM-DD
      items: items,
      // Le total et le statut ('brouillon') seront calculés/définis par addQuotation dans le store
    };

    try {
      addQuotation(newQuotationData); // Ajoutez le devis via le store
      toast.success("Devis créé avec succès !");
      router.push("/devis"); // Redirige vers la liste des devis
    } catch (error) {
      console.error("Erreur lors de la création du devis:", error);
      toast.error("Erreur lors de la création du devis.");
    }
  }

  return (
    <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min p-8">
      <h1 className="text-2xl font-bold pb-8">Créer un nouveau devis</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Sélection du client */}
        <div>
          <Label htmlFor="clientId" className="mb-2">Client</Label>
          <ComboboxClient
            clients={allClients.map(c => ({ id: c.id, name: c.name }))} // Adaptez si ComboboxClient attend un format spécifique
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
                    // Mettre à jour le prix unitaire quand le matériau change dans la ligne
                    const selectedMaterial = getMaterialById(val);
                    setValue(`lignesElements.${index}.price_per_unit`, selectedMaterial?.price_per_unit ?? 0, { shouldValidate: true });
                  }}
                  materiaux={allMaterials.map(m => ({ id: m.id, name: m.name, prix: m.price_per_unit }))} // Adaptez si ComboboxMateriau attend un format spécifique
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
                  type="number" // Permet d'éditer manuellement si nécessaire, mais est mis à jour automatiquement
                  value={watch(`lignesElements.${index}.price_per_unit`)}
                  {...register(`lignesElements.${index}.price_per_unit`, { valueAsNumber: true })} // Enregistre comme nombre
                  // readOnly // Vous pouvez le laisser en lecture seule si vous ne voulez pas de modification manuelle
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
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  )
}