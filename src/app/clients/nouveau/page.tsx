// src/app/clients/new/page.tsx
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

import { useClientStore } from "@/stores";
import type { Client } from "@/types";
import { generateUniqueId } from "@/utils/idGenerator"; // <-- Importe votre fonction de génération d'ID

const clientSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  contact: z.string().optional().or(z.literal("")),
})

type ClientFormValues = z.infer<typeof clientSchema>

export default function NouveauClientPage() {
  const router = useRouter()
  const addClient = useClientStore((state) => state.addClient);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      contact: "",
    },
  })

  const onSubmit = async (data: ClientFormValues) => {
    // Générer un ID unique pour le nouveau client en utilisant votre fonction
    const newClientId = generateUniqueId('cli-'); // <-- Utilise generateUniqueId avec un préfixe 'cli-'

    const newClient: Client = {
      id: newClientId,
      name: data.name,
      email: data.email || "",
      phone: data.phone || "",
      contact: data.contact || "", // Assurez-vous que le nom de la propriété correspond à votre type Client (address vs adresse)
    };

    console.log("Client à ajouter :", newClient);

    addClient(newClient);

    toast.success("Client ajouté avec succès !");

    reset();

    await new Promise((r) => setTimeout(r, 1000));
    router.push("/clients");
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
          <Label htmlFor="adresse" className="mb-2">Contact</Label>
          <Input id="adresse" {...register("contact")} />
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  )
}