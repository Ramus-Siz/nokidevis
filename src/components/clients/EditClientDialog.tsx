// src/components/clients/EditClientDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea"; // Pour l'adresse
import { toast } from "sonner";
import { useClientStore } from "@/stores";
import type { Client } from "@/types";

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null; // L'ID du client à éditer, null si aucun
}

export const EditClientDialog: React.FC<EditClientDialogProps> = ({
  open,
  onOpenChange,
  clientId,
}) => {
  const getClientById = useClientStore((state) => state.getClientById);
  const updateClient = useClientStore((state) => state.updateClient);

  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);

  // Charger les données du client quand le modal s'ouvre ou que l'ID change
  useEffect(() => {
    if (open && clientId) {
      setLoading(true);
      const clientToEdit = getClientById(clientId);
      if (clientToEdit) {
        setCurrentClient(clientToEdit);
        setName(clientToEdit.name);
        setEmail(clientToEdit.email || "");
        setPhone(clientToEdit.phone || "");
        setContact(clientToEdit.contact || "");
      } else {
        toast.error("Client non trouvé pour l'édition.");
        onOpenChange(false); // Fermer le modal si le client n'est pas trouvé
      }
      setLoading(false);
    } else {
      // Réinitialiser les champs quand le modal se ferme
      setName("");
      setEmail("");
      setPhone("");
      setContact("");
      setCurrentClient(null);
    }
  }, [open, clientId, getClientById, onOpenChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient) return;

    setLoading(true);

    const updatedClient: Client = {
      ...currentClient,
      name,
      email,
      phone,
      contact,
    };

    updateClient(updatedClient);
    toast.success("Client mis à jour avec succès !");
    setLoading(false);
    onOpenChange(false); // Fermer le modal après succès
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le client</DialogTitle>
          <DialogDescription>
            Apportez les modifications au client ici. Cliquez sur enregistrer
            quand vous avez terminé.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center">Chargement des données du client...</div>
        ) : !currentClient ? (
          <div className="py-8 text-center text-red-500">Erreur : Client introuvable.</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Adresse
              </Label>
              <Textarea
                id="address"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button type="submit">Enregistrer les modifications</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};