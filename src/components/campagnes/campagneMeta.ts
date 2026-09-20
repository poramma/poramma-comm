import type { CampagneType } from "../../lib/types";

export const CAMPAGNE_TYPES: Record<CampagneType, { label: string; color: "brand" | "success" | "error" | "warning" | "light"; tint: string }> = {
  INFO: { label: "Information", color: "brand", tint: "from-brand-500 to-brand-700" },
  ALERT: { label: "Alerte", color: "error", tint: "from-error-500 to-error-700" },
  EVENT: { label: "Événement", color: "success", tint: "from-success-500 to-success-700" },
  SURVEY: { label: "Sondage", color: "warning", tint: "from-warning-500 to-warning-700" },
  REMINDER: { label: "Rappel", color: "light", tint: "from-gray-500 to-gray-700" },
};

export const typeMeta = (type: string) => CAMPAGNE_TYPES[type as CampagneType] ?? CAMPAGNE_TYPES.INFO;

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

export const formatPublished = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";
