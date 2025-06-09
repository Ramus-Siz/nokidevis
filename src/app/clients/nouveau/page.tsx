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
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  adresse: z.string().optional(),
})

type ClientFormValues = z.infer<typeof clientSchema>

export default function NouveauClientPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      adresse: "",
    },
  })

  const onSubmit = async (data: ClientFormValues) => {
    console.log("Nouveau client :", data)

    // Simulation d'enregistrement
    await new Promise((r) => setTimeout(r, 1000))

    router.push("/clients")
  }

  return (
    <div className="bg-muted/40 min-h-[100vh] p-8 rounded-xl md:min-h-min">
    <div className="flex justify-between ">
      <h1 className="text-2xl font-bold pb-8">Créer un nouveau client</h1>
      <Link href="/clients">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Tous les clients
          </Button>
        </Link>

    </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
        <div>
          <Label htmlFor="name" className="mb-2">Nom du client</Label>
          <Input id="name" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="mb-2">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone" className="mb-2">Téléphone</Label>
          <Input id="phone" {...register("phone")} />
        </div>

        <div>
          <Label htmlFor="adresse" className="mb-2">Adresse</Label>
          <Input id="adresse" {...register("adresse")} />
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
