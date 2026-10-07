import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { initGoogle, loadGoogleIdentity, setGoogleCredentialHandler } from "../../lib/googleAuth";

interface GoogleButtonProps {
  clientId: string;
  /** signin_with : « Se connecter avec Google » · signup_with : « S'inscrire avec Google » · continue_with : « Continuer avec Google ». */
  text: "signin_with" | "signup_with" | "continue_with";
  /** Reçoit l'ID token Google ; à envoyer à l'API (jamais à décoder ni à croire côté navigateur). */
  onCredential: (credential: string) => void | Promise<void>;
  /** Une requête est en cours : le bouton est grisé et ne réagit plus. */
  busy?: boolean;
}

/**
 * Bouton officiel « Google » (Google Identity Services). Google dessine lui-même le bouton dans une iframe :
 * c'est ce qui garantit la conformité de marque et empêche la page de lire autre chose que le jeton qu'elle reçoit.
 */
export default function GoogleButton({ clientId, text, onCredential, busy = false }: GoogleButtonProps) {
  const { theme } = useTheme();
  const holder = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [width, setWidth] = useState(0);

  // Largeur disponible (Google exige une largeur en pixels, entre 200 et 400).
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const measure = () => setWidth(Math.round(Math.min(400, Math.max(200, el.parentElement?.clientWidth ?? el.clientWidth))));
    measure();
    let timer: number | undefined;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(timer);
    };
  }, []);

  // Le rappel pointe toujours vers la dernière version de onCredential (les formulaires la recréent à chaque rendu).
  const latest = useRef(onCredential);
  latest.current = onCredential;
  useEffect(() => {
    setGoogleCredentialHandler((credential) => void latest.current(credential));
    return () => setGoogleCredentialHandler(null);
  }, []);

  useEffect(() => {
    if (!width) return;
    let cancelled = false;
    loadGoogleIdentity()
      .then(() => {
        if (cancelled || !holder.current) return;
        initGoogle(clientId);
        holder.current.innerHTML = "";
        window.google!.accounts.id.renderButton(holder.current, {
          type: "standard",
          theme: theme === "dark" ? "filled_black" : "outline",
          size: "large",
          text,
          shape: "rectangular",
          logo_alignment: "left",
          width,
          locale: "fr",
        });
        setFailed(false);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [clientId, theme, text, width]);

  if (failed) {
    return (
      <p role="status" className="rounded-lg bg-gray-100 px-4 py-3 text-center text-sm text-gray-600 dark:bg-white/5 dark:text-gray-300">
        La connexion avec Google est momentanément indisponible (connexion Internet ou bloqueur de contenu). Utilisez votre email et votre mot de passe.
      </p>
    );
  }

  return (
    <div className={`flex min-h-[44px] justify-center transition-opacity ${busy ? "pointer-events-none opacity-60" : ""}`} aria-busy={busy}>
      <div ref={holder} />
    </div>
  );
}
