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
import { Link, Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { STAFF_HOME, CITIZEN_HOME, homePathFor, isCommunityStaff, userHasPermission } from "../lib/communityAccess";
import { ADMIN_NAV } from "../pages/Admin/adminNav";

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
  if (user) return <Navigate to={homePathFor(user)} replace />;

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

/**
 * Administration de la communauté (/admin/*) : réservée aux comptes qui
 * détiennent une permission `community:*`. À placer à l'intérieur de
 * <RequireAuth>. Un citoyen est renvoyé sur son tableau de bord ; un membre du
 * personnel à qui il manque la permission précise de la page est renvoyé sur
 * la 1re page d'administration qu'il peut ouvrir.
 */
export function RequireCommunityStaff({ children, permission }: { children: ReactNode; permission?: string }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;
  if (!isCommunityStaff(user)) return <Navigate to={CITIZEN_HOME} replace />;
  if (permission && !userHasPermission(user, permission)) {
    // Première page d'administration que le compte peut ouvrir (autre que celle-ci, pour ne jamais boucler).
    const fallback = ADMIN_NAV.find((entry) => entry.path !== location.pathname && userHasPermission(user, entry.permission));
    if (fallback) return <Navigate to={fallback.path} replace />;

    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Accès non autorisé</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Votre rôle ne donne pas accès à cette section de l'administration.</p>
        <Link to="/profile" className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline">
          Aller à mon profil
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

/** /dashboard est le tableau de bord citoyen : le personnel n'a pas de dossier, il va sur /admin. */
export function CitizenOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (isCommunityStaff(user)) return <Navigate to={STAFF_HOME} replace />;

  return <>{children}</>;
}
