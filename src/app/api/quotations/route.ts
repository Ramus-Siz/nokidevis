// src/app/api/quotations/route.ts
import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/fileDb'; // Assurez-vous que le chemin est correct
import { Quotation, QuotationItem, Client, Material } from '@/types'; // Importez tous les types nécessaires
import { generateUniqueId } from '@/utils/idGenerator'; // Assurez-vous que le chemin est correct
import { z } from 'zod'; // Import de Zod

// Fichiers de données
const quotationsFileName = 'quotations.json';
const clientsFileName = 'clients.json'; // Pour valider l'existence du client
const materialsFileName = 'materials.json'; // Pour valider l'existence des matériaux des items

// Schéma de validation Zod pour QuotationItem
const quotationItemSchema = z.object({
  material_id: z.string().min(1, "L'ID du matériau est requis pour un élément de devis."),
  quantity: z.number().int().positive("La quantité doit être un nombre entier positif."),
  price_per_unit: z.number().positive("Le prix par unité doit être un nombre positif."),
});

// Schéma de validation Zod pour Quotation
const quotationSchema = z.object({
  quotationNumber: z.string().min(1, "Le numéro de devis est requis."),
  client_id: z.string().min(1, "L'ID du client est requis."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format YYYY-MM-DD."),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date d'expiration doit être au format YYYY-MM-DD."),
  items: z.array(quotationItemSchema).min(1, "Au moins un élément est requis pour le devis."),
  tax_rate: z.number().min(0, "Le taux de taxe doit être positif ou nul.").max(1, "Le taux de taxe ne peut pas dépasser 1 (100%).").default(0.18), // Valeur par défaut 18%
  notes: z.string().optional(),
  created_by: z.string().optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'invoiced']).default('draft'), // Statut par défaut
});

// Helper pour calculer le total d'un devis
function calculateQuotationTotals(items: QuotationItem[], tax_rate: number): { subtotal: number; tax_amount: number; total: number } {
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price_per_unit), 0);
  const tax_amount = subtotal * tax_rate;
  const total = subtotal + tax_amount;
  return { subtotal, tax_amount, total };
}

// GET tous les devis
export async function GET() {
  try {
    const quotations = await readData<Quotation>(quotationsFileName);
    return NextResponse.json(quotations, { status: 200 });
  } catch (error) {
    console.error('Erreur GET /api/quotations:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la récupération des devis.' }, { status: 500 });
  }
}

// POST un nouveau devis
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newQuotationData = quotationSchema.parse(body); // Validation avec Zod

    const clients = await readData<Client>(clientsFileName);
    const materials = await readData<Material>(materialsFileName);

    // Vérifier l'existence du client
    if (!clients.some(c => c.id === newQuotationData.client_id)) {
      return NextResponse.json({ message: 'Client non trouvé.' }, { status: 400 });
    }

    // Vérifier l'existence des matériaux et la cohérence des prix
    for (const item of newQuotationData.items) {
      const material = materials.find(m => m.id === item.material_id);
      if (!material) {
        return NextResponse.json({ message: `Matériau avec l'ID ${item.material_id} non trouvé.` }, { status: 400 });
      }
      // Optionnel: Vous pouvez vérifier si le price_per_unit fourni correspond au prix du matériau dans la base
      // if (material.price_per_unit !== item.price_per_unit) {
      //   return NextResponse.json({ message: `Le prix unitaire pour le matériau ${item.material_id} est incohérent.` }, { status: 400 });
      // }
    }

    const quotations = await readData<Quotation>(quotationsFileName);

    const { subtotal, tax_amount, total } = calculateQuotationTotals(newQuotationData.items, newQuotationData.tax_rate);

    const newQuotation: Quotation = {
      id: generateUniqueId('dev-'), // Laissez le backend générer l'ID
      ...newQuotationData,
      subtotal,
      tax_amount,
      total,
      total_amount: 0,
      last_updated: ''
    };

    quotations.push(newQuotation);
    await writeData<Quotation>(quotationsFileName, quotations);

    return NextResponse.json(newQuotation, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) { // Gérer les erreurs de validation Zod
        return NextResponse.json({ message: 'Erreur de validation des données du devis.', errors: error.errors }, { status: 400 });
    }
    console.error('Erreur POST /api/quotations:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de l\'ajout du devis.' }, { status: 500 });
  }
}