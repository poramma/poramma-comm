import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Users } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { adminMembersService, apiErrorMessage } from "../../lib/adminServices";
import type { MemberFilters } from "../../lib/adminTypes";
import { useAdminQuery, useDebouncedValue } from "../../hooks/useAdminQuery";
import {
  AdminPageHeader,
  Card,
  EmptyState,
  ErrorState,
  LoadingBlock,
  Pagination,
  SearchField,
  SelectField,
  TableScroll,
  tdClass,
  thClass,
} from "./components/AdminUi";
import { formatDate, formatDateTime, memberName, memberStatusInfo, registrationInfo, userTypeLabel } from "./adminFormat";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "VERIFIED", label: "Vérifié" },
  { value: "UNVERIFIED", label: "Non vérifié" },
  { value: "SUSPENDED", label: "Suspendu" },
];
const TYPE_OPTIONS = [
  { value: "student", label: "Étudiant" },
  { value: "worker", label: "Travailleur" },
  { value: "other", label: "Autre" },
];
const REGISTRATION_OPTIONS = [
  { value: "VALIDATED", label: "Validé" },
  { value: "PENDING", label: "En attente" },
  { value: "REJECTED", label: "Refusé" },
  { value: "SUSPENDED", label: "Suspendu" },
  { value: "NONE", label: "Non commencé" },
];

export default function AdminMembers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [userType, setUserType] = useState("");
  const [registration, setRegistration] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search.trim());

  // Un filtre qui change ramène à la première page.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, userType, registration]);

  const fetchMembers = useCallback(
    () =>
      adminMembersService.list({
        search: debouncedSearch,
        status: status as MemberFilters["status"],
        userType: userType as MemberFilters["userType"],
        registration: registration as MemberFilters["registration"],
        page,
        limit: PAGE_SIZE,
      }),
    [debouncedSearch, status, userType, registration, page]
  );
  const { data, error, loading, reload } = useAdminQuery(fetchMembers);

  const hasFilters = !!(search || status || userType || registration);
  const reset = () => {
    setSearch("");
    setStatus("");
    setUserType("");
    setRegistration("");
  };

  return (
    <>
      <PageMeta title="Membres | Administration Poramma" description="Liste des membres de la communauté." />
      <AdminPageHeader title="Membres" description="Comptes de la communauté Poramma. Les dossiers consulaires restent réservés à l'ambassade." />

      <Card className="mb-4 p-4">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          <SearchField value={search} onChange={setSearch} placeholder="Nom, email, téléphone, INUE…" className="col-span-2" />
          <SelectField label="Compte" value={status} onChange={setStatus} options={STATUS_OPTIONS} allLabel="Tous" />
          <SelectField label="Profil" value={userType} onChange={setUserType} options={TYPE_OPTIONS} allLabel="Tous" />
          <SelectField label="Enregistrement" value={registration} onChange={setRegistration} options={REGISTRATION_OPTIONS} allLabel="Tous" />
        </div>
        {hasFilters && (
          <div className="mt-3">
            <Button size="xs" variant="outline" onClick={reset}>
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </Card>

      <Card>
        {loading && !data && <LoadingBlock />}
        {error != null && !data && <ErrorState message={apiErrorMessage(error, "La liste des membres n'a pas pu être chargée.")} onRetry={() => void reload()} />}
        {error != null && data && (
          <p role="alert" className="border-b border-error-200 bg-error-50 px-4 py-2 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            Actualisation impossible : {apiErrorMessage(error, "réessayez dans un instant.")}
          </p>
        )}
        {data && data.rows.length === 0 && (
          <EmptyState
            icon={Users}
            title={hasFilters ? "Aucun membre ne correspond à ces critères" : "Aucun membre pour l'instant"}
            description={hasFilters ? "Modifiez ou réinitialisez les filtres." : undefined}
          />
        )}
        {data && data.rows.length > 0 && (
          <>
            <TableScroll>
              <table className={`min-w-full divide-y divide-gray-100 dark:divide-gray-800 ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
                <caption className="sr-only">Membres de la communauté</caption>
                <thead>
                  <tr>
                    <th scope="col" className={thClass}>Membre</th>
                    <th scope="col" className={thClass}>Profil</th>
                    <th scope="col" className={thClass}>Compte</th>
                    <th scope="col" className={thClass}>Enregistrement</th>
                    <th scope="col" className={thClass}>Localisation</th>
                    <th scope="col" className={thClass}>Inscrit le</th>
                    <th scope="col" className={thClass}>Dernière connexion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {data.rows.map((m) => {
                    const st = memberStatusInfo(m.status);
                    const reg = registrationInfo(m.registrationStatus);
                    const name = memberName(m);
                    const place = [m.city, m.country].filter(Boolean).join(", ");
                    return (
                      <tr key={m.id} onClick={() => navigate(`/admin/membres/${m.id}`)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                        <td className={tdClass}>
                          <Link
                            to={`/admin/membres/${m.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="block font-medium text-gray-800 hover:text-brand-700 dark:text-white/90"
                          >
                            {name || m.email}
                          </Link>
                          <span className="block max-w-[16rem] truncate text-xs text-gray-500 dark:text-gray-400">
                            {name ? m.email : m.phone ?? ""}
                            {m.inue ? ` · INUE ${m.inue}` : ""}
                          </span>
                        </td>
                        <td className={`${tdClass} whitespace-nowrap`}>{userTypeLabel(m.userType)}</td>
                        <td className={tdClass}>
                          <Badge color={st.color} size="sm">{st.label}</Badge>
                        </td>
                        <td className={tdClass}>
                          <Badge color={reg.color} size="sm">{reg.label}</Badge>
                        </td>
                        <td className={`${tdClass} whitespace-nowrap`}>{place || "—"}</td>
                        <td className={`${tdClass} whitespace-nowrap`}>{formatDate(m.createdAt)}</td>
                        <td className={`${tdClass} whitespace-nowrap`}>{m.lastLoginAt ? formatDateTime(m.lastLoginAt) : "Jamais"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableScroll>
            <Pagination meta={data.meta} onChange={setPage} noun="membre" />
          </>
        )}
      </Card>
    </>
  );
}
