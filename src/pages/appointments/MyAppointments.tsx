// src/pages/appointments/MyAppointments.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Filter,
  Search,
  Download,
  X,
  UserCircle2,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronDown,
} from "lucide-react";
import Avatar from "../../components/ui/avatar/Avatar";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal"; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// Add this after your imports
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: any; // You can make this more specific if you know the exact type
  }
}
import QRCode from "qrcode";

/* -----------------------------------------
   Types & helpers
------------------------------------------ */
type AppointmentStatus = "EN_ATTENTE" | "VALIDEE" | "ANNULEE" | "TERMINEE";

type Appointment = {
  id: string;
  service: string;
  subservice?: string;
  agent: { id: string; name: string; role: string; avatarUrl?: string };
  dateISO: string;
  status: AppointmentStatus;
  motif?: string; // si refusé/annulé
  ticketId?: string; // défini si validé
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString();
};

const statusConfig: Record<
  AppointmentStatus,
  { label: string; color: "solid" | "outline"; tone: "brand" | "warning" | "error" | "success" | "neutral"; icon: React.ElementType }
> = {
  EN_ATTENTE: { label: "En attente", color: "outline", tone: "warning", icon: Clock3 },
  VALIDEE: { label: "Validée", color: "solid", tone: "success", icon: CheckCircle2 },
  ANNULEE: { label: "Annulée", color: "outline", tone: "error", icon: XCircle },
  TERMINEE: { label: "Terminée", color: "outline", tone: "neutral", icon: Calendar },
};

// mini Badge selon ton thème
const StatusBadge: React.FC<{ status: AppointmentStatus }> = ({ status }) => {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  const toneToClasses: Record<typeof cfg.tone, string> = {
    brand: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
    success: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300",
    warning: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300",
    error: "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-300",
    neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  const outlineToneToClasses: Record<typeof cfg.tone, string> = {
    brand: "ring-1 ring-inset ring-brand-300 text-brand-700 dark:text-brand-300 dark:ring-brand-800",
    success: "ring-1 ring-inset ring-success-300 text-success-700 dark:text-success-300 dark:ring-success-800",
    warning: "ring-1 ring-inset ring-warning-300 text-warning-700 dark:text-warning-300 dark:ring-warning-800",
    error: "ring-1 ring-inset ring-error-300 text-error-700 dark:text-error-300 dark:ring-error-800",
    neutral: "ring-1 ring-inset ring-gray-300 text-gray-700 dark:text-gray-300 dark:ring-gray-700",
  };

  const cls =
    cfg.color === "solid" ? `${toneToClasses[cfg.tone]} px-2.5 py-1` : `${outlineToneToClasses[cfg.tone]} px-2.5 py-1`;

  return (
    <span className={`inline-flex items-center gap-1 rounded-lg text-xs ${cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

/* -----------------------------------------
   Mock data (remplace plus tard par ton API)
------------------------------------------ */
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "A-2025-0001",
    service: "Passeport",
    subservice: "Renouvellement",
    agent: { id: "ag1", name: "Fatoumata Koné", role: "Agent passeport", avatarUrl: "/images/user/user-04.jpg" },
    dateISO: "2025-08-20T09:30:00Z",
    status: "VALIDEE",
    ticketId: "TCK-PA-0001",
  },
  {
    id: "A-2025-0002",
    service: "Carte consulaire",
    subservice: "Nouvelle demande",
    agent: { id: "ag2", name: "Aïssata Diarra", role: "Affaires consulaires", avatarUrl: "/images/user/user-04.jpg" },
    dateISO: "2025-08-18T13:00:00Z",
    status: "EN_ATTENTE",
  },
  {
    id: "A-2025-0003",
    service: "Visa et voyage",
    subservice: "Visa 3 mois",
    agent: { id: "ag3", name: "Fatoumata Koné", role: "Visa & Entrées", avatarUrl: "/images/user/user-04.jpg" },
    dateISO: "2025-08-05T10:00:00Z",
    status: "ANNULEE",
    motif: "Conflit d'agenda — merci de reprogrammer.",
  },
  {
    id: "A-2025-0004",
    service: "Légalisations diverses",
    subservice: "Légalisation acte de naissance",
    agent: { id: "ag4", name: "Ibrahima Coulibaly", role: "État civil", avatarUrl: "/images/user/user-05.jpg" },
    dateISO: "2025-07-15T14:30:00Z",
    status: "TERMINEE",
  },
];

/* -----------------------------------------
   Page
------------------------------------------ */
const MyAppointments: React.FC = () => {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<AppointmentStatus | "ALL">("ALL");
  const [service, setService] = React.useState<string>("ALL");
  const [from, setFrom] = React.useState<string>("");
  const [to, setTo] = React.useState<string>("");

  const [data, setData] = React.useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [cancelTarget, setCancelTarget] = React.useState<Appointment | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);

  const services = React.useMemo(() => {
    const set = new Set(data.map((a) => a.service));
    return ["ALL", ...Array.from(set)];
  }, [data]);

  const filtered = React.useMemo(() => {
    return data
      .filter((a) => (status === "ALL" ? true : a.status === status))
      .filter((a) => (service === "ALL" ? true : a.service === service))
      .filter((a) => {
        if (!from && !to) return true;
        const t = new Date(a.dateISO).getTime();
        const f = from ? new Date(from).getTime() : -Infinity;
        const tt = to ? new Date(to).getTime() + 24 * 3600 * 1000 - 1 : Infinity; // inclut fin de journée
        return t >= f && t <= tt;
      })
      .filter((a) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          a.id.toLowerCase().includes(q) ||
          a.service.toLowerCase().includes(q) ||
          (a.subservice ?? "").toLowerCase().includes(q) ||
          a.agent.name.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
  }, [data, status, service, from, to, query]);

  const canCancel = (st: AppointmentStatus) => st === "EN_ATTENTE" || st === "VALIDEE";

  const confirmCancel = () => {
    if (!cancelTarget) return;
    setData((prev) =>
      prev.map((a) => (a.id === cancelTarget.id ? { ...a, status: "ANNULEE", motif: "Annulation par l’usager." } : a)),
    );
    setCancelTarget(null);
  };

  /**
 * Télécharge le ticket officiel PDF avec logo, QR code et mise en page
 */
const downloadTicket = async (a: Appointment) => {
    if (!a.ticketId) return;
  
    const doc = new jsPDF();
    const isDark = document.documentElement.classList.contains("dark");
    const primaryColor = isDark ? "#38BDF8" : "#00572C";
    const textColor = isDark ? "#FFFFFF" : "#000000";
    const secondaryText = isDark ? "#9CA3AF" : "#4B5563";
  
    // Charger logo en PNG base64
    const logoBase64 = await fetch("/images/logo/fivision-logo.png")
      .then(res => res.blob())
      .then(
        blob =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          })
      );
  
    // Générer QR code haute qualité
    const qrData = await QRCode.toDataURL(a.ticketId, {
      width: 80,
      margin: 1,
      color: { dark: textColor, light: "#FFFFFF" }
    });
  
    /** HEADER **/
    doc.addImage(logoBase64, "PNG", 15, 10, 15, 15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(primaryColor);
    doc.text("TICKET DE RENDEZ-VOUS OFFICIEL", 105, 20, { align: "center" });
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, 28, 190, 28);
  
    /** INFOS PRINCIPALES **/
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
  
    addInfo("Numéro de ticket :", a.ticketId);
    addInfo("Dossier :", a.id);
    addInfo("Service :", `${a.service}${a.subservice ? " - " + a.subservice : ""}`);
    addInfo("Agent :", `${a.agent.name} (${a.agent.role})`);
    addInfo("Date :", formatDateTime(a.dateISO));
    addInfo("Statut :", statusConfig[a.status].label);
  
    /** QR CODE **/
    doc.addImage(qrData, "PNG", 150, 40, 25, 25);
  
    /** ZONE SIGNATURE **/
    y += 10;
    doc.setFont("helvetica", "italic");
    doc.setTextColor(secondaryText);
    doc.setFontSize(10);
    doc.text("Cachet / Signature :", 20, y);
    doc.setDrawColor("#9CA3AF");
    doc.rect(20, y + 3, 60, 20);
  
    /** MENTIONS LÉGALES **/
    doc.setTextColor(secondaryText);
    doc.setFontSize(9);
    doc.text(
      "Veuillez vous présenter 10 minutes à l’avance avec vos pièces justificatives.\n" +
        "Ce document est strictement personnel et ne peut être falsifié.",
      20,
      130,
      { maxWidth: 170 }
    );
  
    /** SAUVEGARDE **/
    doc.save(`${a.ticketId}.pdf`);
  };
  

  return (
    <div className="md:p-4 p-2 space-y-6">
      {/* Header */}
      <div className="flex lg:flex-row flex-col items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mes rendez-vous
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Retrouvez l’historique de vos prises de rendez-vous, filtrez, annulez, ou téléchargez votre ticket.
          </p>
        </div>

        {/* Call to action */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
            <Filter className="w-4 h-4 mr-2" /> Filtres
            <ChevronDown className={"w-4 h-4 ml-2 transition-transform duration-200 ease-in-out " + (showFilters ? "rotate-180" : "")} />
          </Button>
          <Button onClick={() => (window.location.href = "/services/rendez-vous/nouveau")}>
            <Calendar className="w-4 h-4" /> Rendez-vous
          </Button>
        </div>
      </div>

      {showFilters && (
      <motion.div
      layout
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-theme-xs"
    >
      {/* Search */}
      <div className="flex-1 relative lg:flex lg:items-center lg:gap-2 mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par service, agent, dossier…"
          className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        {/* status */}
        <select
          aria-label="Filtrage par status"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="h-11 w-full lg:w-48 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm text-gray-800 dark:text-white focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
        >
          <option value="ALL">Tous statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="VALIDEE">Validée</option>
          <option value="ANNULEE">Annulée</option>
          <option value="TERMINEE">Terminée</option>
        </select>

        {/* service */}
        <select
          aria-label="Filtrage par Service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="h-11 w-full lg:w-56 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm text-gray-800 dark:text-white focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
        >
          {services.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "Tous services" : s}
            </option>
          ))}
        </select>

        {/* dates */}
        <div className="flex gap-2 w-full lg:w-auto">
          <input
            aria-label="Date de début"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-11 w-full lg:w-44 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm text-gray-800 dark:text-white focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
          />
          <input
            aria-label="Date de fin"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-11 w-full lg:w-44 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm text-gray-800 dark:text-white focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
          />
        </div>
      </div>

      {/* tags actifs (chips) */}
      <div className="flex flex-wrap gap-2 mt-3">
        {query && (
          <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <Search className="w-3.5 h-3.5" />
            {query}
            <button
            title=" Annuler"
             className="ml-1" onClick={() => setQuery("")}>
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}
        {status !== "ALL" && (
          <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
            Statut: {statusConfig[status].label}
            <button 
              title="Annuler"
              className="ml-1" onClick={() => setStatus("ALL")}>
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}
        {service !== "ALL" && (
          <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
            Service: {service}
            <button 
              title="Annuler"
              className="ml-1" onClick={() => setService("ALL")}>
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}
        {(from || to) && (
          <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
            Période: {from || "…"} → {to || "…"}
            <button
              title="Annuler"
              className="ml-1"
              onClick={() => {
                setFrom("");
                setTo("");
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}
      </div>
    </motion.div>
        
      )}

      {/* Liste des rendez-vous */}
      <section className="space-y-3">
        <AnimatePresence initial={false}>
          {filtered.map((a) => {
            const canUserCancel = canCancel(a.status);
            const isValidated = a.status === "VALIDEE" && a.ticketId;

            return (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-theme-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  {/* agent & service */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar name={a.agent.name} src={a.agent.avatarUrl ?? ""} />
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {a.service}
                        {a.subservice ? (
                          <span className="text-gray-500 dark:text-gray-400 font-normal"> — {a.subservice}</span>
                        ) : null}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                        <UserCircle2 className="w-4 h-4" />
                        {a.agent.name} · {a.agent.role}
                      </div>
                    </div>
                  </div>

                  {/* date */}
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {formatDateTime(a.dateISO)}
                  </div>

                  {/* statut */}
                  <div className="sm:w-40">
                    <StatusBadge status={a.status} />
                  </div>

                  {/* actions */}
                  <div className="flex items-center gap-2 sm:justify-end">
                    {isValidated ? (
                      <Button size="sm" onClick={() => downloadTicket(a)}>
                        <Download className="w-4 h-4 mr-2" />
                        Ticket
                      </Button>
                    ) : a.motif ? (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Motif: {a.motif}
                      </span>
                    ) : null}

                    {canUserCancel && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCancelTarget(a)}
                      >
                        Annuler
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-brand-600 dark:text-brand-300" />
            </div>
            <h3 className="mt-4 text-gray-900 dark:text-white font-medium">
              Aucun rendez-vous trouvé
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Ajustez vos filtres ou réservez un nouveau rendez-vous.
            </p>
            <div className="mt-4">
              <Button onClick={() => (window.location.href = "/services/rendez-vous/nouveau")}>
                Prendre un rendez-vous
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Modal annulation */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        className="max-w-lg"
        showCloseButton
      >
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-error-50 dark:bg-error-500/10 flex items-center justify-center">
              <X className="w-5 h-5 text-error-600 dark:text-error-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Annuler ce rendez-vous ?
            </h3>
          </div>

          <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
            {cancelTarget ? (
              <>
                Dossier <strong>{cancelTarget.id}</strong> — {cancelTarget.service}
                {cancelTarget.subservice ? ` • ${cancelTarget.subservice}` : ""} <br />
                Programmé le <strong>{formatDateTime(cancelTarget.dateISO)}</strong>.
              </>
            ) : null}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Fermer
            </Button>
            <Button onClick={confirmCancel}>Confirmer l’annulation</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyAppointments;
