// src/pages/DashboardStudent.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge  from '../../components/ui/badge/Badge';
import Button  from '../../components/ui/button/Button';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/ui/loader/Loader';
 import {
  User,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  BellRing,
  DownloadCloud,
  Inbox,
} from "lucide-react"; // icons (fallback lucide)

/**
 * Dashboard étudiant - React + TypeScript + Tailwind
 *
 * Remarques d'intégration :
 * - Remplacer les imports de components (Avatar, Badge, Button, Modal) si votre repo TailAdmin a des chemins différents.
 * - Les données ci-dessous sont des mock JSON. Remplace par l'appel à ton API (fetch/axios) ou contexte d'auth.
 */

/* ---------------------------
   Types
   ---------------------------*/
type RequestStatus = "EN_COURS" | "VALIDEE" | "REJETEE" | "EN_ATTENTE";

type RequestRow = {
  id: string;
  service: string;
  submittedAt: string; // ISO
  status: RequestStatus;
};

type Interaction = {
  id: string;
  date: string; // ISO
  type: "message" | "rendez-vous" | "document";
  summary: string;
  link?: string;
};

type NotificationItem = {
  id: string;
  type: "rappel" | "alerte" | "info";
  text: string;
  datetime: string;
};

type DocumentItem = {
  id: string;
  name: string;
  status: "PRET" | "A_COMPLETER" | "EN_ATTENTE_VALIDATION";
  downloadable: boolean;
};

/* ---------------------------
   Mock data
   ---------------------------*/
const mockUserName = "Moussa Diallo";

const statCards = [
  { id: "in_progress", label: "En cours", value: 3, icon: Clock },
  { id: "validated", label: "Validées", value: 12, icon: CheckCircle },
  { id: "rejected", label: "Rejetées", value: 1, icon: XCircle },
  { id: "pending", label: "En attente", value: 2, icon: Inbox },
];

const mockRequests: RequestRow[] = [
  { id: "2025-001", service: "Renouvellement carte consulaire", submittedAt: "2025-07-30T10:15:00Z", status: "EN_COURS" },
  { id: "2025-002", service: "Attestation d'études", submittedAt: "2025-06-14T09:00:00Z", status: "VALIDEE" },
  { id: "2025-003", service: "Demande de bourse", submittedAt: "2025-07-01T14:20:00Z", status: "EN_ATTENTE" },
  { id: "2025-004", service: "Certificat de perte", submittedAt: "2025-05-04T08:10:00Z", status: "REJETEE" },
];

const mockInteractions: Interaction[] = [
  { id: "i1", date: "2025-08-01T08:00:00Z", type: "message", summary: "Réponse sur la liste des documents requis", link: "#" },
  { id: "i2", date: "2025-07-28T11:30:00Z", type: "rendez-vous", summary: "Rdv validé pour le 2025-08-05 09:00", link: "#" },
  { id: "i3", date: "2025-07-15T15:45:00Z", type: "document", summary: "Document reçu : preuve d'inscription", link: "#" },
];

const mockNotifications: NotificationItem[] = [
  { id: "n1", type: "rappel", text: "Compléter la pièce: justificatif de domicile", datetime: "2025-08-05T09:00:00Z" },
  { id: "n2", type: "alerte", text: "Temps limite pour dépôt de dossier proche (72h)", datetime: "2025-08-03T11:00:00Z" },
  { id: "n3", type: "info", text: "La permanence consulaire sera fermée le 14 août", datetime: "2025-08-10T00:00:00Z" },
];

const mockDocuments: DocumentItem[] = [
  { id: "d1", name: "Attestation d'inscription (2025)", status: "PRET", downloadable: true },
  { id: "d2", name: "Formulaire demande carte consulaire", status: "A_COMPLETER", downloadable: false },
  { id: "d3", name: "Reçu paiement (2024)", status: "EN_ATTENTE_VALIDATION", downloadable: true },
];

/* ---------------------------
   Small helpers
   ---------------------------*/
const statusBadge = (status: RequestStatus) => {
  switch (status) {
    case "EN_COURS":
      return <Badge variant="outline" color="info">En cours</Badge>;
    case "VALIDEE":
      return <Badge variant="solid" color="success">Validée</Badge>;
    case "REJETEE":
      return <Badge variant="solid" color="error">Rejetée</Badge>;
    case "EN_ATTENTE":
      return <Badge variant="outline" color="warning">En attente</Badge>;
    default:
      return <Badge>—</Badge>;
  }
};

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
};

/* ---------------------------
   Reusable small components
   ---------------------------*/
const StatCard: React.FC<{ icon: React.ComponentType<{ className?: string }>; label: string; value: number }> = ({ icon: IconComp, label, value }) => (
  <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6 flex items-center gap-4">
    <div className="p-4 rounded-full bg-brand-50 dark:bg-brand-900/20">
      <IconComp className="w-6 h-6 text-brand-600 dark:text-brand-400" />
    </div>
    <div className="flex-1">
      <div className="text-sm text-slate-500 dark:text-slate-300">{label}</div>
      <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</div>
    </div>
  </div>
);

/* ---------------------------
   Main page
   ---------------------------*/
export default function DashboardStudent() {
  
  const userName = mockUserName;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [data, setData] = useState({});

  useEffect(() => {
    // Simulation de chargement de données
    const fetchData = async () => {
      setLoading(true);
      try {
        // Vos appels API ici
        await new Promise(resolve => setTimeout(resolve, 5000));
        setData({/* vos données */});
      } catch (error) {
        console.error('Erreur de chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <PageLoader />;
  }
  

  return (
    <div className="p-2 lg:p-1 space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="md:text-2xl text-xl font-extrabold text-slate-900 dark:text-white">Espace Étudiant</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Un aperçu en temps réel de vos démarches et documents
          </p>
          {/* The text below is very important so it is bold. */}
          <p className="mt-1 text-sm font-bold text-slate-600 dark:text-slate-400">
            Enregistrez-vous au près de l'ambassade pour accéder à votre espace et gérer vos démarches.
          </p>
        </div>
        <div>
          <Button variant="primary" onClick={() => navigate("/auth/register")}>Je m'enregistre</Button>
        </div>
      </header>

      {/* Stat Cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((c) => (
            <StatCard key={c.id} icon={c.icon} label={c.label} value={c.value} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Requests table + Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requests table */}
          <section className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Statut des demandes</h2>
              <Button variant="ghost" onClick={() => { /* navigate to all requests */ }}>Voir toutes mes demandes</Button>
            </div>

            {/* table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase">
                    <th className="px-3 py-2">N° dossier</th>
                    <th className="px-3 py-2">Type de service</th>
                    <th className="px-3 py-2">Date de soumission</th>
                    <th className="px-3 py-2">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {mockRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="px-1 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">{r.id}</td>
                      <td className="px-1 py-3 text-sm text-slate-600 dark:text-slate-300">{r.service}</td>
                      <td className="px-1 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(r.submittedAt)}</td>
                      <td className="py-3">{statusBadge(r.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination placeholder - TailAdmin fournit un composant Pagination */}
            <div className="mt-4 flex justify-end">
              <div className="text-sm text-slate-500 dark:text-slate-400">1–{mockRequests.length} sur {mockRequests.length}</div>
            </div>
          </section>

          {/* Documents officiels */}
          <section className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Documents officiels</h3>
              <Button size="sm" variant="outline"
                onClick={() => navigate("/services/mesdemandes/gerer")}>
              Gérer mes documents</Button>
            </div>

            <ul className="space-y-3">
              {mockDocuments.map((doc) => (
                <li key={doc.id} className="flex lg:flex-row flex-col items-center justify-between gap-4 p-3 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900/30">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-100">{doc.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {doc.status === "PRET" ? "Prêt" : doc.status === "A_COMPLETER" ? "À compléter" : "En attente de validation"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.downloadable ? (
                      <Button size="sm" onClick={() => { /* download action */ }}>
                        <DownloadCloud className="w-4 h-4 mr-2" /> Télécharger
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => { /* complete action */ }}>Compléter</Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right column: Interactions + Notifications */}
        <aside className="space-y-6">
          {/* Interactions */}
          <section className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold md:text-lg text-base dark:text-white ">Rendez-vous</h4>
              <Button size="sm" variant="link"
                onClick={() => { navigate("/services/rendez-vous") }}>
                Voir tout
              </Button>
            </div>
            <ul className="space-y-3">
              {mockInteractions.map((it) => (
                <li key={it.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <div className="p-2 rounded-full bg-brand-50 dark:bg-brand-900/20">
                    {it.type === "message" && <User className="w-5 h-5 text-brand-600 " />}
                    {it.type === "rendez-vous" && <Clock className="w-5 h-5 text-brand-600" />}
                    {it.type === "document" && <FileText className="w-5 h-5 text-brand-600" />}
                  </div>
                  <div>
                    <div className="font-medium dark:text-white">{it.summary}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{formatDate(it.date)}</div>
                  </div>
                  
                </li>
              ))}
            </ul>
          </section>

          {/* Notifications & Rappels */}
         <section className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold md:text-lg text-base dark:text-white">Notifications</h4>
              <Button size="sm" variant="ghost" className="dark:text-white"
                onClick={() => { navigate("/notifications") }}>
              Tout lire</Button>
            </div>
            <ul className="space-y-2">
              {mockNotifications.map((n) => (
                <li key={n.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <div className={`p-2 rounded-full ${n.type === "rappel" ? "bg-warning-50 text-warning-600" : n.type === "alerte" ? "bg-error-50 text-error-600" : "bg-info-50 text-info-600"}`}>
                    {n.type === "rappel" && <BellRing className="w-5 h-5" />}
                    {n.type === "alerte" && <AlertOctagonIconFallback />}
                    {n.type === "info" && <Inbox className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-sm dark:text-slate-200">{n.text}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{formatDate(n.datetime)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ---------------------------
   Small fallback icon component (example)
   ---------------------------*/
// Using a small inline fallback because lucide has many icons; adapt if you have AlertCircle in your set
const AlertOctagonIconFallback: React.FC = () => (
  <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z"></path>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12" y2="16"></line>
  </svg>
);
