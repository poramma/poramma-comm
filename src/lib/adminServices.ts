// ============================================================
// src/lib/adminServices.ts — administration de la communauté
// ============================================================
//
// Mêmes conventions que services.ts : enveloppe { success, data, message?, meta? },
// communaute-api sous /api/communaute, identity-api sans préfixe. Le serveur
// applique les permissions `community:*` sur chaque route.

import { api } from "./api";
import type {
  AdminOverview,
  AdminSystem,
  AdminTicketDetail,
  AdminTicketFilters,
  AdminTicketMeta,
  AdminTicketPriority,
  AdminTicketRow,
  AdminTicketStatus,
  Assignee,
  AuditExportFormat,
  AuditFilters,
  AuditRow,
  AuditStats,
  MemberDetail,
  MemberFilters,
  MemberRow,
  Paginated,
  PageMeta,
  TeamMember,
  TeamRole,
  AdminTicketMessage,
} from "./adminTypes";

const A = "/api/communaute/admin";

function unwrap<T>(res: { data: { data: T } }): T {
  return res.data.data;
}

function paginated<T, M = PageMeta>(res: { data: { data: T[]; meta: M } }): Paginated<T, M> {
  return { rows: res.data.data, meta: res.data.meta };
}

/** Retire les filtres vides pour ne pas envoyer `?status=&search=`. */
function clean<T extends object>(params: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") out[key] = value;
  }
  return out as Partial<T>;
}

export const adminOverviewService = {
  get: async (): Promise<AdminOverview> => unwrap(await api.get(`${A}/overview`)),
  system: async (): Promise<AdminSystem> => unwrap(await api.get(`${A}/system`)),
};

export const adminMembersService = {
  list: async (filters: MemberFilters): Promise<Paginated<MemberRow>> =>
    paginated(await api.get(`${A}/members`, { params: clean(filters) })),

  get: async (id: string): Promise<MemberDetail> => unwrap(await api.get(`${A}/members/${id}`)),

  /** identity-api (sans préfixe) : une suspension ferme aussitôt toutes les sessions du membre. */
  setStatus: async (id: string, status: "SUSPENDED" | "ACTIVE", reason?: string): Promise<void> => {
    await api.patch(`/community-admin/members/${id}/status`, { status, reason: reason || undefined });
  },
};

export const adminAuditService = {
  list: async (filters: AuditFilters): Promise<Paginated<AuditRow>> =>
    paginated(await api.get(`${A}/audit/logs`, { params: clean(filters) })),

  stats: async (): Promise<AuditStats> => unwrap(await api.get(`${A}/audit/stats`)),

  get: async (id: string): Promise<AuditRow> => unwrap(await api.get(`${A}/audit/logs/${id}`)),

  /** Renvoie le fichier (blob) et le nom que le serveur lui donne. */
  export: async (filters: AuditFilters, format: AuditExportFormat): Promise<{ blob: Blob; filename: string }> => {
    const { page: _page, limit: _limit, ...rest } = filters;
    void _page;
    void _limit;
    const res = await api.post(`${A}/audit/export`, { filters: clean(rest), format }, { responseType: "blob" });
    const disposition = String(res.headers["content-disposition"] ?? "");
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
    const fallback = format === "JSON" ? "audit-communaute.json" : "audit-communaute.csv";
    return { blob: res.data as Blob, filename: match?.[1] ? decodeURIComponent(match[1]) : fallback };
  },
};

export const adminSupportService = {
  list: async (filters: AdminTicketFilters): Promise<Paginated<AdminTicketRow, AdminTicketMeta>> =>
    paginated(await api.get(`${A}/support/tickets`, { params: clean(filters) })),

  assignees: async (): Promise<Assignee[]> => unwrap(await api.get(`${A}/support/assignees`)),

  get: async (id: string): Promise<AdminTicketDetail> => unwrap(await api.get(`${A}/support/tickets/${id}`)),

  reply: async (id: string, content: string, isInternal = false): Promise<AdminTicketMessage> =>
    unwrap(await api.post(`${A}/support/tickets/${id}/messages`, { content, isInternal })),

  update: async (
    id: string,
    patch: { status?: AdminTicketStatus; priority?: AdminTicketPriority; assignedTo?: string | null }
  ): Promise<void> => {
    await api.patch(`${A}/support/tickets/${id}`, patch);
  },
};

/** identity-api (sans préfixe) : équipe d'administration de la communauté. */
export const adminTeamService = {
  list: async (): Promise<TeamMember[]> => unwrap(await api.get("/community-admin/team")),

  add: async (email: string, role: TeamRole): Promise<void> => {
    await api.post("/community-admin/team", { email, role });
  },

  changeRole: async (userId: string, role: TeamRole): Promise<void> => {
    await api.patch(`/community-admin/team/${userId}`, { role });
  },

  remove: async (userId: string): Promise<void> => {
    await api.delete(`/community-admin/team/${userId}`);
  },
};

/** Message d'erreur du serveur, sinon `fallback`. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  if (typeof message === "string" && message) return message;
  if (Array.isArray(message) && typeof message[0] === "string") return message[0];
  return fallback;
}

export function apiErrorStatus(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status;
}
