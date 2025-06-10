// src/app/materiaux/MateriauxTable.tsx (ou MaterialsTable.tsx)
"use client";

import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Input } from "@/components/ui/input";

import { useMaterialStore } from "@/stores"; 
import { EditMaterialDialog } from "@/components/materiaux/EditMaterialDialog";

const ITEMS_PER_PAGE = 7;

export default function MateriauxTable() { // Ou MaterialsTable
    const [page, setPage] = useState(1);
    const [filterTerm, setFilterTerm] = useState("");
    const router = useRouter();

    const materials = useMaterialStore((state) => state.materials);
    const deleteMaterial = useMaterialStore((state) => state.deleteMaterial);

    const [isEditMaterialDialogOpen, setIsEditMaterialDialogOpen] = useState(false);
    const [materialIdToEdit, setMaterialIdToEdit] = useState<string | null>(null);
   
    const filteredMaterials = useMemo(() => {
        return materials.filter(
            (element) =>
                // Filtre par 'name' au lieu de 'nom'
                element.name.toLowerCase().includes(filterTerm.toLowerCase()) ||
                element.id.toLowerCase().includes(filterTerm.toLowerCase())
        );
    }, [materials, filterTerm]);

    const totalPages = Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE);
    const paginated = useMemo(() => {
        return filteredMaterials.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    }, [filteredMaterials, page]);

    const handleDelete = async (id: string) => {
        console.log("Suppression du Matériau avec l'id :", id);
        deleteMaterial(id);
        toast.success("Matériau supprimé avec succès !");
    };

    const handleEditMaterial = (id: string) => {
        setMaterialIdToEdit(id);
        setIsEditMaterialDialogOpen(true);
    };

    const onViewMaterial = (id: string) => {
        // router.push(`/materiaux/${id}`); 
        toast.info(`Afficher les détails du matériau ${id} (fonctionnalité à implémenter)`);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-start">
                <Input
                    placeholder="Filtrer par nom ou ID du matériau..."
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
                        <TableHead>Nom du Matériau</TableHead>
                        <TableHead>Unité</TableHead> {/* Ajout de la colonne Unité */}
                        <TableHead>Prix par Unité</TableHead> {/* Renommé Prix */}
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginated.length > 0 ? (
                        paginated.map((element) => (
                            <TableRow key={element.id}>
                                <TableCell>{element.id}</TableCell>
                                <TableCell>{element.name}</TableCell> {/* Utilise 'name' */}
                                <TableCell>{element.unit}</TableCell> {/* Utilise 'unit' */}
                                <TableCell>{element.price_per_unit} $</TableCell> {/* Utilise 'price_per_unit' */}
                                <TableCell className="text-right justify-end flex gap-2">
                                    <Button size="icon" variant="ghost" onClick={() => onViewMaterial(element.id)}>
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => handleEditMaterial(element.id)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <ConfirmDeleteDialog
                                        onConfirm={() => handleDelete(element.id)}
                                        trigger={
                                            <Button size="icon" variant="ghost">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        }
                                        title="Supprimer le matériau"
                                        description="Êtes-vous sûr de vouloir supprimer ce matériau ? Cette action est irréversible."
                                    />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center"> {/* Colspan ajusté à 5 */}
                                Aucun matériau trouvé.
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

            {materialIdToEdit && (
                <EditMaterialDialog
                    open={isEditMaterialDialogOpen}
                    onOpenChange={setIsEditMaterialDialogOpen}
                    materialId={materialIdToEdit}
                />
            )}
        </div>
    );
}