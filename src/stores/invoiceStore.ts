// src/stores/invoiceStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Invoice, InvoiceStore, InvoiceItem, InvoiceStatus } from '../types'; // Importez InvoiceStatus
import { generateUniqueId } from '../utils/idGenerator'; // Utilisez votre utilitaire d'ID

// Vous pourriez charger des factures initiales d'un JSON si vous en avez
// import initialInvoices from '../data/invoices.json'; // Créez ce fichier si nécessaire

const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set, get) => ({
      invoices: [], // Commence avec un tableau vide, ou chargez initialInvoices as Invoice[]

      // Fonction pour ajouter une nouvelle facture
      addInvoice: (newInvoiceData) => {
        const newInvoice: Invoice = {
          ...newInvoiceData,
          id: generateUniqueId('FACT-'), // Générez un ID unique pour la facture (ex: INV-xxxx)
          status: newInvoiceData.status || 'émise', // Statut par défaut 'émise'
        };
        set((state) => ({
          invoices: [...state.invoices, newInvoice],
        }));
      },

      // Fonction pour obtenir une facture par son ID
      getInvoiceById: (id) => {
        return get().invoices.find((inv) => inv.id === id);
      },

      // Fonction pour mettre à jour une facture existante
      updateInvoice: (updatedInvoice) => {
        // Optionnel : recalculer le total si les items peuvent être modifiés après génération
        // const newTotal = get().calculateInvoiceTotal(updatedInvoice.items);
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === updatedInvoice.id ? { ...updatedInvoice /*, total: newTotal */ } : inv
          ),
        }));
      },

      // Fonction pour supprimer une facture
      deleteInvoice: (id) => {
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        }));
      },

      // Fonction pour mettre à jour le statut d'une facture
      updateInvoiceStatus: (id, newStatus: InvoiceStatus) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, status: newStatus } : inv
          ),
        }));
      },
    }),
    {
      name: 'invoice-storage', // Nom unique pour localStorage
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        console.log('Invoice store rehydrated');
      },
    }
  )
);

export default useInvoiceStore;