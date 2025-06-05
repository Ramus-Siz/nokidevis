'use client'

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"


import { format } from "date-fns"

const clients = [
  { id: "1", name: "Entreprise Alpha" },
  { id: "2", name: "Client Bêta" },
]

const materiaux = [
  { id: "mat-001", name: "Ciment", prix: 25 },
  { id: "mat-002", name: "Sable", prix: 15 },
  { id: "mat-003", name: "Brique", prix: 0.5 },
]

const devisSchema = z.object({
  clientId: z.string().min(1, "Client requis"),
  lignes: z.array(
    z.object({
      materiauId: z.string().min(1),
      quantite: z.coerce.number().min(1),
    })
  ).min(1, "Au moins une ligne requise"),
})

type DevisFormValues = z.infer<typeof devisSchema>

export default function NouveauDevisPage() {
  const router = useRouter()
  const form = useForm<DevisFormValues>({
    resolver: zodResolver(devisSchema),
    defaultValues: {
      clientId: "",
      lignes: [{ materiauId: "", quantite: 1 }],
    },
  })

  const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form
  const { fields, append, remove } = useFieldArray({ control, name: "lignes" })

  const lignes = watch("lignes")

  const getPrixMateriau = (id: string) =>
    materiaux.find((m) => m.id === id)?.prix ?? 0

  const total = lignes.reduce((acc, l) => {
    const prix = getPrixMateriau(l.materiauId)
    return acc + prix * l.quantite
  }, 0)

  const onSubmit = async (data: DevisFormValues) => {
    console.log("Envoi du devis :", data)
    await new Promise((r) => setTimeout(r, 1000))
    router.push("/devis")
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Créer un nouveau devis</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Sélection du client */}
        <div>
          <Label className="mb-2">Client</Label>
          <Select onValueChange={(val) => setValue("clientId", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              onClick={() => append({ materiauId: "", quantite: 1 })}
            >
              <Plus className="w-4 h-4 mr-1" /> Ajouter une ligne
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label className="mb-2">Matériau</Label>
                <Select
                  onValueChange={(val) => setValue(`lignes.${index}.materiauId`, val)}
                  defaultValue={field.materiauId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {materiaux.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} - {m.prix} €
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2">Quantité</Label>
                <Input
                  type="number"
                  {...register(`lignes.${index}.quantite`)}
                />
              </div>

              <div>
                <Label className="mb-2">Prix unitaire</Label>
                <Input
                  value={getPrixMateriau(watch(`lignes.${index}.materiauId`))}
                  readOnly
                />
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

          {errors.lignes && (
            <p className="text-sm text-red-500">{errors.lignes.message}</p>
          )}
        </div>

        {/* Total et validation */}
        <div className="flex justify-between items-center border-t pt-4">
          <span className="font-semibold text-lg">
            Total : {total.toFixed(2)} €
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
