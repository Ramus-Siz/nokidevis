// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Github, Mail as MailIcon } from "lucide-react"; // Renommé Mail en MailIcon pour éviter le conflit

// Pour la redirection après inscription/connexion
import Link from "next/link";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    // --- ICI, VOUS APPELLERIEZ VOTRE API D'INSCRIPTION ---
    // Exemple (pseudo-code) avec un backend/service d'authentification:
    try {
      // const response = await fetch('/api/auth/register', { // Ou Supabase, Firebase, etc.
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      //
      // if (!response.ok) {
      //   const data = await response.json();
      //   throw new Error(data.message || 'Erreur lors de l\'inscription');
      // }

      // const data = await response.json();
      // console.log("Inscription réussie:", data);

      // Pour l'exemple, simule une inscription réussie
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simule un délai réseau
      console.log("Inscription simulée réussie pour:", email);

      // Rediriger vers la page de connexion ou un tableau de bord
      // router.push('/login'); // Ou vers /dashboard
      alert("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } catch (err: any) {
      setError(err.message || "Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
    // --- FIN DE L'APPEL D'API ---
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Créer un compte</h1>
            <p className="text-gray-500">Inscrivez-vous pour commencer avec Nokidevis</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input
                type="email"
                id="email"
                placeholder="vous@example.com"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input
                type={showPassword ? "text" : "password"} // Utilise showPassword pour confirmer aussi
                id="confirm-password"
                placeholder="••••••••"
                value={confirmPassword}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Création du compte..." : "S'inscrire"}
            </Button>

            <div className="flex items-center justify-between space-x-2">
              <span className="text-sm text-muted-foreground">Déjà un compte ?</span>
              <Button variant="link" asChild>
                <Link href="/login" className="text-sm">
                  Se connecter
                </Link>
              </Button>
            </div>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou inscrivez-vous avec
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              <Github className="mr-2 h-4 w-4" /> Github
            </Button>
            <Button variant="outline" className="w-full">
              <MailIcon className="mr-2 h-4 w-4" /> Google
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}