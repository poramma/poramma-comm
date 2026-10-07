import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { registrationService } from "../lib/services";
import type { RegistrationChecklist } from "../lib/types";
import { useAuth } from "./AuthContext";
import { isCommunityStaff } from "../lib/communityAccess";

/**
 * État de l'enregistrement du membre auprès de l'ambassade, partagé par tout
 * l'espace (bandeau du tableau de bord, verrouillage des services, page
 * d'enregistrement). La source de vérité est toujours le backend — ce
 * contexte ne fait que la mettre en cache côté client.
 */
interface RegistrationContextType {
  registration: RegistrationChecklist | null;
  loading: boolean;
  /** true tant que l'ambassade n'a pas validé le dossier (INUE attribué). */
  isValidated: boolean;
  refresh: () => Promise<RegistrationChecklist | null>;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const RegistrationProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [registration, setRegistration] = useState<RegistrationChecklist | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await registrationService.get();
      setRegistration(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    // Le personnel de la communauté n'a pas de dossier d'enregistrement : rien à charger.
    if (!user || isCommunityStaff(user)) {
      setRegistration(null);
      return;
    }
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [user?.id, authLoading, refresh]);

  return (
    <RegistrationContext.Provider value={{ registration, loading, isValidated: !!registration?.isValidated, refresh }}>
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const ctx = useContext(RegistrationContext);
  if (!ctx) throw new Error("useRegistration must be used within RegistrationProvider");
  return ctx;
};
