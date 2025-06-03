"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { devisList } from "@/lib/devis";
import { format } from "date-fns";
import { Pagination } from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react";

const ITEMS_PER_PAGE = 5;

export default function DevisTable() {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(devisList.length / ITEMS_PER_PAGE);
  const paginated = devisList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const onModifier = (id: string) => {
    console.log("Modifier devis", id)
  }

  const onSupprimer = (id: string) => {
    console.log("Supprimer devis", id)
  }

  const onGenererFacture = (id: string) => {
    console.log("Générer facture pour devis", id)
  }

  return (
    <div className="space-y-4">
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
          {paginated.map((devis) => (
            <TableRow key={devis.id}>
              <TableCell>{devis.id}</TableCell>
              <TableCell>{devis.client}</TableCell>
              <TableCell>{format(new Date(devis.createdAt), "dd/MM/yyyy")}</TableCell>
              <TableCell>
                <Badge variant={
                  devis.status === "validé"
                    ? "default"
                    : devis.status === "en attente"
                    ? "secondary"
                    : "destructive"
                }>
                  {devis.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger><span className="text-xl">...</span></DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Action</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onModifier(devis.id)}>
                      Modifier
                    </DropdownMenuItem>
                         {devis.status !== "validé"? (
                      <DropdownMenuItem  disabled onClick={() => onGenererFacture(devis.id)}>
                        Générer la facture
                      </DropdownMenuItem>
                    ):<DropdownMenuItem   onClick={() => onGenererFacture(devis.id)}>
                        Générer la facture
                      </DropdownMenuItem>}
                    <DropdownMenuItem onClick={() => onSupprimer(devis.id)}>
                      Supprimer
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination simple */}
      <div className="flex justify-end gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="text-sm px-3 py-1 border rounded disabled:opacity-50"
        >
          Précédent
        </button>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="text-sm px-3 py-1 border rounded disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  )
}
