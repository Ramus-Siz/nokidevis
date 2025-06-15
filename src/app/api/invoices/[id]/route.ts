// src/app/api/invoices/[id]/route.ts
import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/fileDb';
import { Invoice, Client, Material, InvoiceItem, InvoiceStatus, Quotation } from '@/types';
import { z } from 'zod';

const invoiceItemSchema = z.object({
  material_id: z.string().min(1),
  quantity: z.number().int().positive(),
  price_per_unit: z.number().positive(),
  total_price: z.number().positive(),
});

const invoiceUpdateSchema = z.object({
  invoiceNumber: z.string().min(1, "Le numéro de facture est requis.").optional(),
  quotation_id: z.string().optional().nullable(), // Nullable pour permettre de le désassocier
  client_id: z.string().min(1, "L'ID du client est requis.").optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date d'émission doit être au format YYYY-MM-DD.").optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date d'échéance doit être au format YYYY-MM-DD.").optional(),
  items: z.array(invoiceItemSchema).min(1, "Au moins un élément est requis pour la facture.").optional(),
  tax_rate: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
  created_by: z.string().optional(),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date de paiement doit être au format YYYY-MM-DD.").optional().nullable(),
  status: z.enum(['pending', 'paid', 'partially_paid', 'cancelled', 'overdue']).optional(),
}).partial(); // Tous les champs sont optionnels pour une mise à jour partielle

const invoicesFileName = 'invoices.json';
const clientsFileName = 'clients.json';
const materialsFileName = 'materials.json';
const quotationsFileName = 'quotations.json';

// Helper pour calculer le total d'une facture
function calculateInvoiceTotals(items: InvoiceItem[], tax_rate: number): { subtotal: number; tax_amount: number; total: number } {
  const subtotal = items.reduce((acc, item) => acc + item.total_price, 0);
  const tax_amount = subtotal * tax_rate;
  const total = subtotal + tax_amount;
  return { subtotal, tax_amount, total };
}

// GET une facture par ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const invoices = await readData<Invoice>(invoicesFileName);
    const invoice = invoices.find(inv => inv.id === id);

    if (!invoice) {
      return NextResponse.json({ message: 'Facture non trouvée.' }, { status: 404 });
    }

    return NextResponse.json(invoice, { status: 200 });
  } catch (error) {
    console.error(`Erreur GET /api/invoices/${params.id}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la récupération de la facture.' }, { status: 500 });
  }
}

// PUT (Mettre à jour) une facture par ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updatedInvoiceData = invoiceUpdateSchema.parse(body); // Validation avec Zod

    const invoices = await readData<Invoice>(invoicesFileName);
    const invoiceIndex = invoices.findIndex(inv => inv.id === id);

    if (invoiceIndex === -1) {
      return NextResponse.json({ message: 'Facture non trouvée.' }, { status: 404 });
    }

    const currentInvoice = invoices[invoiceIndex];
    // Créer une nouvelle facture en fusionnant les données existantes et les mises à jour
    const newInvoice: Invoice = { ...currentInvoice, ...updatedInvoiceData, id: id };

    // Si client_id est mis à jour, vérifier son existence
    if (updatedInvoiceData.client_id && updatedInvoiceData.client_id !== currentInvoice.client_id) {
        const clients = await readData<Client>(clientsFileName);
        if (!clients.some(c => c.id === updatedInvoiceData.client_id)) {
            return NextResponse.json({ message: 'Nouveau client spécifié non trouvé.' }, { status: 400 });
        }
    }

    // Si quotation_id est mis à jour
    if (updatedInvoiceData.quotation_id !== undefined && updatedInvoiceData.quotation_id !== currentInvoice.quotation_id) {
        if (updatedInvoiceData.quotation_id) { // Si non nul
            const quotes = await readData<Quotation>(quotationsFileName);
            if (!quotes.some(q => q.id === updatedInvoiceData.quotation_id)) {
                return NextResponse.json({ message: 'Nouveau devis de référence (quotation_id) non trouvé.' }, { status: 400 });
            }
        }
    }

    // Si les éléments ou le taux de taxe sont mis à jour, recalculer le total
    if (updatedInvoiceData.items || updatedInvoiceData.tax_rate !== undefined) {
        const itemsToUse = updatedInvoiceData.items || currentInvoice.items;
        const taxRateToUse = updatedInvoiceData.tax_rate !== undefined ? updatedInvoiceData.tax_rate : currentInvoice.tax_rate;

        const materials = await readData<Material>(materialsFileName);
        for (const item of itemsToUse) {
            if (!materials.some(m => m.id === item.material_id)) {
                return NextResponse.json({ message: `Matériau avec l'ID ${item.material_id} non trouvé dans les éléments mis à jour.` }, { status: 400 });
            }
            // Recalculer total_price si quantity ou price_per_unit sont modifiés dans l'item
            if (Math.abs(item.total_price - (item.quantity * item.price_per_unit)) > 0.001) {
                return NextResponse.json({ message: `Le prix total pour l'élément ${item.material_id} est incorrect.` }, { status: 400 });
            }
        }
        const { subtotal, tax_amount, total } = calculateInvoiceTotals(itemsToUse, taxRateToUse);
        newInvoice.items = itemsToUse;
        newInvoice.subtotal = subtotal;
        newInvoice.tax_amount = tax_amount;
        newInvoice.total = total;
    }
    
    invoices[invoiceIndex] = newInvoice;
    await writeData<Invoice>(invoicesFileName, invoices);

    return NextResponse.json(newInvoice, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Erreur de validation', errors: error.errors }, { status: 400 });
    }
    console.error(`Erreur PUT /api/invoices/${params.id}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la mise à jour de la facture.' }, { status: 500 });
  }
}

// DELETE une facture par ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    let invoices = await readData<Invoice>(invoicesFileName);
    const initialLength = invoices.length;

    invoices = invoices.filter(inv => inv.id !== id);

    if (invoices.length === initialLength) {
      return NextResponse.json({ message: 'Facture non trouvée.' }, { status: 404 });
    }

    await writeData<Invoice>(invoicesFileName, invoices);

    return NextResponse.json({ message: 'Facture supprimée avec succès.' }, { status: 200 });
  } catch (error) {
    console.error(`Erreur DELETE /api/invoices/${params.id}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la suppression de la facture.' }, { status: 500 });
  }
}