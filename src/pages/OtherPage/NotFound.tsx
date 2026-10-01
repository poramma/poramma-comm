import { Link } from "react-router";
import { Compass, LifeBuoy } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";

const LOGO_SRC = "/images/poramma-logo.png";

export default function NotFound() {
  const { user, loading } = useAuth();
  // Connecté → retour au tableau de bord ; sinon → accueil public. On évite
  // de renvoyer un utilisateur déjà connecté vers la page vitrine.
  const homeHref = !loading && user ? "/dashboard" : "/";
  const homeLabel = !loading && user ? "Retour au tableau de bord" : "Retour à l'accueil";

  return (
    <>
      <PageMeta
        title="Page introuvable | Poramma"
        description="Cette page n'existe pas ou n'est plus disponible sur Poramma."
      />
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-50 p-6 dark:bg-gray-900">
        <div className="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
          <img src="/images/shape/grid-01.svg" alt="" className="opacity-60 dark:opacity-20" />
        </div>
        <div className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]">
          <img src="/images/shape/grid-01.svg" alt="" className="opacity-60 dark:opacity-20" />
        </div>

        <Link to={homeHref} className="mb-10">
          <img src={LOGO_SRC} alt="Poramma" className="h-14 w-auto" />
        </Link>

        <div className="mx-auto w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            <Compass className="h-10 w-10" strokeWidth={1.5} />
          </div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
            Erreur 404
          </p>
          <h1 className="mb-3 text-2xl font-bold text-gray-800 dark:text-white/90 sm:text-3xl">
            Cette page n&apos;existe pas
          </h1>
          <p className="mb-8 text-base text-gray-500 dark:text-gray-400">
            Le lien est peut-être incorrect, ou la page a été déplacée. Vérifiez l&apos;adresse
            ou repartez d&apos;un endroit connu.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={homeHref}
              className="inline-flex w-full items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 sm:w-auto"
            >
              {homeLabel}
            </Link>
            <Link
              to="/support"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 sm:w-auto"
            >
              <LifeBuoy className="h-4 w-4" />
              Contacter le support
            </Link>
          </div>
        </div>

        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Poramma — Ambassade du Mali au Maroc.
        </p>
      </div>
    </>
  );
}
