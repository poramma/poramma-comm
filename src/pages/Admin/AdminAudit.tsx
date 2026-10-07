import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AlertOctagon, FileJson, FileSpreadsheet, ScrollText, ShieldAlert, XCircle } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { adminAuditService, apiErrorMessage } from "../../lib/adminServices";
import type { AuditExportFormat, AuditFilters, AuditRow } from "../../lib/adminTypes";
import { useAdminQuery, useDebouncedValue } from "../../hooks/useAdminQuery";
import { useCommunityAccess } from "../../hooks/useCommunityAccess";
import { PERMISSIONS } from "../../lib/communityAccess";
import {
  AdminPageHeader,
  Card,
  EmptyState,
  ErrorState,
  InputField,
  LoadingBlock,
  Pagination,
  SearchField,
  SelectField,
  StatCard,
  TableScroll,
  tdClass,
  thClass,
} from "./components/AdminUi";
import { formatDateTime, formatNumber, resultInfo, severityInfo } from "./adminFormat";

const PAGE_SIZE = 25;

const SEVERITY_OPTIONS = [
  { value: "INFO", label: "Information" },
  { value: "WARNING", label: "Avertissement" },
  { value: "CRITICAL", label: "Critique" },
];
const RESULT_OPTIONS = [
  { value: "SUCCESS", label: "Succès" },
  { value: "ERROR", label: "Erreur" },
  { value: "REJECT", label: "Rejeté" },
  { value: "WARNING", label: "Alerte" },
];

function prettyJson(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  return JSON.stringify(value, null, 2);
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div>
      <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</h4>
      <pre className="max-h-64 overflow-auto rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-800 dark:bg-white/5 dark:text-gray-200">{prettyJson(value)}</pre>
    </div>
  );
}

function DetailModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const fetchLog = useCallback(() => adminAuditService.get(id ?? ""), [id]);
  const { data: fetched, error, loading, reload } = useAdminQuery<AuditRow>(fetchLog, id !== null);
  // Ne jamais montrer l'événement précédent pendant que le suivant se charge.
  const data = fetched && fetched.id === id ? fetched : null;

  const sev = data ? severityInfo(data.severity) : null;
  const res = data ? resultInfo(data.result) : null;

  return (
    <Modal isOpen={id !== null} onClose={onClose} className="m-4 max-h-[90vh] max-w-2xl overflow-y-auto p-6 sm:p-8">
      <div role="dialog" aria-modal="true" aria-label="Détail de l'événement">
        <h3 className="pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">Détail de l'événement</h3>
        {loading && <LoadingBlock />}
        {!loading && error != null && !data && <ErrorState message={apiErrorMessage(error, "L'événement n'a pas pu être chargé.")} onRetry={() => void reload()} />}
        {data && sev && res && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color={sev.color}>{sev.label}</Badge>
              <Badge color={res.color}>{res.label}</Badge>
              <span className="font-mono text-sm text-gray-800 dark:text-white/90">{data.action}</span>
            </div>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              {[
                ["Date", formatDateTime(data.at)],
                ["Auteur", [data.actorName, data.actorEmail].filter(Boolean).join(" · ") || "Système / anonyme"],
                ["Rôle", data.actorRole ?? "—"],
                ["INUE", data.actorInue ?? "—"],
                ["Objet", [data.entityType, data.entityId].filter(Boolean).join(" · ") || "—"],
                ["Adresse IP", data.ip ?? "—"],
                ["Session", data.sessionId ?? "—"],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
                  <dd className="mt-0.5 break-all text-gray-800 dark:text-white/90">{value}</dd>
                </div>
              ))}
              <div className="min-w-0 sm:col-span-2">
                <dt className="text-xs text-gray-500 dark:text-gray-400">Navigateur / appareil</dt>
                <dd className="mt-0.5 break-all text-xs text-gray-800 dark:text-white/90">{data.ua ?? "—"}</dd>
              </div>
            </dl>
            <JsonBlock title="Détails" value={data.details} />
            <JsonBlock title="Instantané de l'objet" value={data.entitySnapshot} />
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function AdminAudit() {
  const { hasPermission } = useCommunityAccess();
  const canExport = hasPermission(PERMISSIONS.auditExport);

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [result, setResult] = useState("");
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [exporting, setExporting] = useState<AuditExportFormat | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim());
  const debouncedAction = useDebouncedValue(action.trim());
  const debouncedEntity = useDebouncedValue(entityType.trim());

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, debouncedAction, debouncedEntity, severity, result, dateFrom, dateTo]);

  const filters: AuditFilters = {
    search: debouncedSearch,
    action: debouncedAction,
    entityType: debouncedEntity,
    severity: severity as AuditFilters["severity"],
    result: result as AuditFilters["result"],
    dateFrom,
    dateTo,
  };

  const fetchLogs = useCallback(
    () =>
      adminAuditService.list({
        search: debouncedSearch,
        action: debouncedAction,
        entityType: debouncedEntity,
        severity: severity as AuditFilters["severity"],
        result: result as AuditFilters["result"],
        dateFrom,
        dateTo,
        page,
        limit: PAGE_SIZE,
      }),
    [debouncedSearch, debouncedAction, debouncedEntity, severity, result, dateFrom, dateTo, page]
  );
  const { data, error, loading, reload } = useAdminQuery(fetchLogs);

  const fetchStats = useCallback(() => adminAuditService.stats(), []);
  const { data: stats } = useAdminQuery(fetchStats);

  const hasFilters = !!(search || action || entityType || severity || result || dateFrom || dateTo);
  const reset = () => {
    setSearch("");
    setAction("");
    setEntityType("");
    setSeverity("");
    setResult("");
    setDateFrom("");
    setDateTo("");
  };

  const dateRangeInvalid = !!dateFrom && !!dateTo && dateFrom > dateTo;

  const exportLogs = async (format: AuditExportFormat) => {
    setExporting(format);
    try {
      const { blob, filename } = await adminAuditService.export(filters, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Export téléchargé.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "L'export n'a pas pu être généré."));
    } finally {
      setExporting(null);
    }
  };

  return (
    <>
      <PageMeta title="Journal d'audit | Administration Poramma" description="Journal d'audit de la communauté Poramma." />
      <AdminPageHeader
        title="Journal d'audit"
        description="Traçabilité des actions sur la plateforme communautaire (connexions, modifications, actions du personnel)."
        actions={
          canExport && (
            <>
              <Button size="sm" variant="outline" onClick={() => void exportLogs("CSV")} disabled={exporting !== null || dateRangeInvalid} startIcon={<FileSpreadsheet className="h-4 w-4" />}>
                {exporting === "CSV" ? "Export…" : "Exporter en CSV"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => void exportLogs("JSON")} disabled={exporting !== null || dateRangeInvalid} startIcon={<FileJson className="h-4 w-4" />}>
                {exporting === "JSON" ? "Export…" : "Exporter en JSON"}
              </Button>
            </>
          )
        }
      />

      {stats && (
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label="Événements" value={formatNumber(stats.total)} icon={ScrollText} tone="brand" />
          <StatCard label="Avertissements" value={formatNumber(stats.bySeverity.WARNING)} icon={ShieldAlert} tone="warning" />
          <StatCard label="Critiques" value={formatNumber(stats.criticalEvents ?? stats.bySeverity.CRITICAL)} icon={AlertOctagon} tone={stats.criticalEvents > 0 ? "error" : "gray"} />
          <StatCard label="Connexions échouées" value={formatNumber(stats.failedLogins)} icon={ShieldAlert} tone={stats.failedLogins > 0 ? "warning" : "gray"} />
          <StatCard label="Erreurs" value={formatNumber(stats.byResult.ERROR)} hint={`${formatNumber(stats.byResult.SUCCESS)} succès`} icon={XCircle} tone="info" />
        </div>
      )}

      <Card className="mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SearchField value={search} onChange={setSearch} placeholder="Auteur, email, action, IP…" className="sm:col-span-2" />
          <SelectField label="Gravité" value={severity} onChange={setSeverity} options={SEVERITY_OPTIONS} allLabel="Toutes" />
          <SelectField label="Résultat" value={result} onChange={setResult} options={RESULT_OPTIONS} allLabel="Tous" />
          <InputField label="Action" value={action} onChange={setAction} placeholder="Ex. : AUTH_LOGIN" />
          <InputField label="Type d'objet" value={entityType} onChange={setEntityType} placeholder="Ex. : user" />
          <InputField label="Du" type="date" value={dateFrom} onChange={setDateFrom} max={dateTo || undefined} />
          <InputField label="Au" type="date" value={dateTo} onChange={setDateTo} min={dateFrom || undefined} />
        </div>
        {dateRangeInvalid && <p role="alert" className="mt-2 text-xs text-error-600 dark:text-error-400">La date de début doit précéder la date de fin.</p>}
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
        {error != null && !data && <ErrorState message={apiErrorMessage(error, "Le journal n'a pas pu être chargé.")} onRetry={() => void reload()} />}
        {error != null && data && (
          <p role="alert" className="border-b border-error-200 bg-error-50 px-4 py-2 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            Actualisation impossible : {apiErrorMessage(error, "réessayez dans un instant.")}
          </p>
        )}
        {data && data.rows.length === 0 && (
          <EmptyState icon={ScrollText} title={hasFilters ? "Aucun événement ne correspond à ces critères" : "Aucun événement enregistré"} description={hasFilters ? "Modifiez ou réinitialisez les filtres." : undefined} />
        )}
        {data && data.rows.length > 0 && (
          <>
            <TableScroll>
              <table className={`min-w-full divide-y divide-gray-100 dark:divide-gray-800 ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
                <caption className="sr-only">Événements du journal d'audit</caption>
                <thead>
                  <tr>
                    <th scope="col" className={thClass}>Date</th>
                    <th scope="col" className={thClass}>Gravité</th>
                    <th scope="col" className={thClass}>Résultat</th>
                    <th scope="col" className={thClass}>Action</th>
                    <th scope="col" className={thClass}>Auteur</th>
                    <th scope="col" className={thClass}>Objet</th>
                    <th scope="col" className={thClass}>IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {data.rows.map((row) => {
                    const sev = severityInfo(row.severity);
                    const res = resultInfo(row.result);
                    return (
                      <tr
                        key={row.id}
                        tabIndex={0}
                        onClick={() => setOpenId(row.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setOpenId(row.id);
                          }
                        }}
                        aria-label={`Voir le détail : ${row.action}`}
                        className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:outline-hidden dark:hover:bg-white/[0.03] dark:focus:bg-white/[0.03]"
                      >
                        <td className={`${tdClass} whitespace-nowrap`}>{formatDateTime(row.at)}</td>
                        <td className={tdClass}>
                          <Badge color={sev.color} size="sm">{sev.label}</Badge>
                        </td>
                        <td className={tdClass}>
                          <Badge color={res.color} size="sm">{res.label}</Badge>
                        </td>
                        <td className={`${tdClass} whitespace-nowrap font-mono text-xs`}>{row.action}</td>
                        <td className={tdClass}>
                          <span className="block max-w-[14rem] truncate">{row.actorName || row.actorEmail || "—"}</span>
                          {row.actorName && row.actorEmail && <span className="block max-w-[14rem] truncate text-xs text-gray-500 dark:text-gray-400">{row.actorEmail}</span>}
                        </td>
                        <td className={`${tdClass} whitespace-nowrap text-xs`}>{row.entityType ?? "—"}</td>
                        <td className={`${tdClass} whitespace-nowrap font-mono text-xs`}>{row.ip ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableScroll>
            <Pagination meta={data.meta} onChange={setPage} noun="événement" />
          </>
        )}
      </Card>

      <DetailModal id={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
