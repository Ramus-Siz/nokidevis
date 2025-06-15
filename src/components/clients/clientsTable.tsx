// src/components/clients/ClientsTable.tsx
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

import { EditClientDialog } from "./EditClientDialog";

// Assurez-vous d'importer les interfaces de store si elles sont définies séparément
// ou de les importer depuis vos fichiers de store s'ils les exportent.
// Par exemple, si ClientState est exporté par useClientStore.ts:
import { useClientStore, useQuotationStore, ClientState, QuotationState } from "@/stores";
import type { Client, Quotation, QuotationStatus } from "@/types";


const ITEMS_PER_PAGE = 7;

export default function ClientsTable() {
  const [page, setPage] = useState(1);
  const [filterTerm, setFilterTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();

  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [clientIdToEdit, setClientIdToEdit] = useState<string | null>(null);

  // CORRECTION ICI : Typer le paramètre 'state' dans les hooks Zustand
  const clients = useClientStore((state: ClientState) => state.clients); // <-- Ajout de ': ClientState'
  const setClients = useClientStore((state: ClientState) => state.setClients); // <-- Ajout de ': ClientState'
  const removeClient = useClientStore((state: ClientState) => state.deleteClient); // <-- Ajout de ': ClientState'

  const quotations = useQuotationStore((state: QuotationState) => state.quotations); // <-- Ajout de ': QuotationState'
  const setQuotations = useQuotationStore((state: QuotationState) => state.setQuotations); // <-- Ajout de ': QuotationState'

  useEffect(() => {
    async function fetchClientsAndQuotations() {
      setLoading(true);
      setError(null);
      try {
        const [clientsRes, quotationsRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/quotations'),
        ]);

        if (!clientsRes.ok) throw new Error(`Erreur clients: ${clientsRes.statusText}`);
        if (!quotationsRes.ok) throw new Error(`Erreur devis: ${quotationsRes.statusText}`);

        const fetchedClients: Client[] = await clientsRes.json();
        const fetchedQuotations: Quotation[] = await quotationsRes.json();

        setClients(fetchedClients);
        setQuotations(fetchedQuotations);

      } catch (err: any) {
        console.error("Échec du chargement des données:", err);
        setError(`Échec du chargement des clients et devis: ${err.message || 'Erreur inconnue'}`);
        toast.error(`Erreur de chargement: ${err.message || 'Vérifiez la console.'}`);
      } finally {
        setLoading(false);
      }
    }

    fetchClientsAndQuotations();
  }, [setClients, setQuotations]);

  const getClientDevisCounts = useCallback((clientId: string) => {
    const clientQuotations = quotations.filter(q => q.client_id === clientId);
    const devisValides = clientQuotations.filter(q => q.status === 'accepted').length;
    const devisEnCours = clientQuotations.filter(q => ['draft', 'sent'].includes(q.status)).length;
    return { devisValides, devisEnCours };
  }, [quotations]);

  const filteredClients = useMemo(() => {
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(filterTerm.toLowerCase()) ||
        client.id.toLowerCase().includes(filterTerm.toLowerCase())
    );
  }, [clients, filterTerm]);

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginatedClients = useMemo(() => {
    return filteredClients.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  }, [filteredClients, page]);

  const onViewClient = (id: string) => {
    router.push(`/clients/${id}`);
  };

  const handleEditClient = (id: string) => {
    setClientIdToEdit(id);
    setIsEditClientDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Erreur HTTP: ${res.statusText}`);
      }

      removeClient(id);
      toast.success("Client supprimé avec succès !");
    } catch (err: any) {
      console.error("Échec de la suppression du client:", err);
      toast.error(`Échec de la suppression: ${err.message || 'Erreur inconnue.'}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Input placeholder="Filtrer par nom ou ID du client..." className="max-w-sm opacity-75" disabled />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-[60px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[120px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                <TableHead className="text-right"><Skeleton className="h-4 w-[80px]" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg shadow-sm">
        <p className="font-semibold text-lg mb-2">Impossible de charger les données des clients.</p>
        <p className="text-sm">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Filtrer par nom ou ID du client..."
          value={filterTerm}
          onChange={(e) => {
            setFilterTerm(e.target.value);
            setPage(1);
          }}
          className="max-w-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
        />
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/70">
              <TableHead className="w-[100px] text-gray-700 font-semibold">ID</TableHead>
              <TableHead className="text-gray-700 font-semibold">Nom du client</TableHead>
              <TableHead className="text-gray-700 font-semibold">Devis validés</TableHead>
              <TableHead className="text-gray-700 font-semibold">Devis en cours</TableHead>
              <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClients.length > 0 ? (
              paginatedClients.map((client) => {
                const { devisValides, devisEnCours } = getClientDevisCounts(client.id);

                return (
                  <TableRow key={client.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <TableCell className="font-medium text-gray-800">{client.id}</TableCell>
                    <TableCell className="text-gray-700">{client.name}</TableCell>
                    <TableCell className="text-green-600 font-semibold">{devisValides}</TableCell>
                    <TableCell className="text-orange-600 font-semibold">{devisEnCours}</TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => onViewClient(client.id)} className="hover:bg-blue-100 text-blue-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleEditClient(client.id)} className="hover:bg-yellow-100 text-yellow-600">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <ConfirmDeleteDialog
                          onConfirm={() => handleDelete(client.id)}
                          trigger={
                            <Button size="icon" variant="ghost" className="hover:bg-red-100 text-red-600" disabled={deletingId === client.id}>
                              {deletingId === client.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          }
                          title="Supprimer le client"
                          description="Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible et supprimera toutes les données associées (devis, factures, etc.)."
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                  Aucun client trouvé pour le moment.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => setPage((p) => p - 1)}
          disabled={page === 1 || loading}
          className="min-w-[100px] hover:bg-gray-100 transition-colors duration-200"
        >
          Précédent
        </Button>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={page === totalPages || totalPages === 0 || loading}
          className="min-w-[100px] hover:bg-gray-100 transition-colors duration-200"
        >
          Suivant
        </Button>
      </div>

      {clientIdToEdit && (
        <EditClientDialog
          open={isEditClientDialogOpen}
          onOpenChange={setIsEditClientDialogOpen}
          clientId={clientIdToEdit}
        />
      )}
    </div>
  );
}