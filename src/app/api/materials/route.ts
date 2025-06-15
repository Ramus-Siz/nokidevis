// src/app/api/materials/route.ts
import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/fileDb';
import { Material } from '@/types';
import { generateUniqueId } from '@/utils/idGenerator';
import { z } from 'zod'; // Import de Zod

// Schéma de validation Zod pour Material
const materialSchema = z.object({
  name: z.string().min(1, "Le nom du matériau est requis."),
  unit: z.string().min(1, "L'unité est requise."),
  price_per_unit: z.number().positive("Le prix par unité doit être un nombre positif."),
});

const materialsFileName = 'materials.json';

// GET tous les matériaux
export async function GET() {
  try {
    const materials = await readData<Material>(materialsFileName);
    return NextResponse.json(materials, { status: 200 });
  } catch (error) {
    console.error('Erreur GET /api/materials:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la récupération des matériaux.' }, { status: 500 });
  }
}

// POST un nouveau matériau
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newMaterialData = materialSchema.parse(body); // Validation avec Zod

    const materials = await readData<Material>(materialsFileName);

    const newMaterial: Material = {
      id: generateUniqueId('mat-'), // Laissez le backend générer l'ID
      ...newMaterialData,
    };

    materials.push(newMaterial);
    await writeData<Material>(materialsFileName, materials);

    return NextResponse.json(newMaterial, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) { // Gérer les erreurs de validation Zod
        return NextResponse.json({ message: 'Erreur de validation', errors: error.errors }, { status: 400 });
    }
    console.error('Erreur POST /api/materials:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de l\'ajout du matériau.' }, { status: 500 });
  }
}