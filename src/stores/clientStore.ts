// src/stores/useClientStore.ts
import { create } from 'zustand';
import type { Client } from '@/types';

// AJOUTEZ 'export' ICI
export interface ClientState {
  clients: Client[];
  setClients: (newClients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, updatedClient: Partial<Client>) => void;
  deleteClient: (id: string) => void;
}

export const useClientStore = create<ClientState>((set) => ({
  clients: [],
  setClients: (newClients) => set({ clients: newClients }),
  addClient: (client) => set((state: ClientState) => ({ clients: [...state.clients, client] })),
  updateClient: (id, updatedClient) =>
    set((state: ClientState) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...updatedClient } : c)),
    })),
  deleteClient: (id) => set((state: ClientState) => ({ clients: state.clients.filter((c) => c.id !== id) })),
}));