"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog"; 
import { toast } from "sonner";

// Import your Zustand stores and types
import { useClientStore, useQuotationStore } from "@/stores"; 
import type { Client, QuotationStatus } from "@/types"; 

const ITEMS_PER_PAGE = 7;

export default function ClientsTable() {
  const [page, setPage] = useState(1);
  const [filterTerm, setFilterTerm] = useState("");
  const router = useRouter();

  const clients = useClientStore((state) => state.clients);
  const deleteClient = useClientStore((state) => state.deleteClient);

  // Get quotations to calculate devis counts (if needed to display in table)
  const quotations = useQuotationStore((state) => state.quotations);

  // Helper function to calculate devis counts for a client
  const getClientDevisCounts = (clientId: string) => {
    const clientQuotations = quotations.filter(q => q.client_id === clientId);
    const devisValides = clientQuotations.filter(q => q.status === 'validé').length;
    const devisEnCours = clientQuotations.filter(q => q.status === 'en cours' || q.status === 'brouillon').length; // Or just 'en cours'
    return { devisValides, devisEnCours };
  };
  // --- FIN INTEGRATION ZUSTAND ---

  const filteredClients = useMemo(() => {
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(filterTerm.toLowerCase()) ||
        client.id.toLowerCase().includes(filterTerm.toLowerCase())
    );
  }, [clients, filterTerm]); // Recalculate only when clients or filterTerm changes

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginatedClients = useMemo(() => {
    return filteredClients.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  }, [filteredClients, page]); // Recalculate only when filteredClients or page changes

  const onViewClient = (id: string) => {
    router.push(`/clients/${id}`);
  };

  const handleEditClient = (id: string) => {
    router.push(`/clients/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    console.log("Suppression du client avec l'id :", id);
    // Call the deleteClient function from the Zustand store
    deleteClient(id);
    toast.success("Client supprimé avec succès !");
    // No need for a setTimeout here unless you have a specific UI delay
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-start">
        <Input
          placeholder="Filtrer par nom ou ID du client..."
          value={filterTerm}
          onChange={(e) => {
            setFilterTerm(e.target.value);
            setPage(1); // Reset page to 1 when filter changes
          }}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nom du client</TableHead>
            <TableHead>Devis validés</TableHead>
            <TableHead>Devis en cours</TableHead>
            <TableHead className="text-right">Actions</TableHead> {/* Renommé "Voir" en "Actions" */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedClients.length > 0 ? (
            paginatedClients.map((client) => {
              // Calculate devis counts for display
              const { devisValides, devisEnCours } = getClientDevisCounts(client.id);

              return (
                <TableRow key={client.id}>
                  <TableCell>{client.id}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{devisValides}</TableCell> {/* Display calculated counts */}
                  <TableCell>{devisEnCours}</TableCell> {/* Display calculated counts */}
                  
                  <TableCell className="text-right justify-end flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => onViewClient(client.id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleEditClient(client.id)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <ConfirmDeleteDialog 
                      onConfirm={() => handleDelete(client.id)}
                      trigger={
                        <Button size="icon" variant="ghost">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      }
                      title="Supprimer le client"
                      description="Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible et supprimera toutes les données associées." // More precise description
                    />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Aucun client trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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
    </div>
  );
}