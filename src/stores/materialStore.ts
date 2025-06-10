// src/stores/materialStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // <--- Importez ici
import { Material, MaterialStore } from '../types';
import { generateUniqueId } from '../utils/idGenerator';
import initialMaterials from '../data/materiels.json';

const useMaterialStore = create<MaterialStore>()(
  persist(
    (set, get) => ({
      materials: initialMaterials as Material[],

      addMaterial: (newMaterial) => {
        set((state) => ({
          materials: [...state.materials, { ...newMaterial, id: generateUniqueId() }],
        }));
      },

      getMaterialById: (id) => {
        return get().materials.find((m) => m.id === id);
      },

      updateMaterial: (updatedMaterial) => {
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === updatedMaterial.id ? updatedMaterial : m
          ),
        }));
      },

      deleteMaterial: (id) => {
        set((state) => ({
          materials: state.materials.filter((m) => m.id !== id),
        }));
      },
    }),
    {
      name: 'material-storage',
      storage: createJSONStorage(() => localStorage), // <--- Correction
      onRehydrateStorage: (state) => {
        console.log('Material store rehydrated');
      },
      // skipHydration: false,
    }
  )
);

export default useMaterialStore;