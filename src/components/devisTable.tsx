"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { devisList } from "@/lib/devis";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { toast } from "sonner";


const ITEMS_PER_PAGE = 7;

type DevisTableProps = {
  onlyValidated?: boolean;
};

export default function DevisTable({ onlyValidated = false }: DevisTableProps) {
  const [page, setPage] = useState(1);
  const [filterTerm, setFilterTerm] = useState("");
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedDevisId, setSelectedDevisId] = useState<string | null>(null);

  const filteredDevis = devisList
    .filter(
      (devis) =>
        devis.client.toLowerCase().includes(filterTerm.toLowerCase()) ||
        devis.id.toLowerCase().includes(filterTerm.toLowerCase())
    )
    .filter((devis) => (onlyValidated ? devis.status === "validé" : true));

  const totalPages = Math.ceil(filteredDevis.length / ITEMS_PER_PAGE);
  const paginated = filteredDevis.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const onModifier = (id: string) => {
    console.log("Modifier devis", id);
  };

  const onSupprimer = async (id: string) => {
    console.log("Supprimer devis", id);
    await new Promise((r) => setTimeout(r, 500));
  };

  const handleDelete = async () => {
    if (selectedDevisId) {
      await onSupprimer(selectedDevisId);
      toast.success("Devis supprimé avec succès");
      setSelectedDevisId(null);
    }
    setOpenConfirmDialog(false);
  };

  const onGenererFacture = (id: string) => {
    console.log("Générer facture pour devis", id);
  };

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
            paginated.map((devis) => (
              <TableRow key={devis.id}>
                <TableCell>{devis.id}</TableCell>
                <TableCell>{devis.client}</TableCell>
                <TableCell>
                  {format(new Date(devis.createdAt), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      devis.status === "validé"
                        ? "default"
                        : devis.status === "en attente"
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {devis.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <span className="text-xl">...</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onModifier(devis.id)}>
                        Modifier
                      </DropdownMenuItem>
                      {devis.status !== "validé" ? (
                        <DropdownMenuItem
                          disabled
                          onClick={() => onGenererFacture(devis.id)}
                        >
                          Générer la facture
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => onGenererFacture(devis.id)}
                        >
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
            ))
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
        onConfirm={handleDelete}
        title="Supprimer le devis"
        description="Voulez-vous vraiment supprimer ce devis ?"
      />
    </div>
  );
}
