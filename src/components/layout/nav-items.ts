import {
  BarChart3,
  Bell,
  FileText,
  History,
  LayoutDashboard,
  MonitorSmartphone,
  UserCheck,
  UserCog,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Réservé aux administrateurs. */
  adminSeulement?: boolean;
}

export interface NavGroup {
  titre: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    titre: "Pilotage",
    items: [
      { href: "/tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard },
      { href: "/statistiques", label: "Statistiques", icon: BarChart3 },
      { href: "/rapports", label: "Rapports", icon: FileText },
    ],
  },
  {
    titre: "Gestion des accès",
    items: [
      { href: "/acces/personnel", label: "Personnel", icon: UserCheck },
      { href: "/acces/visiteurs", label: "Étudiants & visiteurs", icon: Users },
      { href: "/historique", label: "Historique", icon: History },
    ],
  },
  {
    titre: "Informatique",
    items: [
      { href: "/interventions", label: "Interventions", icon: Wrench },
      { href: "/equipements", label: "Équipements", icon: MonitorSmartphone },
    ],
  },
  {
    titre: "Administration",
    items: [
      { href: "/utilisateurs", label: "Utilisateurs", icon: UserCog, adminSeulement: true },
      { href: "/notifications", label: "Notifications", icon: Bell },
    ],
  },
];
