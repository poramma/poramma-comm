import { useCallback } from "react";
import { Link } from "react-router";
import { Activity, AlertOctagon, CheckCircle2, LifeBuoy, LogIn, ShieldAlert, UserCheck, UserPlus, UserX, Users, XCircle } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import { adminOverviewService, apiErrorMessage } from "../../lib/adminServices";
import type { AdminOverview } from "../../lib/adminTypes";
import { useAdminQuery } from "../../hooks/useAdminQuery";
import { useCommunityAccess } from "../../hooks/useCommunityAccess";
import { PERMISSIONS } from "../../lib/communityAccess";
import { AdminPageHeader, Card, EmptyState, ErrorState, LoadingBlock, StatCard } from "./components/AdminUi";
import MiniBarChart from "./components/MiniBarChart";
import { formatNumber, formatUptime, registrationInfo, userTypeLabel } from "./adminFormat";

const REGISTRATION_ORDER = ["VALIDATED", "PENDING", "REJECTED", "SUSPENDED", "NONE"];
const REGISTRATION_BAR: Record<string, string> = {
  VALIDATED: "bg-success-500",
  PENDING: "bg-warning-500",
  REJECTED: "bg-error-500",
  SUSPENDED: "bg-error-300",
  NONE: "bg-gray-300 dark:bg-gray-600",
};
const TYPE_BAR: Record<string, string> = { student: "bg-brand-500", worker: "bg-blue-light-500", other: "bg-gray-400" };

function Breakdown({ rows }: { rows: { key: string; label: string; value: number; bar: string }[] }) {
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  if (total === 0) return <EmptyState title="Aucun membre pour l'instant" />;
  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const pct = Math.round((r.value / total) * 100);
        return (
          <li key={r.key}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="text-gray-700 dark:text-gray-300">{r.label}</span>
              <span className="tabular-nums text-gray-500 dark:text-gray-400">
                <strong className="font-semibold text-gray-800 dark:text-white/90">{formatNumber(r.value)}</strong> · {pct} %
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800" role="presentation">
              <div className={`h-full rounded-full ${r.bar}`} style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function SystemSummary() {
  const fetchSystem = useCallback(() => adminOverviewService.system(), []);
  const { data, error, loading, reload } = useAdminQuery(fetchSystem);

  const items = data
    ? [
        { label: "Base de données", ok: data.components.database.ok, detail: `${data.components.database.ms} ms` },
        { label: "Redis (sessions)", ok: data.components.redis.ok, detail: `${data.components.redis.ms} ms` },
        { label: "Stockage de fichiers", ok: data.components.storage.ok, detail: `${data.components.storage.ms} ms` },
        {
          label: "Envoi d'emails",
          ok: data.components.mail.configured,
          detail: data.components.mail.configured ? data.components.mail.provider ?? "Configuré" : "Non configuré",
        },
      ]
    : [];

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">Santé du système</h2>
        <Link to="/admin/systeme" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">
          Détails
        </Link>
      </div>
      {loading && <LoadingBlock />}
      {!loading && error != null && <ErrorState message="L'état du système n'a pas pu être lu." onRetry={() => void reload()} />}
      {data && (
        <>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {items.map((item) => (
              <li key={item.label} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-white/[0.03]">
                {item.ok ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success-500" aria-label="En service" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-error-500" aria-label="Indisponible" />
                )}
                <span className="min-w-0 flex-1 truncate text-gray-700 dark:text-gray-300">{item.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.detail}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            En ligne depuis {formatUptime(data.runtime.uptimeSeconds)} · mémoire {data.runtime.memoryMb} Mo
          </p>
        </>
      )}
    </Card>
  );
}

export default function AdminDashboard() {
  const { hasPermission } = useCommunityAccess();
  const fetchOverview = useCallback(() => adminOverviewService.get(), []);
  const { data, error, loading, reload } = useAdminQuery<AdminOverview>(fetchOverview);

  const canSupport = hasPermission(PERMISSIONS.supportRead);
  const canAudit = hasPermission(PERMISSIONS.auditRead);

  return (
    <>
      <PageMeta title="Administration | Poramma" description="Tableau de bord de l'administration de la communauté Poramma." />
      <AdminPageHeader title="Tableau de bord" description="Vue d'ensemble de la communauté Poramma." />

      {loading && <LoadingBlock />}
      {!loading && error != null && (
        <Card>
          <ErrorState message={apiErrorMessage(error, "Le tableau de bord n'a pas pu être chargé.")} onRetry={() => void reload()} />
        </Card>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Membres" value={formatNumber(data.members.total)} icon={Users} tone="brand" to={hasPermission(PERMISSIONS.userRead) ? "/admin/membres" : undefined} />
            <StatCard
              label="Nouveaux (7 jours)"
              value={formatNumber(data.members.new7)}
              hint={`${formatNumber(data.members.new30)} sur 30 jours`}
              icon={UserPlus}
              tone="success"
            />
            <StatCard label="Emails vérifiés" value={formatNumber(data.members.verified)} hint={`${formatNumber(data.members.unverified)} non vérifiés`} icon={UserCheck} tone="info" />
            <StatCard label="Comptes suspendus" value={formatNumber(data.members.suspended)} icon={UserX} tone={data.members.suspended > 0 ? "warning" : "gray"} />
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Activité des dernières 24 h</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Membres actifs" value={formatNumber(data.activity.activeMembers24h)} icon={Activity} tone="brand" />
              <StatCard label="Connexions" value={formatNumber(data.activity.logins24h)} icon={LogIn} tone="success" />
              <StatCard
                label="Connexions échouées"
                value={formatNumber(data.activity.failedLogins24h)}
                icon={ShieldAlert}
                tone={data.activity.failedLogins24h > 0 ? "warning" : "gray"}
                to={canAudit ? "/admin/audit" : undefined}
              />
              <StatCard
                label="Événements critiques"
                value={formatNumber(data.activity.criticalEvents24h)}
                icon={AlertOctagon}
                tone={data.activity.criticalEvents24h > 0 ? "error" : "gray"}
                to={canAudit ? "/admin/audit" : undefined}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">Inscriptions (14 jours)</h2>
              <MiniBarChart data={data.series.registrations} label="Inscriptions" unit="inscriptions" />
            </Card>
            <Card className="p-5">
              <h2 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">Connexions (14 jours)</h2>
              <MiniBarChart data={data.series.logins} label="Connexions" unit="connexions" />
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">Membres par profil</h2>
              <Breakdown
                rows={["student", "worker", "other"].map((key) => ({
                  key,
                  label: userTypeLabel(key),
                  value: data.byUserType[key] ?? 0,
                  bar: TYPE_BAR[key],
                }))}
              />
            </Card>
            <Card className="p-5">
              <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">Enregistrement auprès de l'ambassade</h2>
              <Breakdown
                rows={REGISTRATION_ORDER.map((key) => ({
                  key,
                  label: registrationInfo(key).label,
                  value: data.byRegistration[key] ?? 0,
                  bar: REGISTRATION_BAR[key],
                }))}
              />
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {canSupport && (
              <Card className="p-5">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">Support</h2>
                  <Link to="/admin/support" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">
                    Ouvrir le support
                  </Link>
                </div>
                <dl className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Ouverts", value: data.support.open },
                    { label: "En cours", value: data.support.inProgress },
                    { label: "En attente du membre", value: data.support.waitingUser },
                    { label: "Non assignés", value: data.support.unassigned },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/[0.03]">
                      <dt className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" />
                        {item.label}
                      </dt>
                      <dd className="text-xl font-semibold text-gray-800 dark:text-white/90">{formatNumber(item.value)}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            )}
            <SystemSummary />
          </div>
        </div>
      )}
    </>
  );
}
