// ============================================================
// src/lib/communityAccess.ts — qui est "personnel de la communauté" ?
// ============================================================
//
// Un compte est du personnel de la communauté ssi il détient au moins une
// permission `community:*` (rôles COMMUNITY_ADMIN et COMMUNITY_SUPPORT). Le
// serveur applique de toute façon ces permissions sur chaque route : ce
// module ne sert qu'à masquer ce que le compte ne pourrait pas utiliser.

import type { AuthUser } from "./types";

export const PERMISSIONS = {
  overviewRead: "community:overview:read",
  userRead: "community:user:read",
  userManage: "community:user:manage",
  auditRead: "community:audit:read",
  auditExport: "community:audit:export",
  supportRead: "community:support:read",
  supportManage: "community:support:manage",
  teamRead: "community:team:read",
  teamManage: "community:team:manage",
} as const;

export type CommunityPermission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Page d'arrivée du personnel (jamais /dashboard : pas de dossier citoyen). */
export const STAFF_HOME = "/admin";
export const CITIZEN_HOME = "/dashboard";

export function isCommunityStaff(user: AuthUser | null | undefined): boolean {
  return !!user?.permissions?.some((code) => code.startsWith("community:"));
}

export function userHasPermission(user: AuthUser | null | undefined, code: string): boolean {
  return !!user?.permissions?.includes(code);
}

/** Destination par défaut après connexion. */
export function homePathFor(user: AuthUser | null | undefined): string {
  return isCommunityStaff(user) ? STAFF_HOME : CITIZEN_HOME;
}

const ROLE_LABELS: Record<string, string> = {
  COMMUNITY_ADMIN: "Administrateur communauté",
  COMMUNITY_SUPPORT: "Support communauté",
};

export function communityRoleLabel(roleName: string | null | undefined): string {
  if (!roleName) return "";
  return ROLE_LABELS[roleName] ?? roleName;
}

/** Libellé du rôle du personnel, ou null pour un citoyen. */
export function staffRoleLabel(user: AuthUser | null | undefined): string | null {
  if (!isCommunityStaff(user)) return null;
  const name =
    user?.activeRole?.name ??
    user?.roles?.find((r) => r.role.name.startsWith("COMMUNITY_"))?.role.name ??
    null;
  return name ? communityRoleLabel(name) : "Personnel communauté";
}
