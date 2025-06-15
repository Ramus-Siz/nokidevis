"use client";

import { useEffect, useState } from "react";
import DevisTable from "@/components/devis/devisTable";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, FileWarning } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useClientStore } from "@/stores";
import type { Client } from "@/types";

export default function DevisPage() {
  const setClients = useClientStore((state: { setClients: any; }) => state.setClients);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientLoadError, setClientLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndSetClients = async () => {
      setLoadingClients(true);
      setClientLoadError(null);
      try {
        const res = await fetch('/api/clients'); // Your API endpoint for clients
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Erreur lors du chargement des clients: ${res.statusText}`);
        }
        const fetchedClients: Client[] = await res.json();
        setClients(fetchedClients);
        console.log("✅ Clients chargés dans le store depuis DevisPage:", fetchedClients);
      } catch (error: any) {
        console.error("❌ Erreur lors du chargement des clients:", error);
        setClientLoadError(error.message || "Erreur inconnue lors du chargement des clients.");
        toast.error(`Échec du chargement des clients: ${error.message || 'Vérifiez la console.'}`);
      } finally {
        setLoadingClients(false);
      }
    };

    fetchAndSetClients();
  }, [setClients]);

  if (loadingClients) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] bg-background p-8 rounded-lg">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-4" />
        <p className="text-lg text-gray-700 font-medium">Chargement des données clients...</p>
        <p className="text-sm text-gray-500 mt-2">Veuillez patienter pendant que nous récupérons les informations.</p>
      </div>
    );
  }

  if (clientLoadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] bg-red-50 p-8 rounded-lg border border-red-200 text-center">
        <FileWarning className="h-16 w-16 text-red-600 mb-4" />
        <h2 className="text-2xl font-bold text-red-800 mb-3">Oups ! Une erreur est survenue.</h2>
        <p className="text-md text-red-700 mb-6 max-w-lg">
          {clientLoadError}. Nous n'avons pas pu charger les clients.
          Veuillez vérifier votre connexion ou réessayer.
        </p>
        <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Réessayer
        </Button>
      </div>
    );
  }

  // --- Fin des améliorations des états ---

  return (
    <div className="bg-background min-h-screen p-8 sm:p-6 md:p-8 lg:p-10 flex flex-col items-center">
      <div className="w-full max-w-7xl"> {/* Max width for content */}
        <div className="flex justify-between items-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Mes Devis</h1>
          <Link href="/devis/nouveau">
            <Button className="flex items-center gap-2 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="w-5 h-5" />
              Nouveau Devis
            </Button>
          </Link>
        </div>

        {/* The DevisTable component will only render once clients are loaded */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
          <DevisTable />
        </div>
      </div>
    </div>
  );
}