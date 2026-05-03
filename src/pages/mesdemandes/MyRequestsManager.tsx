import React, { useState } from "react";
import { Search, Filter, FileDown, MessageCircle, PlusCircle, Eye, ArrowDown, ChevronDown } from "lucide-react";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";

type RequestStatus = "EN_COURS" | "VALIDEE" | "REJETEE" | "EN_ATTENTE";

interface Document {
  id: string;
  name: string;
  url: string;
  version: number;
  updatedAt: string;
}

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  attachment?: { name: string; url: string };
}

interface Request {
  id: string;
  service: string;
  submittedAt: string;
  status: RequestStatus;
  documents: Document[];
  rejectionReason?: string;
  messages: Message[];
}

const mockData: Request[] = [
  {
    id: "REQ-2025-001",
    service: "Renouvellement Passeport",
    submittedAt: "2025-07-30T10:15:00Z",
    status: "EN_COURS",
    documents: [
      { id: "DOC-001", name: "Photo d'identité", url: "/docs/photo_id.jpg", version: 1, updatedAt: "2025-07-30T10:15:00Z" },
      { id: "DOC-004", name: "Formulaire rempli", url: "/docs/form.pdf", version: 1, updatedAt: "2025-07-30T10:15:00Z" },
    ],
    messages: [
      { id: "MSG-001", sender: "agent", text: "Votre demande est en cours de traitement.", timestamp: "2025-07-30T11:00:00Z" },
      { id: "MSG-002", sender: "user", text: "Merci pour l'information.", timestamp: "2025-07-30T11:30:00Z" },
    ],
  },
  {
    id: "REQ-2025-002",
    service: "Attestation de scolarité",
    submittedAt: "2025-06-14T09:00:00Z",
    status: "REJETEE",
    documents: [
      { id: "DOC-002", name: "Relevé de notes", url: "/docs/releve.pdf", version: 1, updatedAt: "2025-06-14T09:00:00Z" },
      { id: "DOC-005", name: "Certificat de naissance", url: "/docs/certificat.pdf", version: 1, updatedAt: "2025-06-14T09:00:00Z" },
    ],
    rejectionReason: "Document illisible",
    messages: [
      { id: "MSG-003", sender: "agent", text: "Le document est illisible. Veuillez le mettre à jour.", timestamp: "2025-06-15T10:00:00Z" },
    ],
  },
  {
    id: "REQ-2025-003",
    service: "Demande de bourse",
    submittedAt: "2025-07-01T14:20:00Z",
    status: "EN_ATTENTE",
    documents: [
      { id: "DOC-003", name: "Lettre de motivation", url: "/docs/lettre.pdf", version: 1, updatedAt: "2025-07-01T14:20:00Z" },
      { id: "DOC-006", name: "CV", url: "/docs/cv.pdf", version: 1, updatedAt: "2025-07-01T14:20:00Z" },
    ],
    messages: [],
  },
  {
    id: "REQ-2025-004",
    service: "Demande de visa",
    submittedAt: "2025-08-05T08:30:00Z",
    status: "VALIDEE",
    documents: [
      { id: "DOC-007", name: "Passeport", url: "/docs/passeport.pdf", version: 1, updatedAt: "2025-08-05T08:30:00Z" },
      { id: "DOC-008", name: "Formulaire de demande", url: "/docs/formulaire.pdf", version: 1, updatedAt: "2025-08-05T08:30:00Z" },
    ],
    messages: [
      { id: "MSG-004", sender: "agent", text: "Votre demande de visa a été validée.", timestamp: "2025-08-05T09:00:00Z" },
      { id: "MSG-005", sender: "user", text: "Merci pour la confirmation.", timestamp: "2025-08-05T09:15:00Z" },
    ],
  },
  {
    id: "REQ-2025-005",
    service: "Demande de carte d'identité",
    submittedAt: "2025-08-10T12:00:00Z",
    status: "EN_COURS",
    documents: [
      { id: "DOC-009", name: "Justificatif de domicile", url: "/docs/domicile.pdf", version: 1, updatedAt: "2025-08-10T12:00:00Z" },
      { id: "DOC-010", name: "Photo d'identité", url: "/docs/photo_id.jpg", version: 1, updatedAt: "2025-08-10T12:00:00Z" },
    ],
    messages: [],
  },
];

const statusBadge = (status: RequestStatus) => {
  switch (status) {
    case "EN_COURS":
      return <Badge variant="outline" color="brand">En cours</Badge>;
    case "VALIDEE":
      return <Badge variant="solid" color="success">Validée</Badge>;
    case "REJETEE":
      return <Badge variant="solid" color="error">Rejetée</Badge>;
    case "EN_ATTENTE":
      return <Badge variant="outline" color="warning">En attente</Badge>;
    default:
      return null;
  }
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function MyRequestsManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>(mockData);
  const itemsPerPage = 5;

  const filterByDateRange = (request: Request) => {
    const submittedDate = new Date(request.submittedAt);
    const now = new Date();
    if (dateRangeFilter === "last7days") {
      const last7Days = new Date(now.setDate(now.getDate() - 7));
      return submittedDate >= last7Days;
    } else if (dateRangeFilter === "last30days") {
      const last30Days = new Date(now.setDate(now.getDate() - 30));
      return submittedDate >= last30Days;
    } else if (dateRangeFilter === "custom" && dateFilter) {
      return submittedDate.toISOString().startsWith(dateFilter);
    }
    return true;
  };

  const filteredData = requests.filter(
    (r) =>
      (r.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.documents.some((doc) => doc.name.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (statusFilter ? r.status === statusFilter : true) &&
      filterByDateRange(r)
  );

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);




  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-800 p-2 md:p-4 lg:p-1 space-y-6 font-outfit animate-fade-in">
      {/* Toast Container */}
      <ToastContainer />

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-title-lg font-heading font-bold text-neutral-700 dark:text-neutral-50">
            Mes demandes
          </h1>
          <p className="text-theme-sm text-neutral-500 dark:text-neutral-400">
            Gérez vos demandes et documents en toute simplicité.
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            aria-label="Nouvelle demande"
            size="sm"
            variant="primary"
            className="bg-brand-500 hover:bg-brand-700 text-white animate-scale-up"
            onClick={() => navigate("/services/nouvelle-demande")}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
          </Button>
          <Button
            aria-label="Filtres"
            size="sm"
            variant="outline"
            className="menu-item"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 mr-2" /> Filtres
            <ChevronDown className={`w-4 h-4 transition-all duration-200 ${isFilterOpen ? "rotate-180" : ""}`} />
            </div>
          </Button>
        </div>
      </header>

      {/* Filter Section */}
      <div className="flex items-center gap-4">
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 bg-white dark:bg-neutral-800 p-4 rounded-radius-lg shadow-theme-md md:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 lg:gap-6">
                <div className="flex-1">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-400">Recherche</label>
                  <div className="relative mt-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Rechercher par service, numéro ou document..."
                      className="w-full pl-9 pr-4 py-2 border rounded-radius-lg bg-white dark:bg-neutral-700 dark:text-neutral-200 focus:ring-2 focus:ring-brand-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-400">Statut</label>
                  <select
                    aria-label="Filtrer par statut"
                    className="w-full mt-1 border rounded-radius-lg px-3 py-2 dark:bg-neutral-700 dark:text-neutral-200 focus:ring-2 focus:ring-brand-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Tous les statuts</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="VALIDEE">Validée</option>
                    <option value="REJETEE">Rejetée</option>
                    <option value="EN_ATTENTE">En attente</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-400">Période</label>
                  <select
                    aria-label="Filtrer par période"
                    className="w-full mt-1 border rounded-radius-lg px-3 py-2 dark:bg-neutral-700 dark:text-neutral-200 focus:ring-2 focus:ring-brand-500"
                    value={dateRangeFilter}
                    onChange={(e) => {
                      setDateRangeFilter(e.target.value);
                      if (e.target.value !== "custom") setDateFilter("");
                    }}
                  >
                    <option value="">Toutes les dates</option>
                    <option value="last7days">Derniers 7 jours</option>
                    <option value="last30days">Derniers 30 jours</option>
                    <option value="custom">Personnalisé</option>
                  </select>
                </div>
                {dateRangeFilter === "custom" && (
                  <div className="flex-1">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-400">Date personnalisée</label>
                    <input
                      aria-label="Date personnalisée"
                      placeholder="Date personnalisée"
                      type="date"
                      className="w-full mt-1 border rounded-radius-lg px-3 py-2 dark:bg-neutral-700 dark:text-neutral-200 focus:ring-2 focus:ring-brand-500"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4 sm:mt-0"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("");
                    setDateFilter("");
                    setDateRangeFilter("");
                    toast.info("Filtres réinitialisés.", { position: "top-right" });
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-neutral-800 rounded-radius-lg shadow-theme-md overflow-hidden animate-fade-in">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-700">
            <tr className="text-left text-theme-xs font-medium text-neutral-500 uppercase tracking-wider">
              <th className="px-6 py-4">N° Dossier</th>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {paginatedData.map((r) => (
              <motion.tr
                key={r.id}
                onClick={() => navigate(`/services/mesdemandes/details/${r.id}`)}
                className="cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors duration-200"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <td className="px-6 py-4 font-medium text-neutral-700 dark:text-neutral-200">{r.id}</td>
                <td className="px-6 py-4 text-neutral-700 dark:text-neutral-200">{r.service}</td>
                <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">{formatDate(r.submittedAt)}</td>
                <td className="px-6 py-4">{statusBadge(r.status)}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button
                    size="xs"
                    variant="ghost"
                    className="menu-item"
                    onClick={() => {
                      navigate(`/services/mesdemandes/details/${r.id}`);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" /> Détails
                  </Button>
                 
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50 dark:bg-neutral-700">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Précédent
          </Button>
          <span className="text-theme-sm text-neutral-700 dark:text-neutral-200">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-4 md:hidden">
        {paginatedData.map((r) => (
          <motion.div
            key={r.id}
            onClick={() => navigate(`/services/mesdemandes/details/${r.id}`)}
            className="bg-white dark:bg-neutral-800 p-4 rounded-radius-lg shadow-theme-md space-y-3 cursor-pointer animate-scale-up"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">{r.service}</h2>
              {statusBadge(r.status)}
            </div>
            <p className="text-theme-xs text-neutral-500 dark:text-neutral-400">N° {r.id}</p>
            <p className="text-theme-sm text-neutral-600 dark:text-neutral-400">{formatDate(r.submittedAt)}</p>
            <div className="flex gap-2 mt-3">
              <Button size="xs" variant="ghost" className="flex-1 menu-item">
                <FileDown className="w-4 h-4 mr-1" /> Reçu
              </Button>
              <Button size="xs" variant="ghost" className="flex-1 menu-item">
                <MessageCircle className="w-4 h-4 mr-1" /> Contacter
              </Button>
            </div>
          </motion.div>
        ))}
        {/* Pagination */}
        <div className="flex items-center justify-between py-4">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Précédent
          </Button>
          <span className="text-theme-sm text-neutral-700 dark:text-neutral-200">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}