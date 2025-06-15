// src/app/api/invoices/route.ts
import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/fileDb';
import { Invoice, Client, Material, InvoiceItem, InvoiceStatus, Quotation } from '@/types';
import { generateUniqueId } from '@/utils/idGenerator';
import { z } from 'zod';

const invoiceItemSchema = z.object({
  material_id: z.string().min(1, "L'ID du matériau est requis."),
  quantity: z.number().int().positive("La quantité doit être un nombre entier positif."),
  price_per_unit: z.number().positive("Le prix par unité doit être un nombre positif."),
  total_price: z.number().positive("Le prix total de l'élément doit être positif."), // Assumé calculé côté client ou vérifié
});

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Le numéro de facture est requis."),
  quotation_id: z.string().optional(), // Peut être null si non lié à un devis
  client_id: z.string().min(1, "L'ID du client est requis."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date d'émission doit être au format YYYY-MM-DD."),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date d'échéance doit être au format YYYY-MM-DD."),
  items: z.array(invoiceItemSchema).min(1, "Au moins un élément est requis pour la facture."),
  tax_rate: z.number().min(0, "Le taux de taxe doit être positif ou nul.").max(1, "Le taux de taxe ne peut pas dépasser 1 (100%).").default(0),
  notes: z.string().optional(),
  created_by: z.string().optional(),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date de paiement doit être au format YYYY-MM-DD.").optional().nullable(),
  status: z.enum(['pending', 'paid', 'partially_paid', 'cancelled', 'overdue']).default('pending'),
});

const invoicesFileName = 'invoices.json';
const clientsFileName = 'clients.json';
const materialsFileName = 'materials.json';
const quotationsFileName = 'quotations.json';

// Helper pour calculer le total d'une facture
function calculateInvoiceTotals(items: InvoiceItem[], tax_rate: number): { subtotal: number; tax_amount: number; total: number } {
  const subtotal = items.reduce((acc, item) => acc + item.total_price, 0); // Utilise le total_price de l'item
  const tax_amount = subtotal * tax_rate;
  const total = subtotal + tax_amount;
  return { subtotal, tax_amount, total };
}

// GET toutes les factures
export async function GET() {
  try {
    const invoices = await readData<Invoice>(invoicesFileName);
    return NextResponse.json(invoices, { status: 200 });
  } catch (error) {
    console.error('Erreur GET /api/invoices:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la récupération des factures.' }, { status: 500 });
  }
}

// POST une nouvelle facture
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newInvoiceData = invoiceSchema.parse(body); // Validation avec Zod

    const clients = await readData<Client>(clientsFileName);
    const materials = await readData<Material>(materialsFileName);
    const quotations = await readData<Quotation>(quotationsFileName);

    // Vérifier l'existence du client
    if (!clients.some(c => c.id === newInvoiceData.client_id)) {
      return NextResponse.json({ message: 'Client non trouvé.' }, { status: 400 });
    }

    // Si quotation_id est fourni, vérifier son existence
    if (newInvoiceData.quotation_id) { // Check if quotation_id is provided and not null
      if (!quotations.some(q => q.id === newInvoiceData.quotation_id)) {
        return NextResponse.json({ message: 'Devis de référence (quotation_id) non trouvé.' }, { status: 400 });
      }
    }
    

    // Vérifier l'existence des matériaux et la cohérence des prix
    for (const item of newInvoiceData.items) {
      if (!materials.some(m => m.id === item.material_id)) {
        return NextResponse.json({ message: `Matériau avec l'ID ${item.material_id} non trouvé.` }, { status: 400 });
      }
      // Assurer que total_price est correct (quantity * price_per_unit)
      if (Math.abs(item.total_price - (item.quantity * item.price_per_unit)) > 0.001) { // Utilisation d'une petite tolérance pour les flottants
          return NextResponse.json({ message: `Le prix total pour l'élément ${item.material_id} est incorrect.` }, { status: 400 });
      }
    }

    const invoices = await readData<Invoice>(invoicesFileName);

    const { subtotal, tax_amount, total } = calculateInvoiceTotals(newInvoiceData.items, newInvoiceData.tax_rate);

    const newInvoice: Invoice = {
      id: generateUniqueId('inv-'),
      ...newInvoiceData,
      subtotal,
      tax_amount,
      total,
      status: newInvoiceData.status || 'pending', // Utilise le statut fourni ou 'pending' par défaut
    };
    
    invoices.push(newInvoice);
    await writeData<Invoice>(invoicesFileName, invoices);

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Erreur de validation', errors: error.errors }, { status: 400 });
    }
    console.error('Erreur POST /api/invoices:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de l\'ajout de la facture.' }, { status: 500 });
  }
}