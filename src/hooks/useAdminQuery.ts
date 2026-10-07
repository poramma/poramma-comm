import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Charge une ressource d'administration et gère chargement / erreur / rechargement.
 * Une réponse périmée (paramètres changés entre-temps) est ignorée.
 * `fetcher` doit être stable (useCallback) : c'est lui qui déclenche le rechargement.
 */
export function useAdminQuery<T>(fetcher: () => Promise<T>, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(enabled);
  const ticket = useRef(0);

  const run = useCallback(
    async (silent = false) => {
      const mine = ++ticket.current;
      if (!silent) setLoading(true);
      try {
        const result = await fetcher();
        if (mine !== ticket.current) return;
        setData(result);
        setError(null);
      } catch (err) {
        if (mine !== ticket.current) return;
        setError(err);
      } finally {
        if (mine === ticket.current) setLoading(false);
      }
    },
    [fetcher]
  );

  useEffect(() => {
    if (!enabled) return;
    void run();
    const counter = ticket; // invalide la requête en vol quand le composant se démonte ou que les paramètres changent
    return () => {
      counter.current++;
    };
  }, [run, enabled]);

  /** `silent` : recharge sans remettre l'écran en état de chargement. */
  const reload = useCallback((silent = false) => run(silent), [run]);

  return { data, error, loading, reload, setData };
}

/** Valeur "retardée" : ne suit `value` qu'après `delay` ms sans changement (recherche à la frappe). */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
