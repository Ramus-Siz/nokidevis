// src/app/settings/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Importe votre store global
import { useGlobalStore, Theme } from '@/stores/useGlobalStore'; 

export default function SettingsPage() {
  // Récupère les états et les actions du store
  const theme = useGlobalStore((state) => state.theme);
  const setTheme = useGlobalStore((state) => state.setTheme);
  const language = useGlobalStore((state) => state.language);
  const setLanguage = useGlobalStore((state) => state.setLanguage);
  const receiveNotifications = useGlobalStore((state) => state.receiveNotifications);
  const setReceiveNotifications = useGlobalStore((state) => state.setReceiveNotifications);

  const handleSaveSettings = () => {
    // Les changements sont déjà appliqués directement via les actions du store
    // Ici, vous pourriez avoir une logique supplémentaire si nécessaire,
    // comme un envoi au backend pour des paramètres utilisateur persistants côté serveur.
    toast.success("Paramètres enregistrés avec succès !");
  };

  return (
    <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl p-8">
      <h1 className="text-3xl font-bold mb-8">Paramètres Généraux</h1>

      <div className="space-y-8 max-w-2xl">
        {/* Section Notifications */}
        <div className="flex items-center justify-between p-4 border rounded-md">
          <Label htmlFor="notifications" className="text-lg">Recevoir les notifications</Label>
          <Switch
            id="notifications"
            checked={receiveNotifications}
            onCheckedChange={setReceiveNotifications} // Met à jour l'état du store
          />
        </div>

        {/* Section Thème */}
        <div className="p-4 border rounded-md">
          <Label htmlFor="theme" className="text-lg mb-2 block">Thème de l'application</Label>
          <Input
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)} // Met à jour l'état du store
            placeholder="light, dark, system..."
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-2">
            (Pour une implémentation réelle, utilisez des radios ou un select pour choisir entre 'light', 'dark', 'system')
          </p>
        </div>

        {/* Section Langue */}
        <div className="p-4 border rounded-md">
          <Label htmlFor="language" className="text-lg mb-2 block">Langue de l'application</Label>
          <Input
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)} // Met à jour l'état du store
            placeholder="fr, en..."
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-2">
            (Similaire au thème, un composant de sélection serait plus adapté)
          </p>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSaveSettings}>Enregistrer les paramètres</Button>
        </div>
      </div>
    </div>
  );
}