import { AuditAPI } from "../lib/api";
import type { AuditAction } from "../lib/types";

export function useAudit() {
  const log = async (
    action: AuditAction,
    result: "SUCCESS" | "ERROR",
    meta?: Record<string, any>,
  ) => {
    // le backend ajoute horodatage, user, INUE, IP, etc.
    await AuditAPI.log({ action, result, meta });
  };
  return { log };
}
