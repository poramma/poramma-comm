import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bell, Search, Calendar, CheckCheck } from "lucide-react";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import { notificationService } from "../../lib/services";
import type { NotificationItem } from "../../lib/types";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TYPE_LABELS: Record<string, string> = {
  DEMANDE: "Demande",
  RDV: "Rendez-vous",
  DOSSIER: "Dossier",
  CAMPAGNE: "Annonce",
  MESSAGE: "Message",
};

const ACTION_LABELS: Record<string, string> = {
  DEMANDE: "Voir ma demande",
  RDV: "Voir mes rendez-vous",
  DOSSIER: "Voir mon dossier",
  CAMPAGNE: "Voir l'annonce",
};

const typeBadge = (type: string) => <Badge variant="solid" color="brand">{TYPE_LABELS[type] ?? "Information"}</Badge>;

const formatDate = (iso: string) => new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  const load = () => {
    setLoading(true);
    notificationService
      .list()
      .then(setNotifications)
      .catch(() => toast.error("Impossible de charger les notifications"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filteredData = notifications.filter(
    (n) =>
      (n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.message.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter ? n.status === statusFilter : true) &&
      (dateFilter ? n.createdAt.startsWith(dateFilter) : true)
  );

  // Prévient la pastille du header (NotificationDropdown) que le nombre de non lues a changé.
  const notifyChanged = () => window.dispatchEvent(new Event("notifications-changed"));

  const openNotif = async (notif: NotificationItem) => {
    setSelectedNotif(notif);
    if (notif.status === "SENT") {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, status: "READ" } : n)));
        notifyChanged();
      } catch {
        // le détail reste affiché même si le marquage « lu » échoue
      }
    }
  };

  // Arrivée depuis le menu du header (?open=<id>) : ouvre directement le détail de cette notification.
  const openId = searchParams.get("open");
  useEffect(() => {
    if (!openId || loading) return;
    const target = notifications.find((n) => n.id === openId);
    if (target) openNotif(target);
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId, loading]);

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => (n.status === "SENT" ? { ...n, status: "READ" } : n)));
    notifyChanged();
    toast.success("Toutes les notifications ont été marquées comme lues.");
  };

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-brand-500" />
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Consultez toutes vos notifications et alertes.</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={markAllAsRead}>
          <CheckCheck className="w-4 h-4 mr-2" /> Tout marquer comme lu
        </Button>
      </header>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          aria-label="Filtrer par statut"
          className="border rounded-lg px-3 py-2 dark:bg-slate-800 dark:text-slate-200"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous statuts</option>
          <option value="SENT">Non lues</option>
          <option value="READ">Lues</option>
        </select>

        <div className="relative">
          <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            placeholder="Filtrer par date"
            type="date"
            className="pl-9 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-slate-200"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow divide-y divide-slate-200 dark:divide-slate-700">
        {loading ? (
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
          </div>
        ) : filteredData.length > 0 ? (
          filteredData.map((notif) => (
            <div
              key={notif.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition cursor-pointer"
              onClick={() => openNotif(notif)}
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {typeBadge(notif.type)}
                  <h2 className={`font-semibold ${notif.status === "SENT" ? "text-brand-600" : ""}`}>{notif.title}</h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{notif.message}</p>
                <span className="text-xs text-slate-400">{formatDate(notif.createdAt)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">Aucune notification trouvée</div>
        )}
      </div>

      {selectedNotif && (
        <Modal isOpen={true} onClose={() => setSelectedNotif(null)} className="max-w-lg p-6">
          <h2 className="text-xl font-bold mb-2">{selectedNotif.title}</h2>
          <div className="mb-4">{typeBadge(selectedNotif.type)}</div>
          <p className="mb-4">{selectedNotif.message}</p>
          <span className="text-xs text-slate-400">{formatDate(selectedNotif.createdAt)}</span>
          {selectedNotif.actionUrl?.startsWith("/") && (
            <div className="mt-4">
              <Button size="sm" variant="primary" onClick={() => navigate(selectedNotif.actionUrl!)}>
                {ACTION_LABELS[selectedNotif.type] ?? "Voir le détail"}
              </Button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
