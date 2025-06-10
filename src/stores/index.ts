// src/stores/index.ts
import useClientStore from './clientStore';
import useMaterialStore from './materialStore';
import useQuotationStore from './quotationStore';
import useInvoiceStore from './invoiceStore'; // Ajoutez cette ligne

export {
  useClientStore,
  useMaterialStore,
  useQuotationStore,
  useInvoiceStore, // Exportez le nouveau store
};