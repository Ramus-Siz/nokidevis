"use client";
import { useParams } from "next/navigation";

export default function FactureDetailPage() {
  const { id } = useParams();
  return (
     <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min p-8">

      <h1 className="text-xl font-bold mb-4">Détail de la facture {id}</h1>

    </div>
  );
  
}
