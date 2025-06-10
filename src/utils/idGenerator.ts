// src/utils/idGenerator.ts

// Fonction pour générer un ID unique
export const generateUniqueId = (prefix: string = ''): string => { // Ajoutez 'prefix: string = '''
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000); // Nombre aléatoire pour plus d'unicité
  return `${prefix}${timestamp}-${random}`; // Utilisez le préfixe
};