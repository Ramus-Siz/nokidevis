// src/app/api/clients/route.ts
import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/fileDb';
import { Client } from '@/types';
import { generateUniqueId } from '@/utils/idGenerator';
import { z } from 'zod';

const clientSchema = z.object({
  name: z.string().min(1, "Le nom du client est requis."),
  contact: z.string().min(1, "Le nom du contact est requis."),
  email: z.string().email("Adresse email invalide."),
  phone: z.string().min(8, "Le numéro de téléphone est requis et doit être valide."), // Ajout de validation simple pour le téléphone
  address: z.string().min(5, "L'adresse est requise."),
});

const clientsFileName = 'clients.json';

// GET tous les clients
export async function GET() {
  try {
    const clients = await readData<Client>(clientsFileName);
    return NextResponse.json(clients, { status: 200 });
  } catch (error) {
    console.error('Erreur GET /api/clients:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la récupération des clients.' }, { status: 500 });
  }
}

// POST un nouveau client
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newClientData = clientSchema.parse(body); // Validation avec Zod

    const clients = await readData<Client>(clientsFileName);

    const newClient: Client = {
      id: generateUniqueId('cli-'),
      ...newClientData,
    };

    clients.push(newClient);
    await writeData<Client>(clientsFileName, clients);

    return NextResponse.json(newClient, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Erreur de validation', errors: error.errors }, { status: 400 });
    }
    console.error('Erreur POST /api/clients:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de l\'ajout du client.' }, { status: 500 });
  }
}