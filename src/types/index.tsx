// src/types/index.ts

import { DefaultSession, DefaultUser } from "next-auth";

// ============== Authentification et Utilisateurs ==============
export type UserRole = 'admin' | 'employee' | 'viewer'; // 'user' renommé en 'employee' pour plus de clarté
export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; 
  role: UserRole;
  created_at?: string; 
  updated_at?: string; 
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    username: string;
    email: string;
    role: UserRole;
  }
}

// ============== Matériaux ==============
export interface Material {
  id: string;
  name: string;
  unit: string;
  price_per_unit: number;
}

// ============== Clients ==============
export interface Client {
  id: string;
  name: string;
  contact: string; // Nom de la personne contact
  email: string;
  phone: string;
  address: string; 
}

// ============== Devis (Quotations) ==============
export interface QuotationItem {
  material_id: string;
  quantity: number;
  price_per_unit: number; 
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'invoiced'; // 'facturé' renommé en 'invoiced'
export interface Quotation {
  id: string;
  quotationNumber: string; // Nouveau: numéro de devis (ex: DEV-2025-001)
  client_id: string;
  date: string; // Format 'YYYY-MM-DD'
  expiry_date: string; // Date de validité du devis
  items: QuotationItem[];
  subtotal: number; // Somme des (quantity * price_per_unit)
  tax_rate: number; // Taux de TVA (ex: 0.18 pour 18%)
  tax_amount: number; // Montant de la TVA
  total_amount: number;
  total: number; // subtotal + tax_amount
  status: QuotationStatus;
  notes?: string;
  created_by?: string; // ID de l'utilisateur qui a créé le devis
}

// ============== Factures (Invoices) ==============
// src/types/index.ts

// ... (your other interfaces and types) ...

// ============== Factures (Invoices) ==============
export interface InvoiceItem {
  material_id: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
}

export type InvoiceStatus = 'pending' | 'paid' | 'partially_paid' | 'cancelled' | 'overdue';
export interface Invoice {
  id: string;
  invoiceNumber: string;
  quotation_id?: string | null; // Already fixed this one!
  client_id: string;
  date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: InvoiceStatus;
  notes?: string;
  created_by?: string;
  payment_date?: string | null; // <-- MODIFICATION ICI : Ajoutez '| null'
}



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
  addQuotation: (newQuotation: Omit<Quotation, 'id' | 'subtotal' | 'tax_amount' | 'total' | 'status'>) => void;
  getQuotationById: (id: string) => Quotation | undefined;
  updateQuotation: (updatedQuotation: Quotation) => void;
  deleteQuotation: (id: string) => void;
  updateQuotationStatus: (id: string, newStatus: QuotationStatus) => void;
}

export interface InvoiceStore {
  invoices: Invoice[];
  addInvoice: (newInvoice: Omit<Invoice, 'id' | 'subtotal' | 'tax_amount' | 'total' | 'status'>) => void;
  getInvoiceById: (id: string) => Invoice | undefined;
  updateInvoice: (updatedInvoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  updateInvoiceStatus: (id: string, newStatus: InvoiceStatus) => void;
}