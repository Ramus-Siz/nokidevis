// src/types/index.ts

export interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  price_per_unit: number;
}

export interface QuotationItem {
  material_id: string;
  quantity: number;
  price_per_unit: number; // Peut différer du prix du matériau, ex: remise
}

// Définition des statuts possibles
export type QuotationStatus = 'brouillon' | 'en cours' | 'validé';

export interface Quotation {
  id: string;
  client_id: string;
  date: string; // Format 'YYYY-MM-DD'
  items: QuotationItem[];
  total: number;
  status: QuotationStatus; // Ajout du statut
}

// Interfaces pour les fonctions CRUD dans les stores (inchangées car le statut est géré dans l'objet Quotation)
export interface ClientStore {
  clients: Client[];
  addClient: (newClient: Omit<Client, 'id'>) => void;
  getClientById: (id: string) => Client | undefined;
  updateClient: (updatedClient: Client) => void;
  deleteClient: (id: string) => void;
}

export interface MaterialStore {
  materials: Material[];
  addMaterial: (newMaterial: Omit<Material, 'id'>) => void;
  getMaterialById: (id: string) => Material | undefined;
  updateMaterial: (updatedMaterial: Material) => void;
  deleteMaterial: (id: string) => void;
}

export interface QuotationStore {
  quotations: Quotation[];
  // Lors de l'ajout, le statut sera 'brouillon' par défaut
  addQuotation: (newQuotation: Omit<Quotation, 'id' | 'total' | 'status'>) => void;
  getQuotationById: (id: string) => Quotation | undefined;
  updateQuotation: (updatedQuotation: Quotation) => void;
  deleteQuotation: (id: string) => void;
  // Optionnel: pour le calcul interne
  calculateQuotationTotal: (items: QuotationItem[]) => number;
  // Nouvelle fonction pour mettre à jour le statut spécifiquement
  updateQuotationStatus: (id: string, newStatus: QuotationStatus) => void;
}