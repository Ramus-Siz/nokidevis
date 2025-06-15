// src/app/clients/new/page.tsx
'use client'

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, ArrowLeft, Loader2, User, Mail, Phone, MapPin, PersonStanding } from "lucide-react" // Ajout de nouvelles icônes
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea" // Import de Textarea

import { useClientStore } from "@/stores"; // Pour synchroniser l'état local après l'API
import type { Client } from "@/types";

// IMPORTANT : Le backend génère l'ID, pas besoin de generateUniqueId ici

// Schéma de validation Zod mis à jour pour inclure 'address' et affiner 'contact'
const clientSchema = z.object({
  name: z.string().min(1, "Le nom du client est requis."),
  email: z.string().email("Adresse email invalide.").or(z.literal("")).optional(), // Permet chaîne vide ou absent
  phone: z.string().min(8, "Le numéro de téléphone doit contenir au moins 8 caractères.").or(z.literal("")).optional(), // Rendu optionnel avec validation min
  contact: z.string().optional().or(z.literal("")), // Pour la personne contact ou notes
  address: z.string().min(5, "L'adresse est requise et doit contenir au moins 5 caractères."), // Champ d'adresse requis
})

type ClientFormValues = z.infer<typeof clientSchema>

export default function NouveauClientPage() {
  const router = useRouter()
  // Utilisez l'action 'addClient' du store pour mettre à jour l'état local APRES la réussite de l'API
  const addClientToStore = useClientStore((state) => state.addClient);

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
      address: "", // Valeur par défaut pour le nouveau champ 'address'
    },
  })

  const onSubmit = async (data: ClientFormValues) => {
    // L'ID sera généré par le backend, nous n'avons pas besoin de generateUniqueId ici.
    // Le backend recevra les données et retournera le client complet avec son ID.

    const newClientPayload = {
      name: data.name,
      email: data.email || "", // Envoyer chaîne vide si non fourni pour correspondre au type string
      phone: data.phone || "",
      contact: data.contact || "",
      address: data.address, // Utilise le nouveau champ 'address'
    };

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClientPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Afficher les erreurs spécifiques de validation Zod du backend
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((err: any) => {
            toast.error(`Validation: ${err.path[0]}`, { description: err.message });
          });
        } else {
          throw new Error(errorData.message || `Erreur HTTP: ${res.statusText}`);
        }
      }

      const createdClient: Client = await res.json();
      addClientToStore(createdClient); // Met à jour le store Zustand avec le client créé par l'API

      toast.success("Client ajouté avec succès !");

      reset(); // Réinitialise le formulaire après succès

      // Attendre un peu avant la redirection pour laisser le toast s'afficher
      await new Promise((r) => setTimeout(r, 1000));
      router.push("/clients"); // Redirige vers la liste des clients
    } catch (err: any) {
      console.error("Échec de l'ajout du client:", err);
      toast.error("Échec de l'ajout du client", {
        description: err.message || 'Vérifiez la console pour plus de détails.',
      });
    }
  }

  return (
    <div className="bg-muted/40 min-h-[100vh] p-8 rounded-xl md:min-h-min">
      <div className="flex justify-between items-center pb-8"> {/* Ajustement padding-bottom */}
        <h1 className="text-3xl font-extrabold text-gray-800">Créer un nouveau client</h1>
        <Link href="/clients">
          <Button variant="outline" size="sm" className="flex items-center gap-2 px-4 py-2 border-gray-300 hover:bg-gray-100 transition-colors duration-200 text-gray-700 font-semibold rounded-md">
            <ArrowLeft className="w-4 h-4" />
            Tous les clients
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl bg-white p-6 rounded-lg shadow-md border border-gray-200"> {/* Encadré avec ombre */}
        {/* Nom du client */}
        <div>
          <Label htmlFor="name" className="mb-2 text-gray-700 font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            Nom du client
          </Label>
          <Input id="name" {...register("name")} placeholder="Nom complet de l'entreprise ou personne" className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200" />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="mb-2 text-gray-700 font-medium flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            Email
          </Label>
          <Input id="email" type="email" {...register("email")} placeholder="client@exemple.com" className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200" />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Téléphone */}
        <div>
          <Label htmlFor="phone" className="mb-2 text-gray-700 font-medium flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            Téléphone
          </Label>
          <Input id="phone" type="tel" {...register("phone")} placeholder="+243 81 234 5678" className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200" />
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
          )}
        </div>
        
        {/* Personne Contact / Notes */}
        <div>
          <Label htmlFor="contact" className="mb-2 text-gray-700 font-medium flex items-center gap-2">
            <PersonStanding className="h-4 w-4 text-gray-500" />
            Personne Contact / Notes
          </Label>
          <Input id="contact" {...register("contact")} placeholder="Nom du contact ou notes importantes" className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200" />
          {errors.contact && (
            <p className="text-sm text-red-600 mt-1">{errors.contact.message}</p>
          )}
        </div>

        {/* Adresse */}
        <div>
          <Label htmlFor="address" className="mb-2 text-gray-700 font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            Adresse
          </Label>
          <Textarea id="address" {...register("address")} placeholder="Adresse complète du client (rue, numéro, ville, pays)" className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 min-h-[80px]" />
          {errors.address && (
            <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* Bouton de soumission */}
        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="px-6 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 flex items-center justify-center">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}