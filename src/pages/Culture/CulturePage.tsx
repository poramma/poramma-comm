import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { CalendarPlus, ChevronRight, FileText, MessageCircle, Palette } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { useAuth } from "../../context/AuthContext";
import { cultureService, demandeService, rendezvousService } from "../../lib/services";
import type { CultureOverview, CultureThread, Demande, RendezVous } from "../../lib/types";
import { THREAD_STATUS, formatWhen, initialsOf } from "./cultureLabels";

const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

const RDV_ACTIVE = ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"];
const RDV_LABEL: Record<string, string> = {
  PENDING: "En attente de confirmation",
  CONFIRMED: "Confirmé",
  CHECKED_IN: "Enregistré à l'accueil",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  CANCELLED_BY_USER: "Annulé par vous",
  CANCELLED_BY_AGENT: "Annulé par le conseiller",
  NO_SHOW: "Absence",
  MISSED: "Manqué",
};

const DEMANDE_LABEL: Record<string, string> = {
  SUBMITTED: "Reçue",
  IN_REVIEW: "En cours d'examen",
  ADDITIONAL_INFO_REQUIRED: "Complément demandé",
  APPROVED: "Acceptée",
  REJECTED: "Refusée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

function ActionCard({ to, icon: Icon, title, text }: { to: string; icon: React.ElementType; title: string; text: string }) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/40"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-gray-900 dark:text-white">{title}</span>
        <span className="mt-0.5 block text-sm text-gray-600 dark:text-gray-400">{text}</span>
      </span>
      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
    </Link>
  );
}

function Section({ title, empty, children, hasItems }: { title: string; empty: string; children: React.ReactNode; hasItems: boolean }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">{title}</h2>
      {hasItems ? <div className="divide-y divide-gray-100 dark:divide-gray-800">{children}</div> : <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">{empty}</p>}
    </section>
  );
}

/**
 * Espace culturel : un conseiller, un visage. Rendez-vous, demandes et messages adressés directement au
 * Conseiller Culturel, dont le nom est affiché — à l'inverse des autres services de l'ambassade.
 */
export default function CulturePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<CultureOverview | null>(null);
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [threads, setThreads] = useState<CultureThread[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!user) return;
    cultureService.overview().then(setOverview).catch(() => setFailed(true));
    rendezvousService.listMine().then((all) => setRdvs(all.filter((r) => r.subService?.isCultural))).catch(() => undefined);
    demandeService.listMine().then((all) => setDemandes(all.filter((d) => d.subService?.service?.isCultural))).catch(() => undefined);
    cultureService.listThreads().then(setThreads).catch(() => undefined);
  }, [user]);

  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace state={{ from: "/culture" }} />;

  const advisors = overview?.advisors ?? [];
  const upcoming = rdvs.filter((r) => RDV_ACTIVE.includes(r.status)).sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));

  return (
    <>
      <PageMeta title="Espace culturel" description="Rendez-vous, demandes et échanges avec le Conseiller Culturel de l'ambassade." />
      <PageBreadcrumb pageTitle="Espace culturel" />

      <div className="mx-auto max-w-5xl space-y-6">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3 bg-brand-500 px-5 py-4 text-white">
            <Palette className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-semibold">Espace culturel</h1>
              <p className="text-sm text-white/85">Un interlocuteur dédié pour vos projets, événements et questions culturelles.</p>
            </div>
          </div>
          <div className="p-5">
            {failed ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">L'espace culturel est momentanément indisponible. Réessayez dans quelques instants.</p>
            ) : advisors.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">Le Conseiller Culturel sera présenté ici très prochainement.</p>
            ) : (
              <ul className="flex flex-wrap gap-6">
                {advisors.map((a) => (
                  <li key={a.name} className="flex items-center gap-3">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200" aria-hidden>
                      {initialsOf(a.name)}
                    </span>
                    <span>
                      <span className="block font-semibold text-gray-900 dark:text-white">{a.name}</span>
                      <span className="block text-sm text-gray-600 dark:text-gray-400">{a.title}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              Ici, contrairement aux autres services de l'ambassade, vous échangez <strong>à visage découvert</strong> : le Conseiller Culturel vous répond en son nom, et vos messages lui sont adressés personnellement.
            </p>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <ActionCard to="/services/rendez-vous/nouveau?culture=1" icon={CalendarPlus} title="Prendre rendez-vous" text="Réservez un entretien avec le Conseiller Culturel." />
          <ActionCard to="/culture/demande" icon={FileText} title="Adresser une demande" text="Projet, partenariat, soutien à un événement, information." />
          <ActionCard to="/culture/echanges/nouveau" icon={MessageCircle} title="Écrire au conseiller" text="Posez une question ou échangez directement par message." />
        </div>

        <Section title="Mes rendez-vous culturels" hasItems={upcoming.length > 0} empty="Aucun rendez-vous à venir.">
          {upcoming.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium capitalize text-gray-900 dark:text-white">
                  {formatDay(r.date)} · {r.startTime}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {r.subService?.name}
                  {r.advisor ? ` — avec ${r.advisor.name}` : ""} · Ticket {r.ticketId}
                </p>
                {r.motif && <p className="text-sm text-gray-700 dark:text-gray-300">Motif : {r.motif}</p>}
              </div>
              <Badge variant="light" color={r.status === "CONFIRMED" ? "success" : "warning"}>
                {RDV_LABEL[r.status] ?? r.status}
              </Badge>
            </div>
          ))}
          {upcoming.length > 0 && (
            <div className="pt-3 text-right">
              <Link to="/services/rendez-vous" className="text-sm text-brand-600 hover:underline">
                Gérer mes rendez-vous
              </Link>
            </div>
          )}
        </Section>

        <Section title="Mes demandes culturelles" hasItems={demandes.length > 0} empty="Vous n'avez pas encore adressé de demande.">
          {demandes.map((d) => (
            <button key={d.id} type="button" onClick={() => navigate(`/services/mesdemandes/details/${d.id}`)} className="flex w-full flex-wrap items-center justify-between gap-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/[0.02]">
              <span className="min-w-0">
                <span className="block font-medium text-gray-900 dark:text-white">{d.subService?.name ?? "Demande"}</span>
                <span className="block text-sm text-gray-600 dark:text-gray-400">
                  Dossier {d.dossierNumber}
                  {d.advisor ? ` — suivi par ${d.advisor.name}` : ""}
                </span>
              </span>
              <Badge variant="light" color={d.status === "APPROVED" || d.status === "COMPLETED" ? "success" : d.status === "REJECTED" ? "error" : "info"}>
                {DEMANDE_LABEL[d.status] ?? d.status}
              </Badge>
            </button>
          ))}
        </Section>

        <Section title="Mes échanges avec le conseiller" hasItems={threads.length > 0} empty="Aucun échange pour le moment.">
          {threads.map((t) => {
            const st = THREAD_STATUS[t.status];
            return (
              <button key={t.id} type="button" onClick={() => navigate(`/culture/echanges/${t.id}`)} className="flex w-full flex-wrap items-center justify-between gap-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                <span className="min-w-0">
                  <span className="block font-medium text-gray-900 dark:text-white">{t.subject}</span>
                  <span className="block text-sm text-gray-600 dark:text-gray-400">
                    {t.advisor.name ? `Avec ${t.advisor.name} · ` : ""}dernier message le {formatWhen(t.lastMessageAt)}
                  </span>
                </span>
                <Badge variant="light" color={st.color}>
                  {st.label}
                </Badge>
              </button>
            );
          })}
        </Section>
      </div>
    </>
  );
}
