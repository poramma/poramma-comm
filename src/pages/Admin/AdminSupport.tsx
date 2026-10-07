import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { LifeBuoy } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { adminSupportService, apiErrorMessage } from "../../lib/adminServices";
import type { AdminTicketFilters, AdminTicketStats } from "../../lib/adminTypes";
import { useAdminQuery, useDebouncedValue } from "../../hooks/useAdminQuery";
import { AdminPageHeader, Card, EmptyState, ErrorState, LoadingBlock, Pagination, SearchField, SelectField, TableScroll, tdClass, thClass } from "./components/AdminUi";
import { formatDateTime, priorityInfo, ticketStatusInfo } from "./adminFormat";
import { CATEGORY_LABELS } from "../Support/ticketLabels";

const PAGE_SIZE = 20;

type Tab = { value: string; label: string; count?: (s: AdminTicketStats) => number };
const TABS: Tab[] = [
  { value: "ACTIVE", label: "À traiter", count: (s) => s.open + s.inProgress + s.waitingUser },
  { value: "OPEN", label: "Ouverts", count: (s) => s.open },
  { value: "IN_PROGRESS", label: "En cours", count: (s) => s.inProgress },
  { value: "WAITING_USER", label: "Attente du membre", count: (s) => s.waitingUser },
  { value: "RESOLVED", label: "Résolus", count: (s) => s.resolved },
  { value: "CLOSED", label: "Clôturés", count: (s) => s.closed },
  { value: "", label: "Tous" },
];

const CATEGORY_OPTIONS = ["ACCOUNT", "TECHNICAL", "REPORT", "OTHER"].map((value) => ({ value, label: CATEGORY_LABELS[value as keyof typeof CATEGORY_LABELS] }));
const PRIORITY_OPTIONS = [
  { value: "URGENT", label: "Urgente" },
  { value: "HIGH", label: "Haute" },
  { value: "NORMAL", label: "Normale" },
  { value: "LOW", label: "Basse" },
];

export default function AdminSupport() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("ACTIVE");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [assigned, setAssigned] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search.trim());

  useEffect(() => {
    setPage(1);
  }, [tab, debouncedSearch, category, priority, assigned]);

  const fetchAssignees = useCallback(() => adminSupportService.assignees(), []);
  const { data: assignees } = useAdminQuery(fetchAssignees);

  const fetchTickets = useCallback(
    () =>
      adminSupportService.list({
        status: tab as AdminTicketFilters["status"],
        search: debouncedSearch,
        category,
        priority: priority as AdminTicketFilters["priority"],
        assigned,
        page,
        limit: PAGE_SIZE,
      }),
    [tab, debouncedSearch, category, priority, assigned, page]
  );
  const { data, error, loading, reload } = useAdminQuery(fetchTickets);

  const stats = data?.meta.stats;
  const hasFilters = !!(search || category || priority || assigned);

  const assignedOptions = [
    { value: "me", label: `Assignés à moi${stats ? ` (${stats.mine})` : ""}` },
    { value: "unassigned", label: `Non assignés${stats ? ` (${stats.unassigned})` : ""}` },
    ...(assignees ?? []).map((a) => ({ value: a.id, label: a.name ?? "Agent" })),
  ];

  return (
    <>
      <PageMeta title="Support | Administration Poramma" description="Tickets de support de la communauté Poramma." />
      <AdminPageHeader title="Support de la communauté" description="Questions et signalements adressés au support Poramma Communauté. Les tickets destinés à l'ambassade n'apparaissent pas ici." />

      <div role="tablist" aria-label="Filtrer par statut" className="mb-4 flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const active = tab === t.value;
          const count = stats && t.count ? t.count(stats) : null;
          return (
            <button
              key={t.value || "all"}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.value)}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-brand-500 text-white" : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 dark:bg-white/[0.03] dark:text-gray-300 dark:ring-gray-800 dark:hover:bg-white/5"
              }`}
            >
              {t.label}
              {count !== null && (
                <span className={`rounded-full px-1.5 text-xs ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"}`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <Card className="mb-4 p-4">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <SearchField value={search} onChange={setSearch} placeholder="Référence, objet, membre…" className="col-span-2 xl:col-span-1" />
          <SelectField label="Catégorie" value={category} onChange={setCategory} options={CATEGORY_OPTIONS} allLabel="Toutes" />
          <SelectField label="Priorité" value={priority} onChange={setPriority} options={PRIORITY_OPTIONS} allLabel="Toutes" />
          <SelectField label="Assignation" value={assigned} onChange={setAssigned} options={assignedOptions} allLabel="Tous" />
        </div>
        {hasFilters && (
          <div className="mt-3">
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                setSearch("");
                setCategory("");
                setPriority("");
                setAssigned("");
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </Card>

      <Card>
        {loading && !data && <LoadingBlock />}
        {error != null && !data && <ErrorState message={apiErrorMessage(error, "Les tickets n'ont pas pu être chargés.")} onRetry={() => void reload()} />}
        {error != null && data && (
          <p role="alert" className="border-b border-error-200 bg-error-50 px-4 py-2 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            Actualisation impossible : {apiErrorMessage(error, "réessayez dans un instant.")}
          </p>
        )}
        {data && data.rows.length === 0 && (
          <EmptyState icon={LifeBuoy} title={hasFilters || tab !== "ACTIVE" ? "Aucun ticket ne correspond à ces critères" : "Aucun ticket à traiter"} description={tab === "ACTIVE" && !hasFilters ? "Tout est à jour." : "Changez d'onglet ou réinitialisez les filtres."} />
        )}
        {data && data.rows.length > 0 && (
          <>
            <TableScroll>
              <table className={`min-w-full divide-y divide-gray-100 dark:divide-gray-800 ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
                <caption className="sr-only">Tickets de support de la communauté</caption>
                <thead>
                  <tr>
                    <th scope="col" className={thClass}>Ticket</th>
                    <th scope="col" className={thClass}>Membre</th>
                    <th scope="col" className={thClass}>Catégorie</th>
                    <th scope="col" className={thClass}>Priorité</th>
                    <th scope="col" className={thClass}>Statut</th>
                    <th scope="col" className={thClass}>Assigné à</th>
                    <th scope="col" className={thClass}>Dernière activité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {data.rows.map((t) => {
                    const st = ticketStatusInfo(t.status);
                    const pr = priorityInfo(t.priority);
                    const waitingStaff = t.lastMessageBy === "USER" && (t.status === "OPEN" || t.status === "IN_PROGRESS" || t.status === "WAITING_USER");
                    return (
                      <tr key={t.id} onClick={() => navigate(`/admin/support/${t.id}`)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                        <td className={tdClass}>
                          <Link to={`/admin/support/${t.id}`} onClick={(e) => e.stopPropagation()} className="block max-w-[18rem] truncate font-medium text-gray-800 hover:text-brand-700 dark:text-white/90">
                            {t.subject}
                          </Link>
                          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{t.reference}</span>
                        </td>
                        <td className={tdClass}>
                          <span className="block max-w-[12rem] truncate">{t.requester.name || t.requester.email || "—"}</span>
                          {t.requester.name && t.requester.email && <span className="block max-w-[12rem] truncate text-xs text-gray-500 dark:text-gray-400">{t.requester.email}</span>}
                        </td>
                        <td className={`${tdClass} whitespace-nowrap`}>{CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS] ?? t.category}</td>
                        <td className={tdClass}>
                          <Badge color={pr.color} size="sm">{pr.label}</Badge>
                        </td>
                        <td className={tdClass}>
                          <Badge color={st.color} size="sm">{st.label}</Badge>
                        </td>
                        <td className={`${tdClass} whitespace-nowrap`}>{t.assignee?.name ?? <span className="text-gray-400">Non assigné</span>}</td>
                        <td className={`${tdClass} whitespace-nowrap`}>
                          {formatDateTime(t.lastMessageAt)}
                          {waitingStaff && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-warning-500 align-middle" title="Réponse du membre à traiter" aria-label="Réponse du membre à traiter" />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableScroll>
            <Pagination meta={data.meta} onChange={setPage} noun="ticket" />
          </>
        )}
      </Card>
    </>
  );
}
