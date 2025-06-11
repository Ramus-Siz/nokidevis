// src/app/profile/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react'; // Added useCallback
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, Upload } from 'lucide-react';
import Image from 'next/image';

// Import your global store and UserProfile type
import { useGlobalStore, UserProfile } from '@/stores/useGlobalStore';
import { userStore } from '@/stores/user';

// --- Configuration ---
// Default avatar path (ensure this file exists in your public folder, e.g., public/images/default-avatar.png)
const DEFAULT_AVATAR_PATH = '/images/default-avatar.png';

// Schéma de validation pour le profil utilisateur
const profileSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis."),
  email: z.string().email("Adresse email invalide."),
  phone: z.string().optional(),
  bio: z.string().max(200, "La bio ne doit pas dépasser 200 caractères.").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  // Global store states and actions
  const userProfile = useGlobalStore((state) => state.userProfile);
  const setUserProfile = useGlobalStore((state) => state.setUserProfile);
  const initializeUser = useGlobalStore((state) => state.initializeUser);

  // User store for initial data (simulated/fetched from backend)
  const userFromUserStore = userStore((state: any) => state.user);

  // Component local states
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false); // State to manage hydration

  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      bio: "",
    },
  });

  // Function to determine the correct image URL
  const getImageUrl = useCallback((profile: UserProfile | null, file: File | null) => {
    if (file) {
      // If a new file is selected, use its temporary URL
      return URL.createObjectURL(file);
    }
    if (profile?.logo && typeof profile.logo === 'string' && profile.logo.length > 0) {
      // If profile has a valid logo URL, use it
      return profile.logo;
    }
    // Otherwise, use the default avatar path
    return DEFAULT_AVATAR_PATH;
  }, []);

  // --- Hydration and Data Initialization Effect ---
  useEffect(() => {
    // This effect runs ONLY on the client after initial render/hydration
    setHasHydrated(true);

    let initialProfileData: UserProfile | null = null;

    if (userProfile) {
      // If userProfile exists in global store (possibly from persistence)
      initialProfileData = userProfile;
    } else if (userFromUserStore) {
      // If not in global store, try to fetch from userStore (simulated backend fetch)
      initialProfileData = {
        username: userFromUserStore.username || '',
        email: userFromUserStore.email || '',
        phone: userFromUserStore.phone || undefined,
        bio: userFromUserStore.bio || undefined,
        logo: userFromUserStore.logo || undefined,
      };
      // Initialize global store if data was fetched from userStore
      initializeUser(initialProfileData);
    }

    if (initialProfileData) {
      reset(initialProfileData); // Populate form
      // Set image preview URL based on profile data
      setImagePreviewUrl(getImageUrl(initialProfileData, null));
    } else {
      // No user data found, set a default avatar and ensure form is empty
      reset({ username: "", email: "", phone: "", bio: "" });
      setImagePreviewUrl(DEFAULT_AVATAR_PATH);
    }

    setIsLoading(false);

    // Cleanup for blob URLs created for preview
    return () => {
      // Clean up previous blob URL if it was created
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [userProfile, userFromUserStore, reset, initializeUser, getImageUrl]); // Added getImageUrl to dependencies

  // --- Handlers ---
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      // Immediately update preview to the new file's blob URL
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedImageFile(null);
      // Revert to the current user's logo or default if no file selected
      setImagePreviewUrl(getImageUrl(userProfile, null));
    }
  };

  // Simulate image upload to a backend service
  const uploadImageToBackend = async (file: File): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // In a real application, this would be an API call to upload the file
    // and your backend would return the permanent URL.
    // For demo, we'll return a blob URL or a static placeholder
    return URL.createObjectURL(file); // This is good for client-side demo
    // Or a static placeholder if you prefer:
    // return 'https://via.placeholder.com/150/0000FF/FFFFFF?text=New+Pic';
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    let newLogoUrl: string | undefined = userProfile?.logo; // Start with current logo

    if (selectedImageFile) {
      try {
        newLogoUrl = await uploadImageToBackend(selectedImageFile);
        toast.success("Photo de profil mise à jour avec succès !");
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to update profile picture.");
        setIsLoading(false);
        return; 
      }
    }

    // Construct the UserProfile object explicitly for clarity and type safety
    const updatedProfile: UserProfile = {
      username: data.username,
      email: data.email,
      phone: data.phone,
      bio: data.bio,
      logo: newLogoUrl, // Assign the (potentially new) logo URL
    };

    toast.success("Your profile has been updated successfully!");

    // Update the global Zustand store
    setUserProfile(updatedProfile);

    // After updating, ensure the preview URL reflects the (newly uploaded) permanent URL or the default
    setImagePreviewUrl(updatedProfile.logo || DEFAULT_AVATAR_PATH);

    setIsLoading(false);
    await new Promise((r) => setTimeout(r, 1000)); // Simulate backend save delay
  };

  // --- Conditional Rendering for Hydration/Loading ---
  // On the server, hasHydrated is false, so it renders the loading state.
  // On the client, hasHydrated becomes true after initial render, allowing full content.
  if (!hasHydrated || isLoading) {
    return (
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl p-8 flex justify-center items-center">
        <p>Chargement du profil...</p>
      </div>
    );
  }

  // If userProfile is null even after loading and hydration (e.g., not logged in)
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

      {/* Section Photo de Profil */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-lg group">
          {/* Always render Image using the safely derived imagePreviewUrl */}
          <Image
            src={imagePreviewUrl || DEFAULT_AVATAR_PATH} // Ensure src is never null/undefined
            alt="Photo de profil"
            fill // Use fill to make image cover the parent container
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Good practice for performance
            priority // Prioritize loading of the profile picture
            onError={(e) => {
              console.error("Next.js Image failed to load:", e.currentTarget.src);
              // Fallback to default if the image itself fails to load after a valid URL is passed
              setImagePreviewUrl(DEFAULT_AVATAR_PATH);
            }}
          />

          {/* Overlay for upload button */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*" // Accept only image files
          className="hidden"
          onChange={handleImageChange}
        />

        {/* Button to trigger file input */}
        <Button
            type="button" // Important: Prevent form submission
            variant="ghost"
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting || isLoading}
        >
            <Upload className="w-4 h-4 mr-2" />
            {selectedImageFile ? "Changer l'image" : "Ajouter une image"}
        </Button>
        {selectedImageFile && (
          <p className="text-sm text-gray-500 mt-2">Fichier sélectionné : {selectedImageFile.name}</p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl mx-auto">
        {/* Nom d'utilisateur */}
        <div>
          <Label htmlFor="username">Nom d'utilisateur</Label>
          <Input id="username" {...register("username")} disabled={isSubmitting || isLoading} />
          {errors.username && (
            <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} disabled /> {/* Email often not directly editable */}
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">L'adresse email ne peut pas être modifiée ici.</p>
        </div>

        {/* Téléphone */}
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" type="tel" {...register("phone")} disabled={isSubmitting || isLoading} />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="bio">Biographie</Label>
          <Textarea id="bio" {...register("bio")} rows={4} className="resize-y" disabled={isSubmitting || isLoading} />
          {errors.bio && (
            <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>
          )}
        </div>

        {/* Bouton de sauvegarde */}
        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isSubmitting || isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </div>
  );
}