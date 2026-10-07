import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Database, HardDrive, Mail, MemoryStick, RefreshCw, Server, Timer, XCircle, Zap } from "lucide-react";
import type { ComponentType } from "react";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { adminOverviewService, apiErrorMessage } from "../../lib/adminServices";
import { useAdminQuery } from "../../hooks/useAdminQuery";
import { AdminPageHeader, Card, ErrorState, LoadingBlock } from "./components/AdminUi";
import { formatDateTime, formatUptime, humanize } from "./adminFormat";

const REFRESH_MS = 30_000;

type Health = "ok" | "down" | "off";

function StatusCard({ icon: Icon, title, health, detail }: { icon: ComponentType<{ className?: string }>; title: string; health: Health; detail: string }) {
  const meta: Record<Health, { label: string; color: "success" | "error" | "light"; Mark: ComponentType<{ className?: string }>; ring: string }> = {
    ok: { label: "En service", color: "success", Mark: CheckCircle2, ring: "text-success-500" },
    down: { label: "Indisponible", color: "error", Mark: XCircle, ring: "text-error-500" },
    off: { label: "Non configuré", color: "light", Mark: XCircle, ring: "text-gray-400" },
  };
  const m = meta[health];
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300">
          <Icon className="h-5 w-5" />
        </span>
        <Badge color={m.color} size="sm" startIcon={<m.Mark className={`h-3.5 w-3.5 ${m.ring}`} />}>
          {m.label}
        </Badge>
      </div>
      <h2 className="mt-3 text-base font-semibold text-gray-800 dark:text-white/90">{title}</h2>
      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{detail}</p>
    </Card>
  );
}

export default function AdminSystem() {
  const fetchSystem = useCallback(() => adminOverviewService.system(), []);
  const { data, error, loading, reload } = useAdminQuery(fetchSystem);
  const [refreshing, setRefreshing] = useState(false);

  // Actualisation automatique toutes les 30 s, uniquement quand l'onglet est visible.
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") void reload(true);
    };
    const id = window.setInterval(tick, REFRESH_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [reload]);

  const refresh = async () => {
    setRefreshing(true);
    await reload(true);
    setRefreshing(false);
  };

  const health = (ok: boolean): Health => (ok ? "ok" : "down");
  const c = data?.components;
  const r = data?.runtime;

  return (
    <>
      <PageMeta title="Système | Administration Poramma" description="Supervision de la plateforme communautaire." />
      <AdminPageHeader
        title="Supervision du système"
        description={data ? `Dernière vérification : ${formatDateTime(data.checkedAt)} · actualisation automatique toutes les 30 s` : "État des services de la plateforme."}
        actions={
          <Button size="sm" variant="outline" onClick={() => void refresh()} disabled={refreshing} startIcon={<RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />}>
            Actualiser
          </Button>
        }
      />

      {loading && !data && <LoadingBlock />}
      {error != null && !data && (
        <Card>
          <ErrorState message={apiErrorMessage(error, "L'état du système n'a pas pu être lu.")} onRetry={() => void reload()} />
        </Card>
      )}
      {error != null && data && (
        <p role="alert" className="mb-4 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          La dernière actualisation a échoué : les valeurs ci-dessous peuvent être périmées.
        </p>
      )}

      {c && r && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatusCard icon={Database} title="Base de données" health={health(c.database.ok)} detail={c.database.ok ? `Latence ${c.database.ms} ms` : "Ne répond pas"} />
            <StatusCard icon={Zap} title="Redis (sessions et limites)" health={health(c.redis.ok)} detail={c.redis.ok ? `Latence ${c.redis.ms} ms` : "Ne répond pas"} />
            <StatusCard icon={HardDrive} title="Stockage de fichiers" health={health(c.storage.ok)} detail={c.storage.ok ? `Latence ${c.storage.ms} ms` : "Ne répond pas"} />
            <StatusCard
              icon={Mail}
              title="Envoi d'emails"
              health={c.mail.configured ? "ok" : "off"}
              detail={c.mail.configured ? `Fournisseur : ${c.mail.provider ?? "non précisé"}` : "Aucun fournisseur configuré : les emails ne partent pas."}
            />
          </div>

          <Card className="p-5">
            <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">Service</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { icon: Server, label: "Service", value: r.service },
                { icon: Server, label: "Environnement", value: humanize(r.environment) },
                { icon: Server, label: "Node.js", value: r.node },
                { icon: Timer, label: "En ligne depuis", value: formatUptime(r.uptimeSeconds) },
                { icon: MemoryStick, label: "Mémoire", value: `${r.memoryMb} Mo` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
                    <dd className="break-words text-sm font-medium text-gray-800 dark:text-white/90">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      )}
    </>
  );
}
