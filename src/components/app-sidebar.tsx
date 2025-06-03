"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  LayoutDashboard	,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Hammer,
  Users,
  BarChart2,
  Settings,
  User,
  
  
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "ramus",
    email: "ramus@grafikirdc.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Nokidevis",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Nokidevis.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Nokidevis",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        
      ],
    },
    {
      title: "Devis",
      url: "/devis",
      icon: Bot,
      items: [
        {
          title: "Tous les devis",
          url: "/devis",
        },
        {
          title: "Ajouter un devis",
          url: "#",
        },
        
      ],
    },
    {
      title: "Materiaux",
      url: "/materiaux",
      icon: Hammer,
      items: [
        {
          title: "Tous les materiaux",
          url: "/materiaux",
        },
        {
          title: "Ajouter un materiau",
          url: "#",
        },
       
      ],
    },
    {
      title: "Clients",
      url: "/clients",
      icon: Users,
      items: [
        {
          title: "Tous les clients",
          url: "/clients",
        },
        {
          title: "Ajouter un client",
          url: "#",
        },
        
      ],
    },
     {
      title: "Compte",
      url: "/profile",
      icon: User,
      items: [
        
      ],
    },
    {
      title: "Factures",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Toutes les factures",
          url: "#",
        },
        {
          title: "Générer une facture",
          url: "#",
        },
      ],
    },
    {
      title: "Statistiques",
      url: "#",
      icon: BarChart2,
      items: [
        
      ],
    },
     {
      title: "Paramettre",
      url: "/paramettres",
      icon: Settings,
      items: [
        {
          title: "Général",
          url: "/paramettres",
        },
        {
          title: "Profile",
          url: "/profile",
        },
        
      ],
    },
  ],
  projects: [
    {
      name: "Clients",
      url: "#",
      icon: Users,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
