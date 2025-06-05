import DevisTable from "@/components/devisTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DevisPage() {
    return (
            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min p-8">
               <Button variant="outline" size="sm" className="flex items-center gap-2 mb-12">
      <Plus className="w-4 h-4" />
      Nouveau Devis
    </Button>
                    
                <h1 className="text-xl font-bold mb-4">Mes Devis</h1>
                <DevisTable />
            </div>
        );
}