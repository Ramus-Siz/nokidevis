// src/stores/quotationStore.ts
import { create } from 'zustand';
import { produce } from 'immer'; // Make sure immer is installed
import { Quotation, QuotationStatus, QuotationItem } from '@/types'; // <--- IMPORT FROM YOUR CENTRAL TYPES FILE

// Remove the duplicate type definitions from here:
// type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'invoiced';
// export interface QuotationItem { /* ... */ }
// export interface Quotation { /* ... */ }


export interface QuotationState {
  quotations: Quotation[];
  // Actions
  setQuotations: (quotations: Quotation[]) => void;
  addQuotation: (quotation: Quotation) => void;
  updateQuotation: (updatedQuotation: Quotation) => void;
  updateQuotationStatus: (id: string, newStatus: QuotationStatus) => void;
  deleteQuotation: (id: string) => void;
  getQuotationById: (id: string) => Quotation | undefined;
}

export const useQuotationStore = create<QuotationState>((set, get) => ({
  quotations: [],

  setQuotations: (quotations) => set({ quotations }),

  addQuotation: (quotation) =>
    set(produce((state: QuotationState) => {
      state.quotations.push(quotation);
    })),

  updateQuotation: (updatedQuotation) =>
    set(produce((state: QuotationState) => {
      const index = state.quotations.findIndex(q => q.id === updatedQuotation.id);
      if (index !== -1) {
        state.quotations[index] = updatedQuotation;
      }
    })),

  updateQuotationStatus: (id, newStatus) =>
    set(produce((state: QuotationState) => {
      const quotation = state.quotations.find(q => q.id === id);
      if (quotation) {
        quotation.status = newStatus;
      }
    })),

  deleteQuotation: (id) =>
    set(produce((state: QuotationState) => {
      state.quotations = state.quotations.filter(q => q.id !== id);
    })),

  getQuotationById: (id) => {
    return get().quotations.find(quotation => quotation.id === id);
  },
}));