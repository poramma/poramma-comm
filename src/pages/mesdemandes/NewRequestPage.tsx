import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { catalogService } from "../../lib/services";
import type { CatalogService } from "../../lib/types";

/** Point d'entrée « Nouvelle demande » : le catalogue réel des services, avec recherche. */
export default function NewRequestPage() {
  const [catalog, setCatalog] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    catalogService
      .listServices()
      .then(setCatalog)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog
      .map((svc) => ({
        ...svc,
        subServices: svc.subServices.filter((s) => s.active !== false && (!q || s.name.toLowerCase().includes(q) || svc.name.toLowerCase().includes(q))),
      }))
      .filter((svc) => svc.active !== false && svc.subServices.length > 0);
  }, [catalog, query]);

  return (
    <>
      <PageMeta title="Nouvelle demande" description="Choisissez le service consulaire pour lequel vous souhaitez faire une demande." />
      <PageBreadcrumb pageTitle="Nouvelle demande" />

      <div className="p-2 md:p-4 space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quel service souhaitez-vous demander ?</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Choisissez un service pour consulter ses conditions et déposer votre demande.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un service (passeport, acte de naissance…)"
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm text-gray-800 dark:text-white"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500" />
          </div>
        ) : error ? (
          <p className="text-sm text-error-600">Impossible de charger la liste des services. Réessayez dans un instant.</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Aucun service ne correspond à votre recherche.</p>
        ) : (
          groups.map((svc) => (
            <section key={svc.id} className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{svc.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {svc.subServices.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/services/demande/${sub.id}`}
                    className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-sm font-medium text-gray-800 dark:text-gray-100 hover:border-brand-400 hover:bg-brand-50/40 dark:hover:bg-brand-500/10 transition"
                  >
                    <span>{sub.name}</span>
                    <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}
