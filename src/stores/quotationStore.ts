// src/stores/useQuotationStore.ts
import { create } from 'zustand';
import type { Quotation } from '@/types';

// AJOUTEZ 'export' ICI
export interface QuotationState {
  quotations: Quotation[];
  setQuotations: (newQuotations: Quotation[]) => void;
  addQuotation: (quotation: Quotation) => void;
  updateQuotation: (id: string, updatedQuotation: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
}

export const useQuotationStore = create<QuotationState>((set) => ({
  quotations: [],
  setQuotations: (newQuotations) => set({ quotations: newQuotations }),
  addQuotation: (quotation) => set((state: QuotationState) => ({ quotations: [...state.quotations, quotation] })),
  updateQuotation: (id, updatedQuotation) =>
    set((state: QuotationState) => ({
      quotations: state.quotations.map((q) => (q.id === id ? { ...q, ...updatedQuotation } : q)),
    })),
  deleteQuotation: (id) => set((state: QuotationState) => ({ quotations: state.quotations.filter((q) => q.id !== id) })),
}));