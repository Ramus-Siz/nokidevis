// src/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

// Importe votre store global et le type UserProfile
import { useGlobalStore, UserProfile } from '@/stores/useGlobalStore';
import { userStore } from '@/stores/user';

// Schéma de validation pour le profil utilisateur
const profileSchema = z.object({
  // CHANGEMENT ICI: Utilise firstName et lastName
  username: z.string().min(1, "Le nom est requis."),
  email: z.string().email("Adresse email invalide."),
  phone: z.string().optional(),
  bio: z.string().max(200, "La bio ne doit pas dépasser 200 caractères.").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const userProfile = useGlobalStore((state) => state.userProfile);
  const setUserProfile = useGlobalStore((state) => state.setUserProfile);
  const initializeUser = useGlobalStore((state) => state.initializeUser);
  const user=userStore((state:any)=>state.user)

  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "", // CHANGEMENT ICI
      email: "",
      phone: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (!userProfile) {
      const fetchUserProfile = async () => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        const fetchedUserData: UserProfile = {
          username: user.username,
          email: user.email,
          phone: user.phone,
          bio: user.bio
        };
        initializeUser(fetchedUserData);
        reset(fetchedUserData);
        setIsLoading(false);
      };
      fetchUserProfile();
    } else {
      reset(userProfile);
      setIsLoading(false);
    }
  }, [userProfile, reset, initializeUser]);

  const onSubmit = async (data: ProfileFormValues) => {
    console.log("Profil mis à jour à envoyer au backend:", data);
    toast.success("Votre profil a été mis à jour avec succès !");

    // L'argument 'data' correspond maintenant directement au type UserProfile
    setUserProfile(data); // Cette ligne ne devrait plus avoir d'erreur

    await new Promise((r) => setTimeout(r, 1000));
  };

  if (isLoading) {
    return (
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl p-8 flex justify-center items-center">
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl p-8 flex justify-center items-center">
        <p>Aucun profil utilisateur trouvé. Veuillez vous connecter.</p>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl p-8">
      <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
        {/* Prénom */}
        <div>
          <Label htmlFor="firstName">Prénom</Label>
          <Input id="firstName" {...register("username")} />
          {errors.username && (
            <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
          )}
        </div>

        

        {/* Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} disabled />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">L'adresse email ne peut pas être modifiée ici.</p>
        </div>

        {/* Téléphone */}
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" type="tel" {...register("phone")} />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="bio">Biographie</Label>
          <Textarea id="bio" {...register("bio")} rows={4} className="resize-y" />
          {errors.bio && (
            <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>
          )}
        </div>

        {/* Bouton de sauvegarde */}
        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </div>
  );
}