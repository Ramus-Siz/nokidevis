// src/stores/clientStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; 
import { Client, ClientStore } from '../types';
import { generateUniqueId } from '../utils/idGenerator';
import initialClients from '../data/clients.json';

const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clients: initialClients as Client[],

      addClient: (newClient) => {
        set((state) => ({
          clients: [...state.clients, { ...newClient, id: generateUniqueId() }],
        }));
      },

      getClientById: (id) => {
        return get().clients.find((c) => c.id === id);
      },

      updateClient: (updatedClient) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === updatedClient.id ? updatedClient : c
          ),
        }));
      },

      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        }));
      },
    }),
    {
      name: 'client-storage',
      storage: createJSONStorage(() => localStorage), 
      onRehydrateStorage: (state) => {
        console.log('Client store rehydrated');
      },
    }
  )
);

export default useClientStore;