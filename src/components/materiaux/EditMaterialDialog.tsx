"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {useMaterialStore} from '@/stores';
import { Material } from "@/types";

interface EditMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string | null;
}

export const EditMaterialDialog: React.FC<EditMaterialDialogProps> = ({
  open,
  onOpenChange,
  materialId,
}) => {
  const getMaterialById = useMaterialStore((state) => state.getMaterialById);
  const updateMaterial = useMaterialStore((state) => state.updateMaterial);

  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);
  const [name, setName] = useState(""); // Renommé 'nom' en 'name'
  const [unit, setUnit] = useState(""); // Nouveau champ 'unit'
  const [pricePerUnit, setPricePerUnit] = useState<number>(0); // Renommé 'prix' en 'pricePerUnit'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && materialId) {
      setLoading(true);
      const materialToEdit = getMaterialById(materialId);
      if (materialToEdit) {
        setCurrentMaterial(materialToEdit);
        setName(materialToEdit.name); // Utilise 'name'
        setUnit(materialToEdit.unit); // Utilise 'unit'
        setPricePerUnit(materialToEdit.price_per_unit); // Utilise 'price_per_unit'
      } else {
        toast.error("Matériau non trouvé pour l'édition.");
        onOpenChange(false); 
      }
      setLoading(false);
    } else {
      setName("");
      setUnit("");
      setPricePerUnit(0);
      setCurrentMaterial(null);
    }
  }, [open, materialId, getMaterialById, onOpenChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMaterial) return;

    setLoading(true);

    if (isNaN(pricePerUnit) || pricePerUnit <= 0) { // Validation sur 'pricePerUnit'
      toast.error("Le prix par unité doit être un nombre positif.");
      setLoading(false);
      return;
    }

    const updatedMaterial: Material = {
      ...currentMaterial,
      name, // Mise à jour de 'name'
      unit, // Mise à jour de 'unit'
      price_per_unit: pricePerUnit, // Mise à jour de 'price_per_unit'
    };

    updateMaterial(updatedMaterial);
    toast.success("Matériau mis à jour avec succès !");
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le matériau</DialogTitle>
          <DialogDescription>
            Apportez les modifications au matériau ici. Cliquez sur enregistrer
            quand vous avez terminé.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center">Chargement des données du matériau...</div>
        ) : !currentMaterial ? (
          <div className="py-8 text-center text-red-500">Erreur : Matériau introuvable.</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right"> {/* Label pour 'name' */}
                Nom
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right"> {/* Label pour 'unit' */}
                Unité
              </Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price_per_unit" className="text-right"> {/* Label pour 'price_per_unit' */}
                Prix par Unité
              </Label>
              <Input
                id="price_per_unit"
                type="number"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(parseFloat(e.target.value))}
                className="col-span-3"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Enregistrer les modifications</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};