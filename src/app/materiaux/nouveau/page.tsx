// src/app/materiaux/nouveau/page.tsx
'use client'

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import useMaterialStore from '@/stores/materialStore'; // Importe votre store de matériaux
import { generateUniqueId } from '@/utils/idGenerator'; // Importe votre fonction de génération d'ID

// Schéma de validation Zod adapté à votre interface Material
const materialFormSchema = z.object({
  name: z.string().min(1, "Le nom du matériau est requis"),
  unit: z.string().min(1, "L'unité de mesure est requise (ex: sac, m³, L)"), 
  price_per_unit: z.coerce.number({
    invalid_type_error: "Le prix par unité doit être un nombre",
  }).positive("Le prix par unité doit être positif"),
});

type MaterialFormValues = z.infer<typeof materialFormSchema>;

export default function NouveauMateriauxPage() {
  const router = useRouter();
  // Récupère la fonction addMaterial de votre store
  const addMaterial = useMaterialStore((state) => state.addMaterial);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset, // Ajout de reset pour vider le formulaire après soumission
  } = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema), // Utilise le schéma adapté
    defaultValues: {
      name: "",
      unit: "", // Valeur par défaut pour l'unité
      price_per_unit: 0, // Valeur par défaut pour le prix par unité
    },
  });

  const onSubmit = async (data: MaterialFormValues) => {
    // Génère un ID unique pour le nouveau matériau
    const newMaterialId = generateUniqueId('mat-'); // Utilisez un préfixe pertinent

    const newMaterial = {
      id: newMaterialId,
      name: data.name,
      unit: data.unit, // 'boutique' devient 'unit'
      price_per_unit: data.price_per_unit, // 'prix' devient 'price_per_unit'
    };

    console.log("Nouveau matériau à ajouter :", newMaterial);

    // Ajoute le nouveau matériau au store
    addMaterial(newMaterial);

    // Message de succès corrigé
    toast.success("Matériau ajouté avec succès !"); 
    
    // Réinitialise le formulaire
    reset();

    await new Promise((r) => setTimeout(r, 1000));

    // Redirige vers la page de liste des matériaux
    router.push("/materiaux"); 
  };

  return (
    <div className="bg-muted/40 min-h-[100vh] p-8 rounded-xl md:min-h-min">
      <div className="flex justify-between ">
        <h1 className="text-2xl font-bold pb-8">Créer un nouveau Matériau</h1>
        <Link href="/materiaux">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Tous les Matériaux
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
        <div>
          <Label htmlFor="name" className="mb-2">Nom du Matériau</Label>
          <Input id="name" placeholder="Ex: Ciment" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="unit" className="mb-2">Unité de mesure</Label> {/* Label pour 'unit' */}
          <Input id="unit" placeholder="Ex: sac, m³, L" {...register("unit")} />
          {errors.unit && (
            <p className="text-sm text-red-500 mt-1">{errors.unit.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="price_per_unit" className="mb-2">Prix par Unité (en $)</Label> {/* Label pour 'price_per_unit' */}
          <Input
            type="number"
            step="0.01"
            {...register("price_per_unit")} // Correspond à 'price_per_unit'
          />
          {errors.price_per_unit && (
            <p className="text-sm text-red-500 mt-1">{errors.price_per_unit.message}</p>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}