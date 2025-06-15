// src/components/QuotationTable.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Search, MoreVertical, Edit, Trash2, Send, FileText, CheckCircle2, XCircle, Clock, FileWarning, Loader2 } from "lucide-react"; // Ajout de nouvelles icônes
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import QuotationEditForm from "@/components/devis/forms/editForm";
import InvoiceGenerationDialog from "@/components/devis/InvoiceGenerationDialog";

import { useQuotationStore, useClientStore } from "@/stores";
// Mise à jour du type QuotationStatus
type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'invoiced';
import type { Quotation } from "@/types"; // Assurez-vous que le type Quotation utilise le nouveau QuotationStatus

const ITEMS_PER_PAGE = 7;

type QuotationTableProps = {
  onlyValidated?: boolean;
};

export default function QuotationTable({ onlyValidated = false }: QuotationTableProps) {
  const [page, setPage] = useState(1);
  const [filterTerm, setFilterTerm] = useState("");
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const router = useRouter();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);

  const [isInvoiceGenerationDialogOpen, setIsInvoiceGenerationDialogOpen] = useState(false);
  const [quotationToInvoice, setQuotationToInvoice] = useState<Quotation | null>(null);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const quotations = useQuotationStore((state) => state.quotations);
  const setQuotations = useQuotationStore((state) => state.setQuotations);
  const deleteQuotationFromStore = useQuotationStore((state) => state.deleteQuotation);
  const updateQuotationStatusInStore = useQuotationStore((state) => state.updateQuotationStatus);
  const getClientById = useClientStore((state: { getClientById: any; }) => state.getClientById);
  const getQuotationById = useQuotationStore((state) => state.getQuotationById);

  const fetchQuotations = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/quotations');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error loading quotations: ${res.statusText}`);
      }
      const fetchedQuotations: Quotation[] = await res.json();
      setQuotations(fetchedQuotations);
    } catch (err: any) {
      console.error("Failed to load quotations:", err);
      setFetchError(`Could not load quotations: ${err.message || 'Unknown error'}`);
      toast.error(`Loading error: ${err.message || 'Check console.'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const filteredQuotations = useMemo(() => {
    return quotations
      .filter((quotation) => {
        const client = getClientById(quotation.client_id);
        const clientName = client ? client.name.toLowerCase() : "";

        const matchesFilter = (
          clientName.includes(filterTerm.toLowerCase()) ||
          quotation.id.toLowerCase().includes(filterTerm.toLowerCase()) ||
          quotation.status.toLowerCase().includes(filterTerm.toLowerCase())
        );

        if (onlyValidated) {
          // Si onlyValidated est vrai, on inclut seulement 'accepted' et 'invoiced'
          return matchesFilter && (quotation.status === "accepted" || quotation.status === "invoiced");
        }
        return matchesFilter;
      });
  }, [quotations, filterTerm, onlyValidated, getClientById]);

  const totalPages = Math.ceil(filteredQuotations.length / ITEMS_PER_PAGE);
  const paginatedQuotations = useMemo(() => {
    return filteredQuotations.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    );
  }, [filteredQuotations, page]);

  const onModifier = (id: string) => {
    const quotationToEdit = getQuotationById(id);
    if (quotationToEdit) {
      setEditingQuotation(quotationToEdit);
      setIsEditDialogOpen(true);
    } else {
      toast.error("Quotation not found for editing.");
    }
  };

  const handleEditFormSave = async () => {
    setIsEditDialogOpen(false);
    setEditingQuotation(null);
    await fetchQuotations();
  };

  const handleEditFormCancel = () => {
    setIsEditDialogOpen(false);
    setEditingQuotation(null);
  };

  const onSupprimer = async (id: string) => {
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error during deletion: ${res.statusText}`);
      }

      deleteQuotationFromStore(id);
      toast.success("Quotation successfully deleted!");
    } catch (err: any) {
      console.error("Failed to delete quotation:", err);
      toast.error(`Deletion failed: ${err.message || 'Unknown error.'}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedQuotationId) {
      await onSupprimer(selectedQuotationId);
      setSelectedQuotationId(null);
    }
    setOpenConfirmDialog(false);
  };

  const onGenererFacture = (id: string) => {
    const quotationToInvoice = getQuotationById(id);
    if (quotationToInvoice) {
      setQuotationToInvoice(quotationToInvoice);
      setIsInvoiceGenerationDialogOpen(true);
    } else {
      toast.error("Quotation not found to generate invoice.");
    }
  };

  const handleChangeStatus = async (id: string, newStatus: QuotationStatus) => {
    try {
      const res = await fetch(`/api/quotations/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error updating status: ${res.statusText}`);
      }

      updateQuotationStatusInStore(id, newStatus);
      toast.success(`Quotation ${id} status updated to "${newStatus}"!`);
    } catch (err: any) {
      console.error("Failed to update quotation status:", err);
      toast.error(`Status update failed: ${err.message || 'Unknown error.'}`);
    }
  };

  // Mise à jour de la fonction getBadgeVariant
  const getBadgeVariant = (status: QuotationStatus) => {
    switch (status) {
      case "accepted":
        return "success"; // Vert pour accepté
      case "sent":
        return "default"; // Bleu clair ou standard pour envoyé
      case "draft":
        return "secondary"; // Gris pour brouillon
      case "invoiced":
        return "info"; // Un autre bleu pour facturé (nécessite un variant 'info' ou utilisez 'default')
      case "rejected":
        return "destructive"; // Rouge pour rejeté
      default:
        return "outline"; // Variante par défaut si non trouvé
    }
  };

  // Mise à jour des statuts disponibles
  const availableStatuses: QuotationStatus[] = ['draft', 'sent', 'accepted', 'rejected', 'invoiced'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3 bg-white rounded-lg shadow-sm border border-gray-200">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-lg text-gray-700 font-medium">Loading quotations...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-red-700 bg-red-50 border border-red-300 rounded-lg shadow-sm space-y-3">
        <FileWarning className="h-10 w-10 text-red-600" />
        <p className="font-semibold text-lg">Loading Error!</p>
        <p className="text-sm text-center px-4">{fetchError}</p>
        <Button onClick={fetchQuotations} className="mt-4" variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <Search className="h-5 w-5 text-gray-500" />
        <Input
          placeholder="Search by client, ID or status..."
          value={filterTerm}
          onChange={(e) => {
            setFilterTerm(e.target.value);
            setPage(1);
          }}
          className="max-w-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 pl-10"
        />
      </div>

      {/* Quotations Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Quotation ID</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Client</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</TableHead>
              <TableHead className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {paginatedQuotations.length > 0 ? (
              paginatedQuotations.map((quotation) => {
                const client = getClientById(quotation.client_id);
                 console.log(`Quotation ID: ${quotation.id}, Client ID from quotation: ${quotation.client_id}, Found Client:`, client); 
                return (
                  <TableRow key={quotation.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quotation.id}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{client ? client.name : 'Unknown Client'}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {format(new Date(quotation.date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge variant={getBadgeVariant(quotation.status)} className="px-2 py-1 rounded-full text-xs font-semibold">
                        {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open actions menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Quotation Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onModifier(quotation.id)} className="flex items-center gap-2">
                            <Edit className="h-4 w-4 text-blue-500" /> Edit
                          </DropdownMenuItem>

                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" /> Change Status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-[180px]">
                              <DropdownMenuLabel>Available Statuses</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {availableStatuses.map((statusOption) => (
                                <DropdownMenuItem
                                  key={statusOption}
                                  onClick={() => handleChangeStatus(quotation.id, statusOption)}
                                  disabled={quotation.status === statusOption}
                                  className="flex items-center gap-2"
                                >
                                  {/* Icônes adaptées aux nouveaux statuts */}
                                  {statusOption === "accepted" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                  {statusOption === "sent" && <Send className="h-4 w-4 text-blue-500" />}
                                  {statusOption === "draft" && <FileWarning className="h-4 w-4 text-gray-500" />}
                                  {statusOption === "invoiced" && <FileText className="h-4 w-4 text-purple-500" />}
                                  {statusOption === "rejected" && <XCircle className="h-4 w-4 text-red-500" />}
                                  {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                          <DropdownMenuSeparator />

                          {/* Générer la facture : seulement si 'accepted' et non 'invoiced' */}
                          {quotation.status === "accepted" && (
                            <DropdownMenuItem onClick={() => onGenererFacture(quotation.id)} className="flex items-center gap-2 font-semibold text-purple-600">
                              <FileText className="h-4 w-4 text-purple-600" /> Generate Invoice
                            </DropdownMenuItem>
                          )}
                          {/* Voir la facture : si 'invoiced' */}
                          {quotation.status === "invoiced" && (
                            <DropdownMenuItem onClick={() => router.push(`/invoices/${quotation.id}`)} className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-600" /> View Invoice
                            </DropdownMenuItem>
                          )}
                          {/* Option désactivée pour les autres statuts */}
                          {quotation.status !== "accepted" && quotation.status !== "invoiced" && (
                            <DropdownMenuItem disabled className="flex items-center gap-2 text-gray-400">
                              <FileText className="h-4 w-4" /> Generate Invoice
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedQuotationId(quotation.id);
                              setOpenConfirmDialog(true);
                            }}
                            className="flex items-center gap-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                  No quotations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-3 pt-4">
        <span className="text-sm text-gray-600">
          Page {totalPages === 0 ? 0 : page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p - 1)}
          disabled={page === 1}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={page === totalPages || totalPages === 0}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </Button>
      </div>

      <ConfirmDeleteDialog
        open={openConfirmDialog}
        onOpenChange={setOpenConfirmDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Quotation"
        description="Are you sure you want to delete this quotation? This action is irreversible."
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">Edit Quotation</DialogTitle>
            <DialogDescription className="text-gray-600">
              Edit the details of this quotation. Click save when you're done.
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

      {quotationToInvoice && (
        <InvoiceGenerationDialog
          open={isInvoiceGenerationDialogOpen}
          onOpenChange={setIsInvoiceGenerationDialogOpen}
          quotation={quotationToInvoice}
        />
      )}
    </div>
  );
}