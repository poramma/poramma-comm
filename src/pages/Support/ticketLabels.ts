import type { SupportCategory, SupportStatus, SupportTarget } from "../../lib/services";

export const CATEGORY_LABELS: Record<SupportCategory, string> = {
  DEMANDE: "Une de mes demandes",
  RENDEZ_VOUS: "Un rendez-vous",
  REGISTRATION: "Mon enregistrement / mon INUE",
  ACCOUNT: "Compte et connexion",
  TECHNICAL: "Problème technique",
  REPORT: "Signalement (contenu ou comportement)",
  OTHER: "Autre question",
};

/** Où part le ticket — noms affichés à l'usager. */
export const TARGET_INFO: Record<SupportTarget, { label: string; badge: string; to: string; color: "brand" | "info" }> = {
  EMBASSY: { label: "Ambassade", badge: "Ambassade", to: "à l'ambassade", color: "brand" },
  COMMUNITY: { label: "Support Poramma Communauté", badge: "Support communauté", to: "au support Poramma Communauté", color: "info" },
};

/** Catégories proposées selon le destinataire. */
export const TARGET_CATEGORIES: Record<SupportTarget, SupportCategory[]> = {
  EMBASSY: ["ACCOUNT", "DEMANDE", "RENDEZ_VOUS", "REGISTRATION", "TECHNICAL", "OTHER"],
  COMMUNITY: ["ACCOUNT", "TECHNICAL", "REPORT", "OTHER"],
};

/** Ce que l'usager lit : libellé du statut et ce qu'il doit en comprendre. */
export const STATUS_INFO: Record<SupportStatus, { label: string; hint: string; color: "info" | "warning" | "success" | "light" | "primary" }> = {
  OPEN: { label: "Reçu", hint: "L'ambassade a reçu votre message et va le prendre en charge.", color: "info" },
  IN_PROGRESS: { label: "En cours de traitement", hint: "Un agent de l'ambassade traite votre demande.", color: "primary" },
  WAITING_USER: { label: "Réponse de l'ambassade", hint: "L'ambassade vous a répondu : votre réponse est attendue.", color: "warning" },
  RESOLVED: { label: "Résolu", hint: "Votre demande est marquée comme résolue. Répondez pour la rouvrir si besoin.", color: "success" },
  CLOSED: { label: "Clôturé", hint: "Ce ticket est clôturé. Ouvrez un nouveau ticket pour toute nouvelle question.", color: "light" },
};

export const formatWhen = (iso: string) => new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

type StatusInfo = (typeof STATUS_INFO)[SupportStatus];

const COMMUNITY_STATUS_INFO: Partial<Record<SupportStatus, Partial<StatusInfo>>> = {
  OPEN: { hint: "Le support Poramma Communauté a reçu votre message et va le prendre en charge." },
  IN_PROGRESS: { hint: "Un membre de l'équipe de support traite votre demande." },
  WAITING_USER: { label: "Réponse du support", hint: "Le support vous a répondu : votre réponse est attendue." },
};

/** Statut tel que l'usager le lit — les mots changent selon qu'il écrit à l'ambassade ou au support communautaire. */
export function statusInfoFor(status: SupportStatus, target: SupportTarget = "EMBASSY"): StatusInfo {
  const base = STATUS_INFO[status];
  return target === "COMMUNITY" ? { ...base, ...COMMUNITY_STATUS_INFO[status] } : base;
}

/** Nom affiché pour une réponse du personnel quand le serveur n'en donne pas. */
export const STAFF_FALLBACK_NAME: Record<SupportTarget, string> = {
  EMBASSY: "Ambassade du Mali",
  COMMUNITY: "Support Poramma Communauté",
};
