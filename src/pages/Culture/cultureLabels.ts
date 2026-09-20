import type { CultureThreadStatus } from "../../lib/types";

export const THREAD_STATUS: Record<CultureThreadStatus, { label: string; color: "warning" | "info" | "light"; hint: string }> = {
  OPEN: { label: "Envoyé", color: "warning", hint: "Votre message a bien été reçu. Le Conseiller Culturel vous répondra prochainement." },
  ANSWERED: { label: "Répondu", color: "info", hint: "Le Conseiller Culturel vous a répondu. Vous pouvez poursuivre l'échange ci-dessous." },
  CLOSED: { label: "Clos", color: "light", hint: "Cet échange est clos. Vous pouvez en ouvrir un nouveau à tout moment." },
};

export const formatWhen = (iso: string) => new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

/** Initiales d'un nom, pour l'avatar du conseiller. */
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
