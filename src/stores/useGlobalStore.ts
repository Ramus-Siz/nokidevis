// src/stores/useGlobalStore.ts
import { toast } from 'sonner';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// --- Types pour le store global ---
// Définit les types de thème possibles
export type Theme = 'light' | 'dark' | 'system';

// Définit la structure des informations utilisateur de base
export interface UserProfile {
  username: string;
  email: string;
  phone?: string | ""; // Le numéro de téléphone est optionnel
  bio?: string | ""; // La biographie est optionnelle
  logo?:string | ""
}

// Définit l'interface de l'état global du store
interface GlobalState {
  // Paramètres de l'application
  theme: Theme;
  language: string; // Ex: 'fr', 'en'
  receiveNotifications: boolean;

  // Informations utilisateur (pour un exemple simple, à remplacer par un store utilisateur dédié si plus complexe)
  userProfile: UserProfile | null;
  isAuthenticated: boolean; // Pour savoir si un utilisateur est connecté

  // Actions pour modifier l'état
  setTheme: (theme: Theme) => void;
  setLanguage: (language: string) => void;
  setReceiveNotifications: (receive: boolean) => void;
  
  setUserProfile: (profile: UserProfile | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;

  // Initialisation des données de l'utilisateur (utile pour simuler une connexion)
  initializeUser: (user: UserProfile) => void;
  clearUser: () => void;
}

// --- Création du store ---
export const useGlobalStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      // --- États initiaux ---
      theme: 'system', // Thème par défaut
      language: 'fr',  // Langue par défaut
      receiveNotifications: true, 
      userProfile: null,
      isAuthenticated: false, 

      // --- Actions (fonctions pour modifier l'état) ---
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setReceiveNotifications: (receiveNotifications) => set({ receiveNotifications }),

      setUserProfile: (userProfile) => set({ userProfile }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      initializeUser: (user) => {
        set({
          userProfile: user,
          isAuthenticated: true,
        });
        toast.success(`Bienvenue, ${user.username}!`); // Exemple de notification à la connexion
      },

      clearUser: () => {
        set({
          userProfile: null,
          isAuthenticated: false,
        });
        toast.info("Vous avez été déconnecté."); // Exemple de notification à la déconnexion
      },
    }),
    {
      name: 'global-settings-storage', // Nom unique pour le localStorage
      storage: createJSONStorage(() => localStorage), // Utilise localStorage pour la persistance
      partialize: (state) => ({ // Définit quelle partie du store doit être persistée
        theme: state.theme,
        language: state.language,
        receiveNotifications: state.receiveNotifications,
        // userProfile et isAuthenticated ne sont généralement pas persistés directement dans localStorage pour la sécurité
        // mais gérés via des tokens d'authentification ou des sessions.
        // Pour une démo simple, on pourrait les persister, mais ce n'est pas la meilleure pratique.
      }),
      onRehydrateStorage: (state) => {
        console.log('Global store rehydraté');
        // Optionnel: callback après la réhydratation
        // if (state?.isAuthenticated) {
        //   toast.info("Bienvenue de retour !");
        // }
      },
    }
  )
);