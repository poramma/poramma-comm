// Libellés, couleurs et formats partagés par les pages d'administration.

export type BadgeTone = "primary" | "success" | "brand" | "error" | "warning" | "info" | "light" | "dark";

export interface LabelInfo {
  label: string;
  color: BadgeTone;
}

const FALLBACK: LabelInfo = { label: "—", color: "light" };

/** "SOME_CODE" -> "Some code" : dernier recours pour une valeur que l'interface ne connaît pas. */
export function humanize(value: string | null | undefined): string {
  if (!value) return "—";
  const text = value.replace(/[_-]+/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function lookup(map: Record<string, LabelInfo>, value: string | null | undefined): LabelInfo {
  if (!value) return FALLBACK;
  return map[value] ?? { label: humanize(value), color: "light" };
}

const MEMBER_STATUS: Record<string, LabelInfo> = {
  VERIFIED: { label: "Vérifié", color: "success" },
  ACTIVE: { label: "Actif", color: "success" },
  UNVERIFIED: { label: "Non vérifié", color: "warning" },
  SUSPENDED: { label: "Suspendu", color: "error" },
};
export const memberStatusInfo = (v: string | null | undefined) => lookup(MEMBER_STATUS, v);

export const USER_TYPE_LABELS: Record<string, string> = { student: "Étudiant", worker: "Travailleur", other: "Autre" };
export const userTypeLabel = (v: string | null | undefined) => (v ? USER_TYPE_LABELS[v] ?? humanize(v) : "—");

const REGISTRATION: Record<string, LabelInfo> = {
  PENDING: { label: "En attente", color: "warning" },
  VALIDATED: { label: "Validé", color: "success" },
  REJECTED: { label: "Refusé", color: "error" },
  SUSPENDED: { label: "Suspendu", color: "error" },
  NONE: { label: "Non commencé", color: "light" },
};
export const registrationInfo = (v: string | null | undefined) => lookup(REGISTRATION, v ?? "NONE");

const SEVERITY: Record<string, LabelInfo> = {
  INFO: { label: "Information", color: "info" },
  WARNING: { label: "Avertissement", color: "warning" },
  CRITICAL: { label: "Critique", color: "error" },
};
export const severityInfo = (v: string | null | undefined) => lookup(SEVERITY, v);

const RESULT: Record<string, LabelInfo> = {
  SUCCESS: { label: "Succès", color: "success" },
  ERROR: { label: "Erreur", color: "error" },
  REJECT: { label: "Rejeté", color: "primary" },
  WARNING: { label: "Alerte", color: "warning" },
};
export const resultInfo = (v: string | null | undefined) => lookup(RESULT, v);

const TICKET_STATUS: Record<string, LabelInfo> = {
  OPEN: { label: "Ouvert", color: "info" },
  IN_PROGRESS: { label: "En cours", color: "primary" },
  WAITING_USER: { label: "Attente du membre", color: "warning" },
  RESOLVED: { label: "Résolu", color: "success" },
  CLOSED: { label: "Clôturé", color: "light" },
};
export const ticketStatusInfo = (v: string | null | undefined) => lookup(TICKET_STATUS, v);

const PRIORITY: Record<string, LabelInfo> = {
  LOW: { label: "Basse", color: "light" },
  NORMAL: { label: "Normale", color: "info" },
  HIGH: { label: "Haute", color: "warning" },
  URGENT: { label: "Urgente", color: "error" },
};
export const priorityInfo = (v: string | null | undefined) => lookup(PRIORITY, v);

export const TEAM_ROLE_LABELS: Record<string, string> = {
  COMMUNITY_ADMIN: "Administrateur communauté",
  COMMUNITY_SUPPORT: "Support communauté",
};

export function memberName(row: { firstName?: string | null; lastName?: string | null }): string {
  return [row.firstName, row.lastName].filter(Boolean).join(" ").trim();
}

// ---------- Dates ----------

export const formatDateTime = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—";

export const formatDate = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { dateStyle: "medium" }) : "—";

/** Jour AAAA-MM-JJ -> "12 oct." (sans décalage de fuseau). */
export const formatDayShort = (day: string): string =>
  new Date(`${day}T00:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

export const formatDayLong = (day: string): string =>
  new Date(`${day}T00:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

/** 3 j 4 h · 5 h 12 min · 42 min · 30 s */
export function formatUptime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  if (days > 0) return `${days} j ${hours} h`;
  if (hours > 0) return `${hours} h ${minutes} min`;
  if (minutes > 0) return `${minutes} min`;
  return `${s} s`;
}

export const formatNumber = (n: number | null | undefined): string => (n ?? 0).toLocaleString("fr-FR");

/** Date locale AAAA-MM-JJ d'aujourd'hui (pour les champs <input type="date">). */
export const todayInput = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** "Chrome sur Windows" à partir d'un user-agent brut (le brut reste visible en infobulle). */
export function describeUserAgent(ua: string | null | undefined): string {
  if (!ua) return "Appareil inconnu";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\/|CriOS\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : /axios|node|curl/i.test(ua)
              ? "Client technique"
              : "Navigateur";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Android/.test(ua)
      ? "Android"
      : /iPhone|iPad|iOS/.test(ua)
        ? "iOS"
        : /Mac OS X|Macintosh/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : null;
  return os ? `${browser} sur ${os}` : browser;
}
