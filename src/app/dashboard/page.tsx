import { AppSidebar } from "@/components/app-sidebar"
import { StatCard } from "@/components/cards-dashboard";
import { FileText, Users } from "lucide-react";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import DevisTable from "@/components/devisTable";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Link href="/devis">
          <div className="bg-muted/50 aspect-video rounded-xl relative border p-8 hover:shadow-md transition">
            <StatCard
              title="Devis validés"
              count={42}
              description="Total validés ce mois"
              icon={FileText}
            />
          </div>
        </Link>

        <Link href="/clients">
          <div className="bg-white rounded-xl aspect-video border p-8 shadow relative hover:shadow-md transition">
            <StatCard
              title="Clients"
              count={44}
              description="Total Général"
              icon={Users}
            />
          </div>
        </Link>

        <Link href="/devis">
          <div className="bg-muted/50 aspect-video rounded-xl relative border p-8 hover:shadow-md transition">
            <StatCard
              title="Devis créé(s)"
              count={57}
              description="Total créé ce mois"
              icon={FileText}
            />
          </div>
        </Link>
      </div>

      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min p-8">
        <h1 className="text-xl font-bold mb-4">Mes Devis</h1>
        <DevisTable />
      </div>
    </div>
  );
}
