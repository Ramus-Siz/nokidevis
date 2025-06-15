// src/components/clients/EditClientDialog.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, User, Mail, Phone, MapPin, Save, XCircle } from "lucide-react";
import { useClientStore } from "@/stores";
import type { Client } from "@/types";

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null;
}

export const EditClientDialog: React.FC<EditClientDialogProps> = ({
  open,
  onOpenChange,
  clientId,
}) => {
  const updateClientInStore = useClientStore((state) => state.updateClient);

  const [currentClientData, setCurrentClientData] = useState<Client | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contact, setContact] = useState("");
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [savingChanges, setSavingChanges] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setCurrentClientData(null);
    setName("");
    setEmail("");
    setPhone("");
    setContact("");
    setLoadingInitialData(true);
    setSavingChanges(false);
    setFetchError(null);
  }, []);

  useEffect(() => {
    if (open && clientId) {
      setLoadingInitialData(true);
      setFetchError(null);
      setCurrentClientData(null);

      const fetchClient = async () => {
        try {
          const res = await fetch(`/api/clients/${clientId}`);
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || `Erreur lors du chargement: ${res.statusText}`);
          }
          const client: Client = await res.json();
          setCurrentClientData(client);
          setName(client.name);
          setEmail(client.email || "");
          setPhone(client.phone || "");
          setContact(client.contact || "");
        } catch (err: any) {
          console.error("Échec du chargement du client:", err);
          setFetchError(`Impossible de charger les données du client: ${err.message || 'Erreur inconnue'}`);
          toast.error(`Erreur de chargement: ${err.message || 'Vérifiez la console.'}`);
        } finally {
          setLoadingInitialData(false);
        }
      };
      fetchClient();
    } else if (!open) {
      resetForm();
    }
  }, [open, clientId, onOpenChange, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClientData) return;

    setSavingChanges(true);
    setFetchError(null);

    const updatedClientPayload = {
      name,
      email,
      phone,
      contact,
    };

    try {
      const res = await fetch(`/api/clients/${currentClientData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedClientPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Erreur HTTP: ${res.statusText}`);
      }

      const clientResponse: Client = await res.json();
      updateClientInStore(currentClientData.id, clientResponse);
      toast.success("Client mis à jour avec succès !");
      onOpenChange(false);
    } catch (err: any) {
      console.error("Échec de la mise à jour du client:", err);
      toast.error(`Échec de la mise à jour: ${err.message || 'Erreur inconnue.'}`);
    } finally {
      setSavingChanges(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold text-gray-800">Modifier le client</DialogTitle>
          <DialogDescription className="text-gray-600">
            Apportez les modifications au client ici. Cliquez sur **Enregistrer**
            quand vous avez terminé.
          </DialogDescription>
        </DialogHeader>

        {loadingInitialData ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-lg text-gray-700 font-medium">Chargement des données du client...</p>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-10 text-red-700 bg-red-50 border border-red-300 rounded-lg shadow-sm space-y-3">
            <XCircle className="h-10 w-10 text-red-600" />
            <p className="font-semibold text-lg">Erreur de chargement !</p>
            <p className="text-sm text-center px-4">{fetchError}</p>
            <Button onClick={() => onOpenChange(false)} className="mt-4" variant="outline">
              Fermer
            </Button>
          </div>
        ) : !currentClientData ? (
          <div className="py-10 text-center text-red-500">
            <XCircle className="h-10 w-10 mx-auto mb-3 text-red-500" />
            <p className="text-lg font-medium">Erreur : Client introuvable.</p>
            <p className="text-sm text-gray-600">Veuillez réessayer ou contacter le support.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-6 py-4">
            {/* Nom du client */}
            <div className="grid grid-cols-4 items-center gap-4"> {/* items-center pour l'alignement vertical */}
              <Label htmlFor="name" className="text-right text-gray-700 font-medium flex items-center justify-end">
                <User className="h-4 w-4 mr-2 text-gray-500" /> {/* Taille 4 */}
                Nom
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                required
                placeholder="Nom du client"
              />
            </div>
            {/* Email */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right text-gray-700 font-medium flex items-center justify-end">
                <Mail className="h-4 w-4 mr-2 text-gray-500" /> {/* Taille 4 */}
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                placeholder="client@exemple.com"
              />
            </div>
            {/* Téléphone */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right text-gray-700 font-medium flex items-center justify-end">
                <Phone className="h-4 w-4 mr-2 text-gray-500" /> {/* Taille 4 */}
                Téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                placeholder="+33 1 23 45 67 89"
              />
            </div>
            {/* Adresse / Contact */}
            <div className="grid grid-cols-4 items-start gap-4"> {/* Garder 'items-start' pour l'alignement du textarea */}
              <Label htmlFor="contact" className="text-right text-gray-700 font-medium flex items-center justify-end pt-2"> {/* 'pt-2' pour aligner l'icône et le texte avec le début du textarea */}
                <MapPin className="h-4 w-4 mr-2 text-gray-500" /> {/* Taille 4 */}
                Adresse / Contact
              </Label>
              <Textarea
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="col-span-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 min-h-[80px]"
                placeholder="Adresse complète du client ou notes de contact..."
              />
            </div>

            <DialogFooter className="pt-6">
              <Button type="submit" disabled={savingChanges} className="w-full sm:w-auto px-6 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 flex items-center justify-center">
                {savingChanges ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};