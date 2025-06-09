"use client";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { Button } from "./ui/button";
import { Eye, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { Input } from "./ui/input";

type Materiaux = {
  id: string;
  nom: string;
  prix: number;
};
const ITEMS_PER_PAGE = 7;

const materiaux: Materiaux[] = [
  { id: "MAT001", nom: "Ciment", prix: 15000 },
  { id: "MAT002", nom: "Sable", prix: 8000 },
  { id: "MAT003", nom: "Gravier", prix: 10000 },
];

export default function MateriauxTable() {
   const [page, setPage] = useState(1);
    const [filterTerm, setFilterTerm] = useState("");
    const router = useRouter();
  
  const filteredMateriaux = materiaux.filter(
    (element) =>
      element.nom.toLowerCase().includes(filterTerm.toLowerCase()) ||
      element.id.toLowerCase().includes(filterTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredMateriaux.length / ITEMS_PER_PAGE);
  const paginated = filteredMateriaux.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleDelete = async (id: string) => {
    console.log("Suppression du Materiaux avec l'id :", id)
    toast.success("Materiaux supprimé avec succès");
    await new Promise((r) => setTimeout(r, 500))
  }
    return (
    <div className="space-y-4">
      <div className="flex justify-start">
        <Input
          placeholder="Filtrer par nom ou ID du materiaux..."
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
            <TableHead>Nom du Materiaux</TableHead>
            <TableHead>Prix </TableHead>
            <TableHead className="text-right">Voir</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.length > 0 ? (
            paginated.map((element) => (
              <TableRow key={element.id}>
                <TableCell>{element.id}</TableCell>
                <TableCell>{element.nom}</TableCell>
                <TableCell>{element.prix}</TableCell>
                
                <TableCell className="text-right justify-end flex gap-2">
                  
                    <Button size="icon" variant="ghost" onClick={() => router.push(`/materiaux/${element.id}`)}>
                        <Eye className="w-4 h-4" />
                    </Button>
                    <ConfirmDeleteDialog 
                    onConfirm={() => handleDelete(element.id)}
                    trigger={
                    <Button size="icon" variant="ghost">
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                    }
                    title="Supprimer le materiaux"
                    description="Êtes-vous sûr de vouloir supprimer ce materiaux ? Cette action est irréversible."
                />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Aucun materiaux trouvé.
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
  // return (
  //   <Table>
  //     <TableHeader>
  //       <TableRow>
  //         <TableHead>ID</TableHead>
  //         <TableHead>Nom</TableHead>
  //         <TableHead>Prix ($)</TableHead>
  //       </TableRow>
  //     </TableHeader>
  //     <TableBody>
  //       {materiaux.map((m) => (
  //         <TableRow key={m.id}>
  //           <TableCell>{m.id}</TableCell>
  //           <TableCell>{m.nom}</TableCell>
  //           <TableCell>{m.prix.toLocaleString()} $</TableCell>
  //         </TableRow>
  //       ))}
  //     </TableBody>
  //   </Table>
  // );
}
