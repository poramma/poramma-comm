import { useEffect, useState } from "react";
import { getGoogleClientId } from "../lib/googleAuth";

/** Identifiant client Google fourni par l'API ; `clientId` reste null tant que c'est en cours ou si la connexion Google n'est pas configurée. */
export function useGoogleClientId(): { clientId: string | null; loading: boolean } {
  const [state, setState] = useState<{ clientId: string | null; loading: boolean }>({ clientId: null, loading: true });

  useEffect(() => {
    let alive = true;
    getGoogleClientId().then((clientId) => alive && setState({ clientId, loading: false }));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
