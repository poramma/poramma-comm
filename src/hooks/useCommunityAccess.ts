import { useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { isCommunityStaff, staffRoleLabel, userHasPermission, type CommunityPermission } from "../lib/communityAccess";

/** Accès du compte connecté à l'administration de la communauté. */
export function useCommunityAccess() {
  const { user } = useAuth();

  const hasPermission = useCallback((code: CommunityPermission) => userHasPermission(user, code), [user]);

  return useMemo(
    () => ({
      isStaff: isCommunityStaff(user),
      roleLabel: staffRoleLabel(user),
      hasPermission,
    }),
    [user, hasPermission]
  );
}
