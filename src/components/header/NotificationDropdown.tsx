import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { notificationService } from "../../lib/services";
import type { NotificationItem } from "../../lib/types";

const POLL_MS = 60_000;
/** Événement window émis par la page Notifications après lecture — voir NotificationsPage. */
const NOTIFICATIONS_CHANGED = "notifications-changed";

const TYPE_LABELS: Record<string, string> = {
  DEMANDE: "Demande",
  RDV: "Rendez-vous",
  DOSSIER: "Dossier",
  CAMPAGNE: "Annonce",
  MESSAGE: "Message",
};

const formatDate = (iso: string) => new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    try {
      const { notifications, unreadCount } = await notificationService.fetch();
      setItems(notifications.slice(0, 6));
      setUnreadCount(unreadCount);
    } catch {
      // Silencieux : le menu reste utilisable, la prochaine relève réessaiera.
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const toggleDropdown = () => {
    if (!isOpen) refresh();
    setIsOpen(!isOpen);
  };

  // La page Notifications ouvre le détail et marque la notification comme lue.
  const openItem = (n: NotificationItem) => {
    setIsOpen(false);
    navigate(`/notifications?open=${encodeURIComponent(n.id)}`);
  };

  // Rafraîchit la pastille dès que la page Notifications lit / marque des notifications.
  useEffect(() => {
    window.addEventListener(NOTIFICATIONS_CHANGED, refresh);
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED, refresh);
  }, [refresh]);

  return (
    <div className="relative ">
      <button
        type="button"
        title="Notifications"
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="absolute right-[-220px] mt-[17px] flex max-h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px]"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notifications</h5>
          {unreadCount > 0 && <span className="text-theme-xs text-gray-500 dark:text-gray-400">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</span>}
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {items.length === 0 && (
            <li className="px-4 py-6 text-center text-theme-sm text-gray-500 dark:text-gray-400">Aucune notification pour l'instant.</li>
          )}
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => openItem(n)}
                className="flex w-full gap-3 rounded-lg border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.status === "SENT" ? "bg-orange-500" : "bg-transparent"}`} />
                <span className="block min-w-0">
                  <span className="mb-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">{TYPE_LABELS[n.type] ?? "Information"}</span>
                  <span className={`block text-theme-sm ${n.status === "SENT" ? "font-semibold" : "font-medium"} text-gray-800 dark:text-white/90`}>{n.title}</span>
                  <span className="block text-theme-xs text-gray-500 dark:text-gray-400 line-clamp-2">{n.message}</span>
                  <span className="mt-1 block text-theme-xs text-gray-400">{formatDate(n.createdAt)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <Link
          to="/notifications"
          onClick={() => setIsOpen(false)}
          className="flex items-center justify-center w-full px-4 py-3 text-theme-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Voir toutes les notifications
        </Link>
      </Dropdown>
    </div>
  );
}
