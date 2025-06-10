"use client";

import MateriauxTable from "@/components/materiaux/materiauxTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function MateriauxPage() {
     

  return (
    <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min p-8">
      <div className="mb-12">
        <Link href="/materiaux/nouveau">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouveau matériaux
          </Button>
        </Link>
      </div>

      <h1 className="text-xl font-bold mb-4">Liste de matériaux</h1>
      <MateriauxTable />
    </div>
  );
}
