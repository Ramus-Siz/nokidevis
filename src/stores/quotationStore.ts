// src/stores/quotationStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // <--- Importez ici
import { Quotation, QuotationItem, QuotationStore, QuotationStatus } from '../types';
import { generateUniqueId } from '../utils/idGenerator';
import initialQuotations from '../data/quotations.json';

const useQuotationStore = create<QuotationStore>()(
  persist(
    (set, get) => ({
      quotations: initialQuotations as Quotation[],

      calculateQuotationTotal: (items) => {
        return items.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0);
      },

      addQuotation: (newQuotation) => {
        const total = get().calculateQuotationTotal(newQuotation.items);
        set((state) => ({
          quotations: [...state.quotations, { ...newQuotation, id: generateUniqueId(), total, status: 'brouillon' }],
        }));
      },

      getQuotationById: (id) => {
        return get().quotations.find((q) => q.id === id);
      },

      updateQuotation: (updatedQuotation) => {
        const total = get().calculateQuotationTotal(updatedQuotation.items);
        set((state) => ({
          quotations: state.quotations.map((q) =>
            q.id === updatedQuotation.id ? { ...updatedQuotation, total } : q
          ),
        }));
      },

      deleteQuotation: (id) => {
        set((state) => ({
          quotations: state.quotations.filter((q) => q.id !== id),
        }));
      },

      updateQuotationStatus: (id, newStatus) => {
        set((state) => ({
          quotations: state.quotations.map((q) =>
            q.id === id ? { ...q, status: newStatus } : q
          ),
        }));
      },
    }),
    {
      name: 'quotation-storage',
      storage: createJSONStorage(() => localStorage), // <--- Correction
      onRehydrateStorage: (state) => {
        console.log('Quotation store rehydrated');
      },
      // skipHydration: false,
    }
  )
);

export default useQuotationStore;