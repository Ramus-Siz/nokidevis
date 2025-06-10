// src/components/invoices/InvoicePdfPreviewDialog.tsx
'use client'

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'; // Importez PDFDownloadLink
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';

import { InvoicePdfDocument } from './InvoicePdfDocument'; // Votre composant PDF
import type { Invoice, Client, Material } from '@/types';

interface InvoicePdfPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  client: Client | undefined;
  materials: Material[];
}

export default function InvoicePdfPreviewDialog({
  open,
  onOpenChange,
  invoice,
  client,
  materials,
}: InvoicePdfPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col"> {/* Ajustez la taille */}
        <DialogHeader>
          <DialogTitle>Prévisualisation de la Facture #{invoice.id}</DialogTitle>
          <DialogDescription>
            Vérifiez l'aperçu de la facture avant de la télécharger.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow my-4 border rounded overflow-hidden">
          {/* Le PDFViewer est essentiel pour la prévisualisation */}
          <PDFViewer width="100%" height="100%">
            <InvoicePdfDocument invoice={invoice} client={client} materials={materials} />
          </PDFViewer>
        </div>

        <div className="flex justify-end gap-2 p-2">
          {/* Bouton de téléchargement du PDF */}
          <PDFDownloadLink
            document={<InvoicePdfDocument invoice={invoice} client={client} materials={materials} />}
            fileName={`facture-${invoice.id}.pdf`}
          >
            {({ blob, url, loading, error }) => (
              <Button disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                {loading ? 'Préparation...' : 'Télécharger PDF'}
              </Button>
            )}
          </PDFDownloadLink>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}