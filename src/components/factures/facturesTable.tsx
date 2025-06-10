// src/components/invoices/FactureTable.tsx
'use client';

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Importez le nouveau composant de prévisualisation
import InvoicePdfPreviewDialog from "./invoicePdfPreviewDialog";

// Importez vos stores Zustand et vos types
import { useInvoiceStore, useClientStore, useMaterialStore } from "@/stores";
import type { Invoice, InvoiceStatus } from "@/types";

const ITEMS_PER_PAGE = 7;

export default function FactureTable() {
  const [page, setPage] = useState(1);
  const [filterTerm, setFilterTerm] = useState("");
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const router = useRouter();

  // --- États pour le modal de prévisualisation PDF ---
  const [isPdfPreviewDialogOpen, setIsPdfPreviewDialogOpen] = useState(false);
  const [invoiceToPreview, setInvoiceToPreview] = useState<Invoice | null>(null);
  // --- FIN États pour le modal de prévisualisation PDF ---

  // --- INTÉGRATION ZUSTAND ---
  const invoices = useInvoiceStore((state) => state.invoices);
  const deleteInvoice = useInvoiceStore((state) => state.deleteInvoice);
  const updateInvoiceStatus = useInvoiceStore((state) => state.updateInvoiceStatus);
  const getClientById = useClientStore((state) => state.getClientById);
  const allMaterials = useMaterialStore((state) => state.materials); // Récupérez tous les matériaux
  const getInvoiceById = useInvoiceStore((state) => state.getInvoiceById); // Pour récupérer la facture par ID
  // --- FIN INTÉGRATION ZUSTAND ---

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((invoice) => {
        const client = getClientById(invoice.client_id);
        const clientName = client ? client.name.toLowerCase() : "";

        return (
          clientName.includes(filterTerm.toLowerCase()) ||
          invoice.id.toLowerCase().includes(filterTerm.toLowerCase())
        );
      });
  }, [invoices, filterTerm, getClientById]);

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    return filteredInvoices.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    );
  }, [filteredInvoices, page]);

  const onVoirDetails = (id: string) => {
    router.push(`/factures/${id}`);
  };

  const onSupprimer = async (id: string) => {
    deleteInvoice(id);
  };

  const handleDeleteConfirm = async () => {
    if (selectedInvoiceId) {
      await onSupprimer(selectedInvoiceId);
      toast.success("Facture supprimée avec succès !");
      setSelectedInvoiceId(null);
    }
    setOpenConfirmDialog(false);
  };

  const handleChangeStatus = (id: string, newStatus: InvoiceStatus) => {
    updateInvoiceStatus(id, newStatus);
    toast.success(`Statut de la facture ${id} mis à jour en "${newStatus}" !`);
  };

  // Nouvelle fonction pour ouvrir le modal de prévisualisation PDF
  const onDownloadPdf = (id: string) => {
    const invoice = getInvoiceById(id);
    if (invoice) {
      setInvoiceToPreview(invoice);
      setIsPdfPreviewDialogOpen(true);
    } else {
      toast.error("Facture non trouvée pour la prévisualisation.");
    }
  };


  const getBadgeVariant = (status: InvoiceStatus) => {
    switch (status) {
      case "payée":
        return "default";
      case "émise":
        return "secondary";
      case "partiellement payée":
        return "warning";
      case "en retard":
        return "destructive";
      case "annulée":
        return "outline";
      default:
        return "secondary";
    }
  };

  const availableStatuses: InvoiceStatus[] = ["émise", "payée", "partiellement payée", "annulée", "en retard"];

  return (
    <div className="space-y-4">
      <div className="flex justify-start">
        <Input
          placeholder="Filtrer par client ou ID..."
          value={filterTerm}
          onChange={(e) => {
            setFilterTerm(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Devis ID</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.length > 0 ? (
            paginated.map((invoice) => {
              const client = getClientById(invoice.client_id);
              return (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.id}</TableCell>
                  <TableCell>{invoice.quotation_id}</TableCell>
                  <TableCell>{client ? client.name : 'Client inconnu'}</TableCell>
                  <TableCell>
                    {format(new Date(invoice.date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{invoice.total.toFixed(2)} $</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <span className="text-xl cursor-pointer">...</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onVoirDetails(invoice.id)}>
                          Voir les détails
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            Changer le statut
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuLabel>Statuts</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {availableStatuses.map((statusOption) => (
                              <DropdownMenuItem
                                key={statusOption}
                                onClick={() => handleChangeStatus(invoice.id, statusOption)}
                                disabled={invoice.status === statusOption}
                              >
                                {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        {/* Action pour la prévisualisation PDF */}
                        <DropdownMenuItem onClick={() => onDownloadPdf(invoice.id)}>
                            Télécharger PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedInvoiceId(invoice.id);
                            setOpenConfirmDialog(true);
                          }}
                        >
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Aucune facture trouvée.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-end gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="text-sm px-3 py-1 border rounded disabled:opacity-50"
        >
          Précédent
        </button>
        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage((p) => p + 1)}
          className="text-sm px-3 py-1 border rounded disabled:opacity-50"
        >
          Suivant
        </button>
      </div>

      <ConfirmDeleteDialog
        open={openConfirmDialog}
        onOpenChange={setOpenConfirmDialog}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la facture"
        description="Voulez-vous vraiment supprimer cette facture ? Cette action est irréversible."
      />

      {/* --- Le Modal de prévisualisation PDF --- */}
      {invoiceToPreview && ( // Rendre le composant seulement si une facture est sélectionnée
        <InvoicePdfPreviewDialog
          open={isPdfPreviewDialogOpen}
          onOpenChange={setIsPdfPreviewDialogOpen}
          invoice={invoiceToPreview}
          client={getClientById(invoiceToPreview.client_id)} // Passe le client
          materials={allMaterials} // Passe tous les matériaux pour la résolution des noms
        />
      )}
      {/* --- Fin du Modal de prévisualisation PDF --- */}
    </div>
  );
}