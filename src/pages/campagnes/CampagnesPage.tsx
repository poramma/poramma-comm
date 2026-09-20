import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import CampagneCard from "../../components/campagnes/CampagneCard";
import { CAMPAGNE_TYPES } from "../../components/campagnes/campagneMeta";
import { campagneService } from "../../lib/services";
import type { Campagne, CampagneType } from "../../lib/types";

/** Fil des annonces publiées par l'ambassade pour la communauté. */
export default function CampagnesPage() {
  const [items, setItems] = useState<Campagne[]>([]);
  const [type, setType] = useState<CampagneType | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    campagneService
      .list({ type: type || undefined, limit: 50 })
      .then(setItems)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [type]);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm transition ${
      active
        ? "border-brand-500 bg-brand-500 text-white"
        : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  return (
    <>
      <PageMeta title="Annonces de l'ambassade" description="Les informations, alertes et événements publiés par l'ambassade pour la communauté." />
      <PageBreadcrumb pageTitle="Annonces de l'ambassade" />

      <div className="space-y-6 p-2 md:p-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Annonces de l'ambassade</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Informations, alertes, événements et rappels publiés par l'ambassade à l'attention de la communauté.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={chip(type === "")} onClick={() => setType("")}>
            Toutes
          </button>
          {(Object.keys(CAMPAGNE_TYPES) as CampagneType[]).map((t) => (
            <button key={t} type="button" className={chip(type === t)} onClick={() => setType(t)}>
              {CAMPAGNE_TYPES[t].label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-brand-500" />
          </div>
        ) : error ? (
          <p className="text-sm text-error-600">Impossible de charger les annonces. Réessayez dans un instant.</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
              <Megaphone className="h-6 w-6 text-brand-600 dark:text-brand-300" />
            </div>
            <h3 className="mt-4 font-medium text-gray-900 dark:text-white">Aucune annonce pour le moment</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Les prochaines publications de l'ambassade apparaîtront ici.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((c) => (
              <CampagneCard key={c.id} campagne={c} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
