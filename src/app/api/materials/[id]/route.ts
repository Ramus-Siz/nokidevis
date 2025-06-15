// src/app/api/materials/[id]/route.ts
import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/fileDb';
import { Material } from '@/types';
import { z } from 'zod';

// Schéma de validation Zod pour la mise à jour (partial)
const materialUpdateSchema = z.object({
  name: z.string().min(1, "Le nom du matériau est requis.").optional(),
  unit: z.string().min(1, "L'unité est requise.").optional(),
  price_per_unit: z.number().positive("Le prix par unité doit être un nombre positif.").optional(),
}).partial(); // Tous les champs sont optionnels pour une mise à jour

const materialsFileName = 'materials.json';

// GET un matériau par ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const materials = await readData<Material>(materialsFileName);
    const material = materials.find(m => m.id === id);

    if (!material) {
      return NextResponse.json({ message: 'Matériaux non trouvé.' }, { status: 404 });
    }

    return NextResponse.json(material, { status: 200 });
  } catch (error) {
    console.error(`Erreur GET /api/materials/${params.id}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la récupération du matériaux.' }, { status: 500 });
  }
}

// PUT (Mettre à jour) un matériau par ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updatedMaterialData = materialUpdateSchema.parse(body); // Validation avec Zod

    const materials = await readData<Material>(materialsFileName);
    const materialIndex = materials.findIndex(m => m.id === id);

    if (materialIndex === -1) {
      return NextResponse.json({ message: 'Matériau non trouvé.' }, { status: 404 });
    }

    const updatedMaterial: Material = { ...materials[materialIndex], ...updatedMaterialData, id: id };
    materials[materialIndex] = updatedMaterial;
    await writeData<Material>(materialsFileName, materials);

    return NextResponse.json(updatedMaterial, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Erreur de validation', errors: error.errors }, { status: 400 });
    }
    console.error(`Erreur PUT /api/materials/${params.id}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la mise à jour du matériau.' }, { status: 500 });
  }
}

// DELETE un matériau par ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    let materials = await readData<Material>(materialsFileName);
    const initialLength = materials.length; // Pour vérifier si un élément a été supprimé

    materials = materials.filter(m => m.id !== id);

    if (materials.length === initialLength) { // Si la longueur n'a pas changé, l'ID n'a pas été trouvé
      return NextResponse.json({ message: 'Matériau non trouvé.' }, { status: 404 });
    }

    await writeData<Material>(materialsFileName, materials);

    return NextResponse.json({ message: 'Matériau supprimé avec succès.' }, { status: 200 });
  } catch (error) {
    console.error(`Erreur DELETE /api/materials/${params.id}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la suppression du matériau.' }, { status: 500 });
  }
}