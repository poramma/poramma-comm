import type { ComponentType } from "react";
import { LayoutDashboard, LifeBuoy, ScrollText, ServerCog, ShieldCheck, Users } from "lucide-react";
import { PERMISSIONS, type CommunityPermission } from "../../lib/communityAccess";

export interface AdminNavEntry {
  name: string;
  path: string;
  /** Permission requise pour voir l'entrée (et ouvrir la page). */
  permission: CommunityPermission;
  icon: ComponentType<{ className?: string }>;
}

/**
 * Sections de l'administration de la communauté. Pour ajouter une section
 * (réseaux d'étudiants, forums, modération…) : une entrée ici + une route dans
 * App.tsx, la barre latérale et les gardes suivent d'elles-mêmes.
 */
export const ADMIN_NAV: AdminNavEntry[] = [
  { name: "Tableau de bord", path: "/admin", permission: PERMISSIONS.overviewRead, icon: LayoutDashboard },
  { name: "Membres", path: "/admin/membres", permission: PERMISSIONS.userRead, icon: Users },
  { name: "Journal d'audit", path: "/admin/audit", permission: PERMISSIONS.auditRead, icon: ScrollText },
  { name: "Support", path: "/admin/support", permission: PERMISSIONS.supportRead, icon: LifeBuoy },
  { name: "Équipe", path: "/admin/equipe", permission: PERMISSIONS.teamRead, icon: ShieldCheck },
  { name: "Système", path: "/admin/systeme", permission: PERMISSIONS.overviewRead, icon: ServerCog },
];
