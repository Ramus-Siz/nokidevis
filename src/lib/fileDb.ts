// src/lib/fileDb.ts (créez ce fichier si ce n'est pas déjà fait)
import fs from 'fs/promises';
import path from 'path';

// Fonction générique pour lire des données d'un fichier JSON
export async function readData<T>(fileName: string): Promise<T[]> {
  const filePath = path.join(process.cwd(), 'src', 'data', fileName);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    // Vérifier si le fichier est vide ou contient des données non JSON valides
    if (data.trim() === '') {
      return [];
    }
    return JSON.parse(data) as T[];
  } catch (error: any) {
    if (error.code === 'ENOENT') { // File not found
      console.warn(`Le fichier ${fileName} n'existe pas. Création avec un tableau vide.`);
      await fs.writeFile(filePath, '[]', 'utf-8'); // Crée le fichier vide
      return [];
    }
    console.error(`Erreur lors de la lecture de ${fileName}:`, error);
    throw new Error(`Impossible de lire les données depuis ${fileName}.`);
  }
}

// Fonction générique pour écrire des données dans un fichier JSON
export async function writeData<T>(fileName: string, data: T[]): Promise<void> {
  const filePath = path.join(process.cwd(), 'src', 'data', fileName);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Erreur lors de l'écriture dans ${fileName}:`, error);
    throw new Error(`Impossible d'écrire les données dans ${fileName}.`);
  }
}