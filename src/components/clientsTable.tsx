"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // ← Next.js 13+ App Router
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { toast } from "sonner";

type Client = {
  id: string;
  name: string;
  devisValides: number;
  devisEnCours: number;
};

const ITEMS_PER_PAGE = 7;

const clients: Client[] = [
  { id: "1", name: "Entreprise Alpha", devisValides: 5, devisEnCours: 2 },
  { id: "2", name: "Client Bêta", devisValides: 3, devisEnCours: 1 },
  { id: "3", name: "Société Gamma", devisValides: 10, devisEnCours: 0 },
  { id: "4", name: "Nom Exemple", devisValides: 1, devisEnCours: 4 },
  { id: "5", name: "Test SARL", devisValides: 0, devisEnCours: 2 },
  { id: "6", name: "Agence Demo", devisValides: 8, devisEnCours: 3 },
  { id: "7", name: "Client 007", devisValides: 2, devisEnCours: 5 },
  { id: "8", name: "Global Tech", devisValides: 6, devisEnCours: 1 },
];

export default function ClientsTable() {
  const [page, setPage] = useState(1);
  const [filterTerm, setFilterTerm] = useState("");
  const router = useRouter();

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(filterTerm.toLowerCase()) ||
      client.id.toLowerCase().includes(filterTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginated = filteredClients.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const onViewClient = (id: string) => {
    router.push(`/clients/${id}`);
  };

  const handleDelete = async (id: string) => {
  console.log("Suppression du client avec l'id :", id)
  toast.success("Devis supprimé avec succès");
  await new Promise((r) => setTimeout(r, 500))
}



  return (
    <div className="space-y-4">
      <div className="flex justify-start">
        <Input
          placeholder="Filtrer par nom ou ID du client..."
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
            <TableHead>Nom du client</TableHead>
            <TableHead>Devis validés</TableHead>
            <TableHead>Devis en cours</TableHead>
            <TableHead className="text-right">Voir</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.length > 0 ? (
            paginated.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.id}</TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.devisValides}</TableCell>
                <TableCell>{client.devisEnCours}</TableCell>
                
                <TableCell className="text-right justify-end flex gap-2">
                  
                    <Button size="icon" variant="ghost" onClick={() => router.push(`/clients/${client.id}`)}>
                        <Eye className="w-4 h-4" />
                    </Button>
                    <ConfirmDeleteDialog 
                    onConfirm={() => handleDelete(client.id)}
                    trigger={
                    <Button size="icon" variant="ghost">
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                    }
                    title="Supprimer le client"
                    description="Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible."
                />
                </TableCell>
              </TableRow>
            ))
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
