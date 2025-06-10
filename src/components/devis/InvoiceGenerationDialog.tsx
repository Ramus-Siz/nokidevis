// src/components/quotations/InvoiceGenerationDialog.tsx
'use client'

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuotationStore, useClientStore, useInvoiceStore } from "@/stores";
import { format } from "date-fns";
// Importez InvoiceStatus explicitement si ce n'est pas déjà fait via types
import type { Quotation, InvoiceItem, InvoiceStatus } from "@/types";

interface InvoiceGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: Quotation;
}

export default function InvoiceGenerationDialog({ open, onOpenChange, quotation }: InvoiceGenerationDialogProps) {
  const generateInvoice = useInvoiceStore((state) => state.addInvoice);
  const updateQuotationStatus = useQuotationStore((state) => state.updateQuotationStatus);
  const getClientById = useClientStore((state) => state.getClientById);

  const client = getClientById(quotation.client_id);

  const handleGenerate = () => {
    const invoiceItems: InvoiceItem[] = quotation.items.map(item => ({
      material_id: item.material_id,
      quantity: item.quantity,
      price_per_unit: item.price_per_unit,
      total_price: item.quantity * item.price_per_unit,
    }));

    const newInvoiceData = {
      quotation_id: quotation.id,
      client_id: quotation.client_id,
      date: format(new Date(), "yyyy-MM-dd"),
      items: invoiceItems,
      total: quotation.total,
      // SOLUTION: Typez explicitement le statut comme InvoiceStatus
      status: 'émise' as InvoiceStatus, // <-- CHANGEMENT ICI
    };

    try {
      generateInvoice(newInvoiceData);
      updateQuotationStatus(quotation.id, 'facturé');
      toast.success(`Facture pour le devis ${quotation.id} générée et enregistrée !`);
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la génération de la facture :", error);
      toast.error("Erreur lors de la génération de la facture.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Générer la facture du devis #{quotation.id}</DialogTitle>
          <DialogDescription>
            Confirmez la génération de la facture pour ce devis. Le statut du devis passera à "facturé".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-2"><strong>Client:</strong> {client ? client.name : 'Client inconnu'}</p>
          <p className="mb-2"><strong>Date du devis:</strong> {format(new Date(quotation.date), "dd/MM/yyyy")}</p>
          <p className="text-lg font-semibold">Total du devis: {quotation.total.toFixed(2)} $</p>
          <p className="text-sm text-muted-foreground mt-4">
            Assurez-vous que toutes les informations du devis sont correctes avant de générer la facture.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleGenerate}>Confirmer et Générer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}