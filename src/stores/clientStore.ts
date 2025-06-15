// src/stores/clientStore.ts
import { create } from 'zustand';
import { produce } from 'immer'; // If you use Immer

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  // Add other client properties as per your definition
}

export interface ClientState {
  clients: Client[];
  // Actions
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (updatedClient: Client) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined; // New
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [], // Initialize with an empty array

  setClients: (clients) => set({ clients }),

  addClient: (client) =>
    set(produce((state: ClientState) => {
      state.clients.push(client);
    })),

  updateClient: (updatedClient) =>
    set(produce((state: ClientState) => {
      const index = state.clients.findIndex(c => c.id === updatedClient.id);
      if (index !== -1) {
        state.clients[index] = updatedClient;
      }
    })),

  deleteClient: (id) =>
    set(produce((state: ClientState) => {
      state.clients = state.clients.filter(c => c.id !== id);
    })),

  // New action: Get a client by ID
  getClientById: (id) => {
    return get().clients.find(client => client.id === id);
  },
}));