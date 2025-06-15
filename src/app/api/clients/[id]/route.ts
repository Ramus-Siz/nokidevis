// src/app/api/clients/[id]/route.ts
import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/fileDb';
import { Client } from '@/types';
import { z } from 'zod';

const clientUpdateSchema = z.object({
  name: z.string().min(1, "Le nom du client est requis.").optional(),
  contact: z.string().min(1, "Le nom du contact est requis.").optional(),
  email: z.string().email("Adresse email invalide.").optional(),
  phone: z.string().min(8, "Le numéro de téléphone doit être valide.").optional(),
  address: z.string().min(5, "L'adresse est requise.").optional(),
}).partial();

const clientsFileName = 'clients.json';

// GET un client par ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } =  await params;
    const clients = await readData<Client>(clientsFileName);
    const client = clients.find(c => c.id === id);

    if (!client) {
      return NextResponse.json({ message: 'Client non trouvé.' }, { status: 404 });
    }

    return NextResponse.json(client, { status: 200 });
  } catch (error) {
    console.error(`Erreur GET /api/clients/${params.id}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la récupération du client.' }, { status: 500 });
  }
}

// PUT (Mettre à jour) un client par ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updatedClientData = clientUpdateSchema.parse(body); // Validation avec Zod

    const clients = await readData<Client>(clientsFileName);
    const clientIndex = clients.findIndex(c => c.id === id);

    if (clientIndex === -1) {
      return NextResponse.json({ message: 'Client non trouvé.' }, { status: 404 });
    }

    const updatedClient: Client = { ...clients[clientIndex], ...updatedClientData, id: id };
    clients[clientIndex] = updatedClient;
    await writeData<Client>(clientsFileName, clients);

    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Erreur de validation', errors: error.errors }, { status: 400 });
    }
    console.error(`Erreur PUT /api/clients/${params.id}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la mise à jour du client.' }, { status: 500 });
  }
}

// DELETE un client par ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    let clients = await readData<Client>(clientsFileName);
    const initialLength = clients.length;

    clients = clients.filter(c => c.id !== id);

    if (clients.length === initialLength) {
      return NextResponse.json({ message: 'Client non trouvé.' }, { status: 404 });
    }

    await writeData<Client>(clientsFileName, clients);

    return NextResponse.json({ message: 'Client supprimé avec succès.' }, { status: 200 });
  } catch (error) {
    console.error(`Erreur DELETE /api/clients/${params.id}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la suppression du client.' }, { status: 500 });
  }
}