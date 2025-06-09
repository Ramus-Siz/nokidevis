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

const clientSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  prix: z.string().min(1, "Prix requis"),
  boutique: z.string().min(1, "La boutique est requise"),
})

type ClientFormValues = z.infer<typeof clientSchema>

export default function NouveauMateriauxPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      prix: "",
      boutique: "",
    },
  })

  const onSubmit = async (data: ClientFormValues) => {
    console.log("Nouveau materiaux :", data)

    // Simulation d'enregistrement
    await new Promise((r) => setTimeout(r, 1000))

    router.push("/materiaux/nouveau")
  }

  return (
    <div className="bg-muted/40 min-h-[100vh] p-8 rounded-xl md:min-h-min">
    <div className="flex justify-between ">
      <h1 className="text-2xl font-bold pb-8">Créer un nouveau Materiaux</h1>
      <Link href="/materiaux">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Tous les Materiaux
          </Button>
        </Link>

    </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
        <div>
          <Label htmlFor="name" className="mb-2">Nom du Materiaux</Label>
          <Input id="name" placeholder="Ex: Ciment"{...register("name")} />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
            <Label htmlFor="prix" className="mb-2">Prix en $</Label>
            <Input
            {...register("prix")}/>
             {errors.prix && (
            <p className="text-sm text-red-500 mt-1">{errors.prix.message}</p>
          )}

        </div>
        <div>
          <Label htmlFor="boutique" className="mb-2">Boutique</Label>
          <Input id="boutique"  placeholder="Ex: bokasa numero 3, maison HDK"{...register("boutique")} />
          {errors.boutique && (
            <p className="text-sm text-red-500 mt-1">{errors.boutique.message}</p>
          )}
          
        </div>

        <div className="pt-4  flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  )
}
