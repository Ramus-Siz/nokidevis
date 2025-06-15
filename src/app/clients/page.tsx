import ClientsTable from "@/components/clients/clientsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function ClientsPage() {
  return (
    <div className="flex flex-col min-h-[100vh] bg-gray-50 p-8"> {/* Utilisation de flex-col et bg-gray-50 */}
      <div className="container mx-auto px-4 py-8 bg-white rounded-lg shadow-lg border border-gray-200"> {/* Conteneur principal */}
        <div className="flex justify-between items-center mb-8"> {/* Flex pour aligner titre et bouton */}
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight"> {/* Titre plus grand et plus impactant */}
            Gérer les Clients
          </h1>
          <Link href="/clients/nouveau">
            <Button className="px-6 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 flex items-center justify-center shadow-md hover:shadow-lg"> {/* Bouton stylisé */}
              <Plus className="w-5 h-5 mr-2" /> {/* Icône plus grande */}
              Ajouter un Client
            </Button>
          </Link>
        </div>

        {/* Section de la table des clients */}
        <div className="mt-6"> 
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Liste Détaillée</h2>
          <ClientsTable />
        </div>
      </div>
    </div>
  );
}