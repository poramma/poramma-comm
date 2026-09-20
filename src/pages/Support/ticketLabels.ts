import type { SupportCategory, SupportStatus } from "../../lib/services";

export const CATEGORY_LABELS: Record<SupportCategory, string> = {
  DEMANDE: "Une de mes demandes",
  RENDEZ_VOUS: "Un rendez-vous",
  REGISTRATION: "Mon enregistrement / mon INUE",
  ACCOUNT: "Compte et connexion",
  TECHNICAL: "Problème technique",
  OTHER: "Autre question",
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
