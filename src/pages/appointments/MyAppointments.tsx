// src/pages/appointments/MyAppointments.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Search, ChevronDown, Clock3, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import Button from "../../components/ui/button/Button";
import AppointmentMessages from "./AppointmentMessages";
import { Modal } from "../../components/ui/modal";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { useNavigate } from "react-router-dom";
import { rendezvousService } from "../../lib/services";
import type { RendezVous } from "../../lib/types";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const STATUS_LABELS: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  PENDING: { label: "En attente de confirmation", icon: Clock3, className: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300" },
  CONFIRMED: { label: "Confirmé", icon: CheckCircle2, className: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300" },
  CHECKED_IN: { label: "Enregistré à l'accueil", icon: CheckCircle2, className: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300" },
  IN_PROGRESS: { label: "En cours", icon: Clock3, className: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300" },
  COMPLETED: { label: "Terminé", icon: CheckCircle2, className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  MISSED: { label: "Manqué", icon: XCircle, className: "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-300" },
  CANCELLED_BY_USER: { label: "Annulé par vous", icon: XCircle, className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  CANCELLED_BY_AGENT: { label: "Annulé par l'ambassade", icon: XCircle, className: "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-300" },
  NO_SHOW: { label: "Absence", icon: XCircle, className: "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-300" },
};

/** Rendez-vous encore « vivants » : affichés en premier, les autres vont dans l'historique. */
const UPCOMING = ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_LABELS[status] ?? { label: status, icon: Clock3, className: "bg-gray-100 text-gray-700" };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg text-xs px-2.5 py-1 ${cfg.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

const byWhen = (a: RendezVous, b: RendezVous) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`);

const MyAppointments: React.FC = () => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [data, setData] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [toCancel, setToCancel] = useState<RendezVous | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [messagesFor, setMessagesFor] = useState<RendezVous | null>(null);
  const navigate = useNavigate();

  const load = () =>
    rendezvousService
      .listMine()
      .then(setData)
      .catch(() => toast.error("Impossible de charger vos rendez-vous"))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      data
        .filter((a) => (status === "ALL" ? true : a.status === status))
        .filter((a) => !query.trim() || (a.subService?.name ?? "").toLowerCase().includes(query.toLowerCase())),
    [data, status, query]
  );
  const upcoming = filtered.filter((a) => UPCOMING.includes(a.status)).sort(byWhen);
  const history = filtered.filter((a) => !UPCOMING.includes(a.status)).sort((a, b) => byWhen(b, a));

  const confirmCancel = async () => {
    if (!toCancel) return;
    setCancelling(true);
    try {
      await rendezvousService.cancel(toCancel.id);
      toast.success("Votre rendez-vous a été annulé.");
      setToCancel(null);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Impossible d'annuler ce rendez-vous");
    } finally {
      setCancelling(false);
    }
  };

  const downloadTicket = async (a: RendezVous) => {
    const doc = new jsPDF();
    const isDark = document.documentElement.classList.contains("dark");
    const primaryColor = isDark ? "#38BDF8" : "#00572C";
    const textColor = isDark ? "#FFFFFF" : "#000000";
    const secondaryText = isDark ? "#9CA3AF" : "#4B5563";

    const qrData = await QRCode.toDataURL(a.ticketId, { width: 80, margin: 1, color: { dark: textColor, light: "#FFFFFF" } });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(primaryColor);
    doc.text("TICKET DE RENDEZ-VOUS", 105, 20, { align: "center" });
    doc.setDrawColor(primaryColor);
    doc.line(20, 28, 190, 28);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    let y = 40;
    const addInfo = (label: string, value: string) => {
      doc.setTextColor(secondaryText);
      doc.text(label, 20, y);
      doc.setTextColor(textColor);
      doc.setFont("helvetica", "bold");
      doc.text(value, 70, y);
      doc.setFont("helvetica", "normal");
      y += 8;
    };
    addInfo("Ticket :", a.ticketId);
    addInfo("Service :", a.subService?.name ?? "—");
    addInfo("Date :", formatDay(a.date));
    addInfo("Heure :", `${a.startTime} – ${a.endTime}`);
    addInfo("Statut :", STATUS_LABELS[a.status]?.label ?? a.status);

    doc.addImage(qrData, "PNG", 150, 40, 25, 25);
    doc.save(`rdv-${a.ticketId}.pdf`);
  };

  const renderCard = (a: RendezVous) => (
    <motion.div
      key={a.id}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-theme-xs"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 dark:text-white truncate">{a.subService?.name ?? "Service"}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
            {formatDay(a.date)} · {a.startTime} – {a.endTime}
          </div>
          {a.motif && <div className="mt-0.5 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">Motif : {a.motif}</div>}
          <div className="text-xs text-gray-500 dark:text-gray-500">Ticket {a.ticketId}</div>
          {a.advisor && (
            <div className="mt-1 text-xs font-medium text-brand-700 dark:text-brand-300">
              Avec {a.advisor.name} — {a.advisor.title}
            </div>
          )}
        </div>
        <div className="lg:w-56">
          <StatusBadge status={a.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {a.status === "CONFIRMED" && (
            <Button size="sm" onClick={() => downloadTicket(a)}>
              Ticket
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setMessagesFor(a)}>
            <MessageSquare className="w-4 h-4 mr-1" />
            Messages
          </Button>
          {a.canModify && (
            <>
              <Button size="sm" variant="outline" onClick={() => navigate(`/services/rendez-vous/nouveau?reschedule=${a.id}`)}>
                Déplacer
              </Button>
              <Button size="sm" variant="outline" onClick={() => setToCancel(a)}>
                Annuler
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="md:p-4 p-2 space-y-6">
      <ToastContainer />
      <div className="flex lg:flex-row flex-col items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Suivez vos rendez-vous à l'ambassade, déplacez-les ou annulez-les, et téléchargez votre ticket une fois confirmés.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
            <ChevronDown className={"w-4 h-4 mr-2 transition-transform duration-200 " + (showFilters ? "rotate-180" : "")} />
            Filtres
          </Button>
          <Button onClick={() => navigate("/services/rendez-vous/nouveau")}>
            <Calendar className="w-4 h-4 mr-2" /> Nouveau rendez-vous
          </Button>
        </div>
      </div>

      {showFilters && (
        <motion.div layout className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-theme-xs">
          <div className="flex-1 relative lg:flex lg:items-center lg:gap-2 mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par service…"
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm text-gray-800 dark:text-white"
            />
          </div>
          <select
            aria-label="Filtrage par statut"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 w-full lg:w-72 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm text-gray-800 dark:text-white"
          >
            <option value="ALL">Tous statuts</option>
            {Object.entries(STATUS_LABELS).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">À venir</h2>
              <AnimatePresence initial={false}>{upcoming.map(renderCard)}</AnimatePresence>
            </section>
          )}
          {history.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Historique</h2>
              <AnimatePresence initial={false}>{history.map(renderCard)}</AnimatePresence>
            </section>
          )}
          {filtered.length === 0 && (
            <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
              <div className="mx-auto w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-brand-600 dark:text-brand-300" />
              </div>
              <h3 className="mt-4 text-gray-900 dark:text-white font-medium">Aucun rendez-vous trouvé</h3>
              <div className="mt-4">
                <Button onClick={() => navigate("/services/rendez-vous/nouveau")}>Prendre un rendez-vous</Button>
              </div>
            </div>
          )}
        </>
      )}

      {messagesFor && <AppointmentMessages rendezVous={messagesFor} onClose={() => setMessagesFor(null)} />}

      {toCancel && (
        <Modal isOpen={true} onClose={() => setToCancel(null)} className="max-w-md p-6">
          <h2 className="text-xl font-bold mb-2">Annuler ce rendez-vous ?</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 capitalize">
            {toCancel.subService?.name} — {formatDay(toCancel.date)} à {toCancel.startTime}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Le créneau sera libéré. Vous pourrez reprendre un rendez-vous à tout moment.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setToCancel(null)} disabled={cancelling}>
              Conserver
            </Button>
            <Button onClick={confirmCancel} disabled={cancelling}>
              {cancelling ? "Annulation…" : "Oui, annuler"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyAppointments;
