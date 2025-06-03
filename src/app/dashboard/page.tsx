import { AppSidebar } from "@/components/app-sidebar"
import { StatCard } from "@/components/cards-dashboard";
import { FileText, Users } from "lucide-react";

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

export default function Page() {
  return (
     <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl relative border p-12 " >
              <StatCard
                  title="Devis validés"
                  count={42}
                  description="Total validés ce mois"
                  icon={FileText}
              />
            </div>
            <div className="bg-white rounded-xl aspect-video border p-4 shadow relative  p-12 " >
              <StatCard
                  title="Clients"
                  count={44}
                  description="Total Général"
                  icon={Users}
              />
            </div>
            <div className="bg-muted/50 aspect-video rounded-xl relative border p-12 " >
              <StatCard
                  title="Devis créé(s)"
                  count={57}
                  description="Total créé ce mois"
                  icon={FileText}
              />
            </div>
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </div>

  )
}
