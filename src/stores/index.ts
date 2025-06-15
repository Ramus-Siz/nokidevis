// src/stores/index.ts
import {useClientStore, ClientState} from './clientStore';
import useMaterialStore from './materialStore';
import {useQuotationStore, QuotationState} from './quotationStore';
import useInvoiceStore from './invoiceStore'; // Ajoutez cette ligne

export {
  useClientStore,
  useMaterialStore,
  useQuotationStore,
  useInvoiceStore
};
export type {
    ClientState ,
    QuotationState// Exportez le nouveau store
  };
