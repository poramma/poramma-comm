import { authService } from "./services";

/**
 * Connexion avec Google (Google Identity Services).
 *
 * L'identifiant client OAuth n'est pas un secret : le portail le lit auprès de l'API (GET /auth/config)
 * plutôt que dans une variable de build — un seul endroit à configurer (l'API), et activer ou couper la
 * connexion Google ne demande aucun redéploiement du portail. `null` = non configurée : aucun bouton affiché.
 */

let configPromise: Promise<string | null> | null = null;

export function getGoogleClientId(): Promise<string | null> {
  if (!configPromise) {
    configPromise = authService
      .config()
      .then((c) => c.google?.clientId ?? null)
      .catch(() => {
        configPromise = null; // l'API n'a pas répondu : on réessaiera au prochain affichage
        return null;
      });
  }
  return configPromise;
}

const GSI_SRC = "https://accounts.google.com/gsi/client";
let scriptPromise: Promise<void> | null = null;

/** Charge le script officiel de Google une seule fois ; rejette s'il est bloqué (bloqueur de pub, hors ligne). */
export function loadGoogleIdentity(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const el = document.createElement("script");
      el.src = GSI_SRC;
      el.async = true;
      el.defer = true;
      el.onload = () => resolve();
      el.onerror = () => {
        scriptPromise = null;
        el.remove();
        reject(new Error("gsi-load-failed"));
      };
      document.head.appendChild(el);
    });
  }
  return scriptPromise;
}

// `initialize` est global à la page : un seul rappel actif, mis à jour par le bouton monté.
let initializedFor: string | null = null;
let handler: ((credential: string) => void) | null = null;

export function setGoogleCredentialHandler(fn: ((credential: string) => void) | null) {
  handler = fn;
}

export function initGoogle(clientId: string) {
  if (initializedFor === clientId) return;
  window.google!.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      if (response.credential) handler?.(response.credential);
    },
    ux_mode: "popup",
    auto_select: false,
    cancel_on_tap_outside: true,
  });
  initializedFor = clientId;
}
