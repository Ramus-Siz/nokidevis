// src/components/DevisTable.tsx
"use client";

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
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import QuotationEditForm from "@/components/devis/forms/editForm";
import InvoiceGenerationDialog from "@/components/devis/InvoiceGenerationDialog"; // Importez le nouveau composant

import { useQuotationStore, useClientStore, useInvoiceStore } from "@/stores"; // Importez useInvoiceStore
import type { Quotation, QuotationStatus } from "@/types";

const ITEMS_PER_PAGE = 7;

type DevisTableProps = {
  onlyValidated?: boolean;
};

export default function DevisTable({ onlyValidated = false }: DevisTableProps) {
  const [page, setPage] = useState(1);
  const [filterTerm, setFilterTerm] = useState("");
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedDevisId, setSelectedDevisId] = useState<string | null>(null);
  const router = useRouter();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);

  // --- États pour le modal de génération de facture ---
  const [isInvoiceGenerationDialogOpen, setIsInvoiceGenerationDialogOpen] = useState(false);
  const [quotationToInvoice, setQuotationToInvoice] = useState<Quotation | null>(null);
  // --- FIN États pour le modal de génération de facture ---

  const quotations = useQuotationStore((state) => state.quotations);
  const deleteQuotation = useQuotationStore((state) => state.deleteQuotation);
  const updateQuotationStatus = useQuotationStore((state) => state.updateQuotationStatus);
  const getClientById = useClientStore((state) => state.getClientById);
  const getQuotationById = useQuotationStore((state) => state.getQuotationById);

  const filteredDevis = useMemo(() => {
    return quotations
      .filter((devis) => {
        const client = getClientById(devis.client_id);
        const clientName = client ? client.name.toLowerCase() : "";

        return (
          clientName.includes(filterTerm.toLowerCase()) ||
          devis.id.toLowerCase().includes(filterTerm.toLowerCase())
        );
      })
      // Ne pas filtrer les devis "facturés" si 'onlyValidated' est vrai pour l'affichage dans la table
      // Ou ajustez la logique si "validé" et "facturé" doivent être considérés comme validés
      .filter((devis) => {
        if (onlyValidated) {
          // Si on veut seulement les validés, on inclut 'validé' et 'facturé'
          return devis.status === "validé" || devis.status === "facturé";
        }
        return true;
      });
  }, [quotations, filterTerm, onlyValidated, getClientById]);


  const totalPages = Math.ceil(filteredDevis.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    return filteredDevis.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    );
  }, [filteredDevis, page]);

  const onModifier = (id: string) => {
    const devisToEdit = getQuotationById(id);
    if (devisToEdit) {
      setEditingQuotation(devisToEdit);
      setIsEditDialogOpen(true);
    } else {
      toast.error("Devis non trouvé pour modification.");
    }
  };

  const handleEditFormSave = () => {
    setIsEditDialogOpen(false);
    setEditingQuotation(null);
  };

  const handleEditFormCancel = () => {
    setIsEditDialogOpen(false);
    setEditingQuotation(null);
  };

  const onSupprimer = async (id: string) => {
    deleteQuotation(id);
  };

  const handleDeleteConfirm = async () => {
    if (selectedDevisId) {
      await onSupprimer(selectedDevisId);
      toast.success("Devis supprimé avec succès !");
      setSelectedDevisId(null);
    }
    setOpenConfirmDialog(false);
  };

  // Modifiez cette fonction pour ouvrir le modal de génération de facture
  const onGenererFacture = (id: string) => {
    const devisToInvoice = getQuotationById(id);
    if (devisToInvoice) {
      setQuotationToInvoice(devisToInvoice);
      setIsInvoiceGenerationDialogOpen(true);
    } else {
      toast.error("Devis non trouvé pour générer la facture.");
    }
  };

  const handleChangeStatus = (id: string, newStatus: QuotationStatus) => {
    updateQuotationStatus(id, newStatus);
    toast.success(`Statut du devis ${id} mis à jour en "${newStatus}" !`);
  };

  const getBadgeVariant = (status: QuotationStatus) => {
    switch (status) {
      case "validé":
        return "default";
      case "en cours":
        return "warning";
      case "brouillon":
        return "secondary";
      case "facturé": // Ajoutez le nouveau statut "facturé"
        return "success"; // Vous pouvez définir un variant 'success' dans shadcn/ui
      default:
        return "destructive";
    }
  };

  // Mettez à jour les statuts disponibles si "facturé" peut être choisi manuellement
  const availableStatuses: QuotationStatus[] = ["brouillon", "en cours", "validé", "facturé"];

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
            <TableHead>Client</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.length > 0 ? (
            paginated.map((devis) => {
              const client = getClientById(devis.client_id);
              return (
                <TableRow key={devis.id}>
                  <TableCell>{devis.id}</TableCell>
                  <TableCell>{client ? client.name : 'Client inconnu'}</TableCell>
                  <TableCell>
                    {format(new Date(devis.date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(devis.status)}>
                      {devis.status}
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
                        <DropdownMenuItem onClick={() => onModifier(devis.id)}>
                          Modifier
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
                                onClick={() => handleChangeStatus(devis.id, statusOption)}
                                disabled={devis.status === statusOption}
                              >
                                {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        {/* Condition pour la génération de facture : seulement si devis est "validé" et pas déjà "facturé" */}
                        {devis.status === "validé" && (
                          <DropdownMenuItem
                            onClick={() => onGenererFacture(devis.id)}
                          >
                            Générer la facture
                          </DropdownMenuItem>
                        )}
                        {/* Option "Voir la facture" si le devis est "facturé" */}
                        {devis.status === "facturé" && (
                           <DropdownMenuItem
                            onClick={() => router.push(`/factures/${devis.id}`)} // Assurez-vous d'avoir cette route
                           >
                            Voir la facture
                           </DropdownMenuItem>
                        )}
                        {/* Disable générer la facture si c'est 'facturé' ou autre statut non 'validé' */}
                        {devis.status !== "validé" && devis.status !== "facturé" && (
                            <DropdownMenuItem disabled>
                                Générer la facture
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedDevisId(devis.id);
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
              <TableCell colSpan={5} className="h-24 text-center">
                Aucun devis trouvé.
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
        title="Supprimer le devis"
        description="Voulez-vous vraiment supprimer ce devis ? Cette action est irréversible."
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le devis</DialogTitle>
            <DialogDescription>
              Modifiez les détails de ce devis. Cliquez sur enregistrer lorsque vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          {editingQuotation && (
            <QuotationEditForm
              initialQuotation={editingQuotation}
              onSave={handleEditFormSave}
              onCancel={handleEditFormCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* --- Le Modal de génération de facture --- */}
      {quotationToInvoice && ( // Rendre le composant seulement si un devis est sélectionné
        <InvoiceGenerationDialog
          open={isInvoiceGenerationDialogOpen}
          onOpenChange={setIsInvoiceGenerationDialogOpen}
          quotation={quotationToInvoice}
        />
      )}
      {/* --- Fin du Modal de génération de facture --- */}
    </div>
  );
}