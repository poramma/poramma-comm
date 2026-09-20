import { useEffect, useState } from "react";
import { Search, Filter, PlusCircle, Eye, ChevronDown } from "lucide-react";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { useRequests } from "../../hooks/useRequests";
import type { Demande } from "../../lib/types";

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

const statusBadge = (status: string) => {
  const cfg = STATUS_LABELS[status] ?? { label: status, color: "light" as const };
  return <Badge variant="outline" color={cfg.color}>{cfg.label}</Badge>;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function MyRequestsManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { requests, loading, listRequests } = useRequests();
  const itemsPerPage = 5;

  useEffect(() => {
    listRequests().catch(() => toast.error("Impossible de charger vos demandes"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = requests.filter(
    (r: Demande) =>
      ((r.subService?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.dossierNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter ? r.status === statusFilter : true)
  );

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-800 p-2 md:p-4 lg:p-1 space-y-6 font-outfit animate-fade-in">
      <ToastContainer />

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
                      placeholder="Rechercher par service ou numéro de dossier..."
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
                    {Object.entries(STATUS_LABELS).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4 sm:mt-0"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("");
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

      {loading && requests.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-radius-lg shadow-theme-md">
          <p className="text-neutral-500 dark:text-neutral-400">Vous n'avez pas encore de demande.</p>
        </div>
      ) : (
      <>
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
                <td className="px-6 py-4 font-medium text-neutral-700 dark:text-neutral-200">{r.dossierNumber}</td>
                <td className="px-6 py-4 text-neutral-700 dark:text-neutral-200">{r.subService?.name ?? "—"}</td>
                <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">{formatDate(r.submittedAt)}</td>
                <td className="px-6 py-4">{statusBadge(r.status)}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button
                    size="xs"
                    variant="ghost"
                    className="menu-item"
                    onClick={() => navigate(`/services/mesdemandes/details/${r.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-1" /> Détails
                  </Button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50 dark:bg-neutral-700">
          <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            Précédent
          </Button>
          <span className="text-theme-sm text-neutral-700 dark:text-neutral-200">
            Page {currentPage} sur {totalPages}
          </span>
          <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Suivant
          </Button>
        </div>
      </div>

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
              <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">{r.subService?.name ?? "—"}</h2>
              {statusBadge(r.status)}
            </div>
            <p className="text-theme-xs text-neutral-500 dark:text-neutral-400">N° {r.dossierNumber}</p>
            <p className="text-theme-sm text-neutral-600 dark:text-neutral-400">{formatDate(r.submittedAt)}</p>
          </motion.div>
        ))}
        <div className="flex items-center justify-between py-4">
          <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            Précédent
          </Button>
          <span className="text-theme-sm text-neutral-700 dark:text-neutral-200">
            Page {currentPage} sur {totalPages}
          </span>
          <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Suivant
          </Button>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
