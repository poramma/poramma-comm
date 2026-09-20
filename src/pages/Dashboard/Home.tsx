import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, XCircle, FileText, BellRing, Inbox, Calendar, Megaphone } from "lucide-react";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import RegistrationStatusCard from "../../components/registration/RegistrationStatusCard";
import { useAuth } from "../../context/AuthContext";
import { campagneService, demandeService, documentService, notificationService, rendezvousService } from "../../lib/services";
import type { Campagne, Demande, MyDocument, NotificationItem, RendezVous } from "../../lib/types";

const IN_PROGRESS = ["SUBMITTED", "IN_REVIEW", "UNDER_VERIFICATION", "ADDITIONAL_INFO_REQUIRED"];
const DONE = ["APPROVED", "COMPLETED"];

const STATUS_LABELS: Record<string, { label: string; color: "brand" | "success" | "error" | "warning" | "light" }> = {
  DRAFT: { label: "Brouillon", color: "light" },
  SUBMITTED: { label: "Soumise", color: "brand" },
  IN_REVIEW: { label: "En cours d'examen", color: "brand" },
  ADDITIONAL_INFO_REQUIRED: { label: "Complément requis", color: "warning" },
  UNDER_VERIFICATION: { label: "En vérification", color: "brand" },
  APPROVED: { label: "Approuvée", color: "success" },
  REJECTED: { label: "Rejetée", color: "error" },
  COMPLETED: { label: "Terminée", color: "success" },
  CANCELLED: { label: "Annulée", color: "light" },
  ARCHIVED: { label: "Archivée", color: "light" },
};

const DOC_STATUS_LABELS: Record<string, string> = {
  UPLOADED: "Reçu",
  IN_REVIEW: "En cours de vérification",
  ACCEPTED: "Accepté",
  REJECTED: "Refusé",
  EXPIRED: "Expiré",
};

const RDV_STATUS: Record<string, { label: string; color: "brand" | "success" | "error" | "warning" | "light" }> = {
  PENDING: { label: "En attente", color: "warning" },
  CONFIRMED: { label: "Confirmé", color: "success" },
  CHECKED_IN: { label: "Enregistré", color: "brand" },
  IN_PROGRESS: { label: "En cours", color: "brand" },
  COMPLETED: { label: "Terminé", color: "light" },
  MISSED: { label: "Manqué", color: "error" },
  CANCELLED_BY_USER: { label: "Annulé", color: "light" },
  CANCELLED_BY_AGENT: { label: "Annulé par l'ambassade", color: "error" },
  NO_SHOW: { label: "Absence", color: "error" },
};
const RDV_UPCOMING = ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"];

const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("fr-FR") : "");
/** Date sans heure (AAAA-MM-JJ) — évite le décalage de fuseau d'un `new Date("AAAA-MM-JJ")`. */
const formatDay = (day: string) => new Date(`${day}T00:00:00`).toLocaleDateString("fr-FR");

const StatCard = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) => (
  <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6 flex items-center gap-4">
    <div className="p-4 rounded-full bg-brand-50 dark:bg-brand-900/20">
      <Icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
    </div>
    <div className="flex-1">
      <div className="text-sm text-slate-500 dark:text-slate-300">{label}</div>
      <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</div>
    </div>
  </div>
);

/** Tableau de bord du membre : statut d'enregistrement, ses demandes, ses pièces, ses notifications — données réelles. */
export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [documents, setDocuments] = useState<MyDocument[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [campagnes, setCampagnes] = useState<Campagne[]>([]);

  useEffect(() => {
    // Le tableau de bord reste utilisable même si un des blocs échoue.
    demandeService.listMine().then(setDemandes).catch(() => undefined);
    rendezvousService.listMine().then(setRendezVous).catch(() => undefined);
    campagneService.list({ limit: 3 }).then(setCampagnes).catch(() => undefined);
    documentService.listMine().then(setDocuments).catch(() => undefined);
    notificationService.list().then(setNotifications).catch(() => undefined);
  }, []);

  // Les rendez-vous à venir d'abord (le plus proche en tête), puis les plus récents de l'historique.
  const when = (r: RendezVous) => `${r.date} ${r.startTime}`;
  const recentRendezVous = [
    ...rendezVous.filter((r) => RDV_UPCOMING.includes(r.status)).sort((a, b) => when(a).localeCompare(when(b))),
    ...rendezVous.filter((r) => !RDV_UPCOMING.includes(r.status)).sort((a, b) => when(b).localeCompare(when(a))),
  ].slice(0, 5);

  const firstName = user?.profile?.firstName;
  const inProgress = demandes.filter((d) => IN_PROGRESS.includes(d.status)).length;
  const done = demandes.filter((d) => DONE.includes(d.status)).length;
  const rejected = demandes.filter((d) => d.status === "REJECTED").length;

  return (
    <div className="p-2 lg:p-1 space-y-6">
      <header>
        <h1 className="md:text-2xl text-xl font-extrabold text-slate-900 dark:text-white">
          {firstName ? `Bonjour ${firstName}` : "Bienvenue"}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Un aperçu de vos démarches, de vos pièces et de vos notifications.</p>
      </header>

      <RegistrationStatusCard />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="En cours" value={inProgress} />
        <StatCard icon={CheckCircle} label="Terminées" value={done} />
        <StatCard icon={XCircle} label="Rejetées" value={rejected} />
        <StatCard icon={Inbox} label="Total" value={demandes.length} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Mes dernières demandes</h2>
              <Button variant="ghost" onClick={() => navigate("/services/mesdemandes/gerer")}>Voir toutes mes demandes</Button>
            </div>
            {demandes.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Vous n'avez pas encore de demande.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 uppercase">
                      <th className="px-3 py-2">N° dossier</th>
                      <th className="px-3 py-2">Service</th>
                      <th className="px-3 py-2">Soumission</th>
                      <th className="px-3 py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {demandes.slice(0, 5).map((d) => {
                      const s = STATUS_LABELS[d.status] ?? { label: d.status, color: "light" as const };
                      return (
                        <tr
                          key={d.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer"
                          onClick={() => navigate(`/services/mesdemandes/details/${d.id}`)}
                        >
                          <td className="px-3 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">{d.dossierNumber}</td>
                          <td className="px-3 py-3 text-sm text-slate-600 dark:text-slate-300">{d.subService?.name ?? "—"}</td>
                          <td className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(d.submittedAt)}</td>
                          <td className="px-3 py-3">
                            <Badge variant="outline" color={s.color}>{s.label}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Mes rendez-vous récents</h2>
              <Button variant="ghost" onClick={() => navigate("/services/rendez-vous")}>Voir tous mes rendez-vous</Button>
            </div>
            {recentRendezVous.length === 0 ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">Vous n'avez pas encore de rendez-vous.</p>
                <Button size="sm" variant="outline" onClick={() => navigate("/services/rendez-vous/nouveau")}>
                  <Calendar className="w-4 h-4 mr-2" /> Prendre un rendez-vous
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 uppercase">
                      <th className="px-3 py-2">Service</th>
                      <th className="px-3 py-2">Date et heure</th>
                      <th className="px-3 py-2">Ticket</th>
                      <th className="px-3 py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {recentRendezVous.map((r) => {
                      const s = RDV_STATUS[r.status] ?? { label: r.status, color: "light" as const };
                      return (
                        <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer" onClick={() => navigate("/services/rendez-vous")}>
                          <td className="px-3 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">{r.subService?.name ?? "—"}</td>
                          <td className="px-3 py-3 text-sm text-slate-600 dark:text-slate-300">
                            {formatDay(r.date)} à {r.startTime}
                          </td>
                          <td className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">{r.ticketId}</td>
                          <td className="px-3 py-3">
                            <Badge variant="outline" color={s.color}>{s.label}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Mes pièces déposées</h3>
            {documents.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Aucune pièce déposée pour l'instant.</p>
            ) : (
              <ul className="space-y-3">
                {documents.slice(0, 6).map((doc) => (
                  <li key={doc.id} className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-100">{doc.file?.originalName ?? "Document"}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{DOC_STATUS_LABELS[doc.status] ?? doc.status}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Annonces</h3>
              <Button size="sm" variant="ghost" onClick={() => navigate("/campagnes")}>Tout voir</Button>
            </div>
            {campagnes.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Aucune annonce pour le moment.</p>
            ) : (
              <ul className="space-y-3">
                {campagnes.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => navigate(`/campagnes/${c.id}`)} className="flex w-full items-start gap-3 text-left">
                      <Megaphone className="w-4 h-4 mt-1 shrink-0 text-brand-600" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-2">{c.title}</span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">{formatDate(c.publishedAt ?? undefined)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
              <Button size="sm" variant="ghost" onClick={() => navigate("/notifications")}>Tout voir</Button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Aucune notification.</p>
            ) : (
              <ul className="space-y-3">
                {notifications.slice(0, 4).map((n) => (
                  <li key={n.id} className="flex items-start gap-3">
                    <BellRing className={`w-4 h-4 mt-1 ${n.status === "SENT" ? "text-brand-600" : "text-slate-400"}`} />
                    <div>
                      <div className="text-sm text-slate-800 dark:text-slate-100">{n.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{formatDate(n.createdAt)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
