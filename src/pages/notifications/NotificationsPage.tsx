import React, { useState } from "react";
import { Bell, Trash2, Filter, Search, Calendar } from "lucide-react";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import {Modal} from "../../components/ui/modal";

type NotificationType = "INFO" | "ALERTE" | "MESSAGE";
type NotificationStatus = "LUE" | "NON_LUE";

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: NotificationType;
  status: NotificationStatus;
}

const mockData: Notification[] = [
  {
    id: "n1",
    title: "Nouvelle réponse à votre demande",
    message: "L'agent a répondu à votre demande de passeport.",
    date: "2025-08-10T09:00:00Z",
    type: "MESSAGE",
    status: "NON_LUE",
  },
  {
    id: "n2",
    title: "Rappel de rendez-vous",
    message: "Vous avez un rendez-vous demain à 10h à l'ambassade.",
    date: "2025-08-09T15:30:00Z",
    type: "ALERTE",
    status: "LUE",
  },
  {
    id: "n3",
    title: "Information",
    message: "L'ambassade sera fermée le 15 août (jour férié).",
    date: "2025-08-08T08:00:00Z",
    type: "INFO",
    status: "NON_LUE",
  },
];

const typeBadge = (type: NotificationType) => {
  switch (type) {
    case "MESSAGE":
      return <Badge variant="solid" color="brand">Message</Badge>;
    case "ALERTE":
      return <Badge variant="solid" color="error">Alerte</Badge>;
    case "INFO":
      return <Badge variant="solid" color="warning">Info</Badge>;
    default:
      return null;
  }
};

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [notifications, setNotifications] = useState(mockData);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  const filteredData = notifications.filter(
    (n) =>
      (n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (typeFilter ? n.type === typeFilter : true) &&
      (statusFilter ? n.status === statusFilter : true) &&
      (dateFilter ? n.date.startsWith(dateFilter) : true)
  );

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-brand-500" />
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Consultez toutes vos notifications et alertes.
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline">
          <Filter className="w-4 h-4 mr-2" /> Filtres avancés
        </Button>
      </header>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
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

        {/* Type Filter */}
        <select
          aria-label="Filtrer par type"
          className="border rounded-lg px-3 py-2 dark:bg-slate-800 dark:text-slate-200"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Tous types</option>
          <option value="MESSAGE">Messages</option>
          <option value="ALERTE">Alertes</option>
          <option value="INFO">Infos</option>
        </select>

        {/* Status Filter */}
        <select
          aria-label="Filtrer par statut"
          className="border rounded-lg px-3 py-2 dark:bg-slate-800 dark:text-slate-200"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous statuts</option>
          <option value="NON_LUE">Non lues</option>
          <option value="LUE">Lues</option>
        </select>

        {/* Date Filter */}
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

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow divide-y divide-slate-200 dark:divide-slate-700">
        {filteredData.length > 0 ? (
          filteredData.map((notif) => (
            <div
              key={notif.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition cursor-pointer"
              onClick={() => setSelectedNotif(notif)}
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {typeBadge(notif.type)}
                  <h2 className={`font-semibold ${notif.status === "NON_LUE" ? "text-brand-600" : ""}`}>
                    {notif.title}
                  </h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                  {notif.message}
                </p>
                <span className="text-xs text-slate-400">{formatDate(notif.date)}</span>
              </div>
              <button
                title="Supprimer la notification"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notif.id);
                }}
                className="text-slate-400 hover:text-red-500 p-2 rounded-full"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            Aucune notification trouvée
          </div>
        )}
      </div>

      {/* Modal Notification Detail */}
      {selectedNotif && (
        <Modal isOpen={true} onClose={() => setSelectedNotif(null)} className="max-w-lg p-6">
          <h2 className="text-xl font-bold mb-2">{selectedNotif.title}</h2>
          <div className="mb-4">{typeBadge(selectedNotif.type)}</div>
          <p className="mb-4">{selectedNotif.message}</p>
          <span className="text-xs text-slate-400">{formatDate(selectedNotif.date)}</span>
        </Modal>
      )}
    </div>
  );
}
