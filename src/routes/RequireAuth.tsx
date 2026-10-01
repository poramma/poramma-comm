// ============================================================
// src/routes/RequireAuth.tsx
// ============================================================
//
// Garde d'authentification : tout ce qui vit sous <AppLayout /> (dashboard,
// profil, demandes, rendez-vous, espace culturel, enregistrement...) exige
// une session valide. Sans ce garde, react-router monte directement la page
// demandée — aucune vérification n'a lieu avant le premier appel API, donc
// une personne non connectée voit l'UI (mise en page, menus, formulaires
// vides) avant qu'un éventuel 401 ne la redirige. C'est la faille corrigée
// ici : le garde bloque le rendu tant que l'état d'authentification n'est
// pas connu, puis redirige si aucune session n'existe.

import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

function AuthLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand-500" />
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // AuthProvider vérifie le token au montage (GET /profile) avant de savoir
  // si l'utilisateur est connecté — ne jamais rendre la page protégée, ni
  // rediriger, tant que ce résultat n'est pas arrivé.
  if (loading) return <AuthLoading />;

  if (!user) {
    // SignInForm relit location.state.from pour renvoyer l'utilisateur là
    // où il voulait aller une fois connecté.
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

/** Inverse : /signin, /signup... n'ont pas de raison d'être revus une fois connecté. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <AuthLoading />;
  if (user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

/**
 * Onboarding d'un compte enrôlé sur place (voir identity-api's
 * users.service.ts enrollStudent) : mot de passe par défaut et email non
 * confirmé. À placer à l'intérieur de <RequireAuth> (donc `user` est déjà
 * garanti non nul) mais AUTOUR du reste de l'app, jamais autour de
 * /completer-mot-de-passe ou /verifier-email elles-mêmes — sinon on boucle.
 * Un compte normal (inscription publique par OTP, déjà vérifiée) traverse
 * ce garde sans jamais le remarquer.
 */
export function RequireOnboarded({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user) return null;
  if (user.mustChangePassword) return <Navigate to="/completer-mot-de-passe" replace />;
  if (!user.emailVerified) return <Navigate to="/verifier-email" replace />;

  return <>{children}</>;
}
