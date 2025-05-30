"use client";
import { useState } from "react";
import {motion} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Github, Mail,  } from "lucide-react";

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="min-h-screen bg-gradiant-to-br from-primary-500 to-primary-100 flex items-center justify-center p-4">
      <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
      >
        <div className="bg-white rounded-xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Nokidevis</h1>
            <p className="text-gray-500">Entrez vos identifiants pour accéder à votre compte</p>
          </div>
          <form className="space-y-4">
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label htmlFor="remember" className="text-sm">
                Se souvenir de moi
              </label>
               </div>
              <a href="#" className="text-sm text-primary-500 hover:text-primary-600">
                Mot de passe oubliez ?
              </a>
             
            </div>
            <Button type="submit" className="w-full">
              Se connecter
            </Button>
            <div className="flex items-center justify-between space-x-2">
              <span className="text-sm text-muted-foreground">Nouveau sur Nokidevis ?</span>
              <Button variant="link" className="text-sm"> 
                S'inscrire
              </Button>
            </div>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou connectez-vous avec
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              <Github className="mr-2 h-4 w-4" /> Github
            </Button>
            <Button variant="outline" className="w-full">
              <Mail className="mr-2 h-4 w-4" /> Mail
            </Button>
          </div>

        </div>

      </motion.div>
        
    </div>
  );
}
