// src/app/api/quotations/[id]/route.ts

import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/fileDb';
import { Quotation, QuotationItem, Client, Material } from '@/types';
import { z } from 'zod';

// Fichiers de données
const quotationsFileName = 'quotations.json';
const clientsFileName = 'clients.json';
const materialsFileName = 'materials.json';

// Schéma de validation Zod pour QuotationItem pour la MISE À JOUR
// Les champs sont implicitement optionnels grâce au .partial() sur l'objet parent
const quotationItemUpdateSchema = z.object({
  material_id: z.string().min(1, "L'ID du matériau est requis."),
  quantity: z.number().int().positive("La quantité doit être un nombre entier positif."),
  price_per_unit: z.number().positive("Le prix par unité doit être un nombre positif."),
});

// Schéma de validation Zod pour la mise à jour d'une Quotation
const quotationUpdateSchema = z.object({
  quotationNumber: z.string().min(1, "Le numéro de devis est requis.").optional(),
  client_id: z.string().min(1, "L'ID du client est requis.").optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format YYYY-MM-DD.").optional(),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date d'expiration doit être au format YYYY-MM-DD.").optional(),
  items: z.array(quotationItemUpdateSchema.partial()).min(1, "Au moins un élément est requis pour le devis.").optional(), // C'est ici que le .partial() est appliqué
  tax_rate: z.number().min(0, "Le taux de taxe doit être positif ou nul.").max(1, "Le taux de taxe ne peut pas dépasser 1 (100%).").optional(),
  notes: z.string().optional(),
  created_by: z.string().optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'invoiced']).optional(),
}).partial();

// Helper pour calculer le total d'un devis
function calculateQuotationTotals(items: QuotationItem[], tax_rate: number): { subtotal: number; tax_amount: number; total: number } {
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price_per_unit), 0);
  const tax_amount = subtotal * tax_rate;
  const total = subtotal + tax_amount;
  return { subtotal, tax_amount, total };
}

// GET un devis par ID (inchangé)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const quotations = await readData<Quotation>(quotationsFileName);
    const quotation = quotations.find(q => q.id === id);

    if (!quotation) {
      return NextResponse.json({ message: 'Devis non trouvé.' }, { status: 404 });
    }

    return NextResponse.json(quotation, { status: 200 });
  } catch (error) {
    console.error(`Erreur GET /api/quotations/${params.id}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la récupération du devis.' }, { status: 500 });
  }
}

// PUT (Mettre à jour) un devis par ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updatedQuotationData = quotationUpdateSchema.parse(body); // Validation avec Zod

    const quotations = await readData<Quotation>(quotationsFileName);
    const quotationIndex = quotations.findIndex(q => q.id === id);

    if (quotationIndex === -1) {
      return NextResponse.json({ message: 'Devis non trouvé.' }, { status: 404 });
    }

    const currentQuotation = quotations[quotationIndex];

    // --- DÉBUT DE LA LOGIQUE DE CONSTRUCTION DE newQuotation ---
    // Crée un objet temporaire en copiant l'existant et en appliquant les mises à jour simples.
    // N'inclut PAS les 'items', 'subtotal', 'tax_amount', 'total' pour le moment.
    const tempNewQuotation: Quotation = {
      ...currentQuotation,
      ...updatedQuotationData,
      id: id, // S'assurer que l'ID reste le même
      // Exclure explicitement les propriétés qui seront recalculées/traitées séparément
      items: currentQuotation.items, // On commence avec les items actuels
      subtotal: currentQuotation.subtotal,
      tax_amount: currentQuotation.tax_amount,
      total: currentQuotation.total,
    };

    // Si client_id est mis à jour, vérifier son existence
    if (updatedQuotationData.client_id && updatedQuotationData.client_id !== currentQuotation.client_id) {
        const clients = await readData<Client>(clientsFileName);
        if (!clients.some(c => c.id === updatedQuotationData.client_id)) {
            return NextResponse.json({ message: 'Nouveau client spécifié non trouvé.' }, { status: 400 });
        }
        tempNewQuotation.client_id = updatedQuotationData.client_id;
    }
    // Gérer les autres champs non-items (date, expiry_date, status, notes, created_by)
    if (updatedQuotationData.quotationNumber !== undefined) tempNewQuotation.quotationNumber = updatedQuotationData.quotationNumber;
    if (updatedQuotationData.date !== undefined) tempNewQuotation.date = updatedQuotationData.date;
    if (updatedQuotationData.expiry_date !== undefined) tempNewQuotation.expiry_date = updatedQuotationData.expiry_date;
    if (updatedQuotationData.status !== undefined) tempNewQuotation.status = updatedQuotationData.status;
    if (updatedQuotationData.notes !== undefined) tempNewQuotation.notes = updatedQuotationData.notes;
    if (updatedQuotationData.created_by !== undefined) tempNewQuotation.created_by = updatedQuotationData.created_by;

    // Définir le taux de taxe à utiliser pour le calcul
    let taxRateToUse = currentQuotation.tax_rate;
    if (updatedQuotationData.tax_rate !== undefined) {
        taxRateToUse = updatedQuotationData.tax_rate;
    }

    // Gérer les items et recalculer les totaux si nécessaire
    let finalItems: QuotationItem[] = tempNewQuotation.items; // Commence avec les items déjà assignés

    if (updatedQuotationData.items) { // Si des items ont été fournis dans le corps de la requête PUT
        const materials = await readData<Material>(materialsFileName); // Chargez les matériaux une seule fois

        finalItems = updatedQuotationData.items.map(updatedItemPartial => {
            const existingItem = currentQuotation.items.find(item => item.material_id === updatedItemPartial.material_id);
            
            // Fusionne l'item existant avec les données partielles mises à jour.
            // Si l'item est nouveau, il sera construit à partir des updatedItemPartial.
            const combinedItem = {
                ...(existingItem || {}),
                ...updatedItemPartial,
            };

            // Validation stricte pour s'assurer que l'item fusionné est complet et valide.
            if (
                !combinedItem.material_id || typeof combinedItem.material_id !== 'string' ||
                combinedItem.quantity === undefined || typeof combinedItem.quantity !== 'number' || combinedItem.quantity <= 0 ||
                combinedItem.price_per_unit === undefined || typeof combinedItem.price_per_unit !== 'number' || combinedItem.price_per_unit <= 0
            ) {
                throw new Error(`Données d'item de devis incomplètes ou invalides pour le matériau ${combinedItem.material_id || 'inconnu'}.`);
            }
            
            // Vérifier l'existence du matériau finalisé
            if (!materials.some(m => m.id === combinedItem.material_id)) {
                throw new Error(`Matériau avec l'ID ${combinedItem.material_id} non trouvé pour un item de devis.`);
            }

            return combinedItem as QuotationItem; // Cast sécurisé
        });
    }

    // Après avoir déterminé la liste finale des items (finalItems), calculez les totaux.
    const { subtotal, tax_amount, total } = calculateQuotationTotals(finalItems, taxRateToUse);

    // Assigner les valeurs finales à l'objet de devis qui sera enregistré
    tempNewQuotation.items = finalItems;
    tempNewQuotation.subtotal = subtotal;
    tempNewQuotation.tax_amount = tax_amount;
    tempNewQuotation.total = total;
    tempNewQuotation.tax_rate = taxRateToUse; // Mettre à jour le tax_rate si modifié

    // Enregistrement final
    quotations[quotationIndex] = tempNewQuotation;
    await writeData<Quotation>(quotationsFileName, quotations);

    return NextResponse.json(tempNewQuotation, { status: 200 });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Erreur de validation des données de mise à jour du devis.', errors: error.errors }, { status: 400 });
    }
    console.error(`Erreur PUT /api/quotations/${params.id}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la mise à jour du devis.' }, { status: 500 });
  }
}

// DELETE un devis par ID (inchangé)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    let quotations = await readData<Quotation>(quotationsFileName);
    const initialLength = quotations.length;

    quotations = quotations.filter(q => q.id !== id);

    if (quotations.length === initialLength) {
      return NextResponse.json({ message: 'Devis non trouvé.' }, { status: 404 });
    }

    await writeData<Quotation>(quotationsFileName, quotations);

    return NextResponse.json({ message: 'Devis supprimé avec succès.' }, { status: 200 });
  } catch (error) {
    console.error(`Erreur DELETE /api/quotations/${params.id}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la suppression du devis.' }, { status: 500 });
  }
}