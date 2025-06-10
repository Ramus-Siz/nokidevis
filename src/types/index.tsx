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

// src/types/index.ts (Ajoutez ces interfaces)

// Statuts possibles pour une facture
export type InvoiceStatus = 'émise' | 'payée' | 'partiellement payée' | 'annulée' | 'en retard';

// Interface pour un élément de facture (similaire à QuotationItem)
export interface InvoiceItem {
  material_id: string; // ID du matériau
  quantity: number;    // Quantité du matériau
  price_per_unit: number; // Prix unitaire au moment de la facturation
  total_price: number; // Prix total pour cette ligne (quantity * price_per_unit)
}

// Interface pour une facture
export interface Invoice {
  id: string;         // ID unique de la facture (ex: INV-001)
  quotation_id: string; // ID du devis à partir duquel la facture a été générée
  client_id: string;  // ID du client associé à la facture
  date: string;       // Date d'émission de la facture (format YYYY-MM-DD)
  items: InvoiceItem[]; // Liste des éléments de la facture
  total: number;      // Total de la facture
  status: InvoiceStatus; // Statut de la facture (émise, payée, etc.)
  // Vous pourriez ajouter d'autres champs comme:
  // payment_date?: string; // Date de paiement
  // due_date?: string;     // Date d'échéance
  // notes?: string;        // Notes additionnelles
}

// Interface pour le store des factures
export interface InvoiceStore {
  invoices: Invoice[];
  addInvoice: (newInvoice: Omit<Invoice, 'id' | 'total' | 'status'> & { total: number; status?: InvoiceStatus }) => void; // Total calculé à l'avance
  getInvoiceById: (id: string) => Invoice | undefined;
  updateInvoice: (updatedInvoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  updateInvoiceStatus: (id: string, newStatus: InvoiceStatus) => void;
  // Vous pourriez ajouter une fonction pour calculer le total si nécessaire
  // calculateInvoiceTotal: (items: InvoiceItem[]) => number;
}


export type QuotationStatus = 'brouillon' | 'en cours' | 'validé' | 'facturé'; 


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