// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileText, Users, DollarSign, Loader2, FileWarning, Plus } from "lucide-react"; // Ajout de Loader2
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import de Card, CardContent, CardHeader, CardTitle de Shadcn/ui
import { Skeleton } from "@/components/ui/skeleton"; // Import de Skeleton de Shadcn/ui

import { StatCard } from "@/components/cards-dashboard"; // Assurez-vous que ce composant existe toujours
import DevisTable from "@/components/devis/devisTable";

// Import des types pour la typographie des données
import { Quotation, Client, Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { useClientStore } from '@/stores';
import { toast } from 'sonner';

// Composant SkeletonCard pour un meilleur effet de chargement
const SkeletonCard = () => (
  <Card className="aspect-video p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between pb-2 px-0 pt-0">
      <Skeleton className="h-6 w-3/5" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </CardHeader>
    <CardContent className="px-0 pb-0">
      <Skeleton className="h-10 w-1/2 mb-2" />
      <Skeleton className="h-4 w-4/5" />
    </CardContent>
  </Card>
);


export default function DashboardPage() {
  const [totalQuotations, setTotalQuotations] = useState(0);
  const [acceptedQuotations, setAcceptedQuotations] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const setClients = useClientStore((state: { setClients: any; }) => state.setClients);
    const [loadingClients, setLoadingClients] = useState(true);
    const [clientLoadError, setClientLoadError] = useState<string | null>(null);
  
   

  useEffect(() => {
    async function fetchData() {
      try {
        const [quotationsRes, clientsRes, invoicesRes] = await Promise.all([
          fetch('/api/quotations'),
          fetch('/api/clients'),
          fetch('/api/invoices'),
        ]);

        if (!quotationsRes.ok) throw new Error(`Devis: ${quotationsRes.statusText}`);
        if (!clientsRes.ok) throw new Error(`Clients: ${clientsRes.statusText}`);
        if (!invoicesRes.ok) throw new Error(`Factures: ${invoicesRes.statusText}`);

        const quotations: Quotation[] = await quotationsRes.json();
        const clients: Client[] = await clientsRes.json();
        const invoices: Invoice[] = await invoicesRes.json();

        setClients(clients);
        setTotalQuotations(quotations.length);
        setAcceptedQuotations(quotations.filter(q => q.status === 'accepted').length);
        setTotalClients(clients.length);
        setTotalInvoices(invoices.length);

      } catch (err: any) {
        console.error("Échec de la récupération des données du dashboard:", err);
        setClientLoadError(err.message || "Erreur inconnue lors du chargement des clients.");
        toast.error(`Échec du chargement des clients: ${err.message || 'Vérifiez la console.'}`);
        setError(`Échec du chargement des données: ${err.message || 'Erreur inconnue'}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 lg:p-10"> {/* Plus d'espacement général */}
      {/* Fil d'Ariane */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Accueil</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-foreground">Tableau de bord</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Separator className="my-4" /> {/* Séparateur plus visible */}

      {/* Titre du tableau de bord */}
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl">
        Aperçu Général
      </h1>

      {/* Cartes de statistiques */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"> {/* Ajustement des colonnes pour la réactivité */}
        {loading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : error ? (
          <div className="col-span-full text-center p-4 text-red-500 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-semibold">Erreur de chargement des données :</p>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Carte des Devis validés */}
            <Link href="/devis" className="block"> {/* Utiliser block pour que le lien englobe toute la carte */}
              <Card className="p-6 flex flex-col justify-between h-full bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg hover:border-green-300 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 px-0 pt-0">
                  <CardTitle className="text-sm font-medium text-gray-700">Devis validés</CardTitle>
                  <FileText className="h-6 w-6 text-green-600" />
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <div className="text-4xl font-bold text-green-800">{acceptedQuotations}</div>
                  <p className="text-xs text-gray-500">Total validés</p>
                </CardContent>
              </Card>
            </Link>

            {/* Carte des Clients */}
            <Link href="/clients" className="block">
              <Card className="p-6 flex flex-col justify-between h-full bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 px-0 pt-0">
                  <CardTitle className="text-sm font-medium text-gray-700">Clients</CardTitle>
                  <Users className="h-6 w-6 text-blue-600" />
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <div className="text-4xl font-bold text-blue-800">{totalClients}</div>
                  <p className="text-xs text-gray-500">Total général</p>
                </CardContent>
              </Card>
            </Link>

            {/* Carte des Devis créés */}
            <Link href="/devis" className="block">
              <Card className="p-6 flex flex-col justify-between h-full bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg hover:border-purple-300 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 px-0 pt-0">
                  <CardTitle className="text-sm font-medium text-gray-700">Devis créé(s)</CardTitle>
                  <FileText className="h-6 w-6 text-purple-600" />
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <div className="text-4xl font-bold text-purple-800">{totalQuotations}</div>
                  <p className="text-xs text-gray-500">Total général</p>
                </CardContent>
              </Card>
            </Link>

            {/* Nouvelle Carte des Factures */}
            <Link href="/invoices" className="block">
              <Card className="p-6 flex flex-col justify-between h-full bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg hover:border-orange-300 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 px-0 pt-0">
                  <CardTitle className="text-sm font-medium text-gray-700">Factures</CardTitle>
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <div className="text-4xl font-bold text-orange-800">{totalInvoices}</div>
                  <p className="text-xs text-gray-500">Total général</p>
                </CardContent>
              </Card>
            </Link>
          </>
        )}
      </div>

      {/* Section du tableau des devis (Liste des devis récents, par exemple) */}
      <Card className="flex-1 min-h-[400px] p-6"> {/* Utilisation de Card pour cette section aussi */}
        <CardHeader className="pb-4 px-0 pt-0">
          <CardTitle className="text-2xl font-bold text-gray-800">Devis Récents</CardTitle>
          <p className="text-sm text-muted-foreground">Aperçu de vos derniers devis.</p>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <DevisTable /> {/* Ce composant devrait gérer son propre chargement/affichage des données */}
        </CardContent>
      </Card>
    </div>
  );
}