import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import { Lock, Send, UserRoundCheck } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { adminSupportService, apiErrorMessage, apiErrorStatus } from "../../lib/adminServices";
import type { AdminTicketPriority, AdminTicketStatus } from "../../lib/adminTypes";
import { useAuth } from "../../context/AuthContext";
import { useAdminQuery } from "../../hooks/useAdminQuery";
import { useCommunityAccess } from "../../hooks/useCommunityAccess";
import { PERMISSIONS } from "../../lib/communityAccess";
import { AdminPageHeader, Card, EmptyState, ErrorState, LoadingBlock, SelectField, TextAreaField } from "./components/AdminUi";
import { formatDateTime, priorityInfo, ticketStatusInfo } from "./adminFormat";
import { CATEGORY_LABELS } from "../Support/ticketLabels";

const MAX_LENGTH = 3000;

const STATUS_OPTIONS: { value: AdminTicketStatus; label: string }[] = [
  { value: "OPEN", label: "Ouvert" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "WAITING_USER", label: "Attente du membre" },
  { value: "RESOLVED", label: "Résolu" },
  { value: "CLOSED", label: "Clôturé" },
];
const PRIORITY_OPTIONS: { value: AdminTicketPriority; label: string }[] = [
  { value: "LOW", label: "Basse" },
  { value: "NORMAL", label: "Normale" },
  { value: "HIGH", label: "Haute" },
  { value: "URGENT", label: "Urgente" },
];

export default function AdminSupportTicket() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const { hasPermission } = useCommunityAccess();
  const canManage = hasPermission(PERMISSIONS.supportManage);

  const fetchTicket = useCallback(() => adminSupportService.get(id), [id]);
  const { data: ticket, error, loading, reload } = useAdminQuery(fetchTicket);

  const fetchAssignees = useCallback(() => adminSupportService.assignees(), []);
  const { data: assignees } = useAdminQuery(fetchAssignees, canManage);

  const [content, setContent] = useState("");
  const [internal, setInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const messageCount = ticket?.messages.length ?? 0;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messageCount]);

  const notFound = apiErrorStatus(error) === 404;

  const send = async () => {
    const text = content.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await adminSupportService.reply(id, text, internal);
      setContent("");
      toast.success(internal ? "Note interne ajoutée." : "Réponse envoyée au membre.");
      await reload(true);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Le message n'a pas pu être envoyé."));
    } finally {
      setSending(false);
    }
  };

  const update = async (patch: { status?: AdminTicketStatus; priority?: AdminTicketPriority; assignedTo?: string | null }, success: string) => {
    setUpdating(true);
    try {
      await adminSupportService.update(id, patch);
      toast.success(success);
      await reload(true);
    } catch (err) {
      toast.error(apiErrorMessage(err, "La modification n'a pas pu être enregistrée."));
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !ticket) return <LoadingBlock />;

  if (!ticket) {
    return (
      <>
        <AdminPageHeader title={notFound ? "Ticket introuvable" : "Ticket"} backTo="/admin/support" backLabel="Retour au support" />
        <Card>
          {notFound ? (
            <EmptyState title="Ticket introuvable" description="Ce ticket n'existe pas ou ne concerne pas le support de la communauté." />
          ) : (
            <ErrorState message={apiErrorMessage(error, "Ce ticket n'a pas pu être chargé.")} onRetry={() => void reload()} />
          )}
        </Card>
      </>
    );
  }

  const st = ticketStatusInfo(ticket.status);
  const pr = priorityInfo(ticket.priority);
  const closed = ticket.status === "CLOSED";
  const assignedToMe = !!user && ticket.assignee?.id === user.id;
  const assigneeOptions = (assignees ?? []).map((a) => ({ value: a.id, label: a.name ?? "Agent" }));
  // L'agent actuellement assigné doit toujours apparaître dans la liste, même s'il n'est plus proposé.
  if (ticket.assignee && !assigneeOptions.some((o) => o.value === ticket.assignee?.id)) {
    assigneeOptions.push({ value: ticket.assignee.id, label: ticket.assignee.name ?? "Agent" });
  }

  return (
    <>
      <PageMeta title={`${ticket.reference} | Support Poramma`} description="Suivi d'un ticket de support de la communauté." />
      <AdminPageHeader title={ticket.subject} description={`${ticket.reference} · ouvert le ${formatDateTime(ticket.createdAt)}`} backTo="/admin/support" backLabel="Retour au support" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <div role="log" aria-label="Fil de discussion" className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
              {ticket.messages.length === 0 && <p className="py-6 text-center text-sm text-gray-500">Aucun message.</p>}
              {ticket.messages.map((m) => {
                if (m.authorType === "SYSTEM") {
                  return (
                    <p key={m.id} className="text-center text-xs text-gray-400">
                      {m.content} · {formatDateTime(m.createdAt)}
                    </p>
                  );
                }
                const staff = m.authorType === "STAFF";
                const bubble = m.isInternal
                  ? "border border-dashed border-warning-300 bg-warning-50 dark:border-warning-500/40 dark:bg-warning-500/10"
                  : staff
                    ? "bg-brand-50 dark:bg-brand-500/10"
                    : "bg-gray-100 dark:bg-gray-800";
                return (
                  <div key={m.id} className={`flex ${staff ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[88%] rounded-xl px-3 py-2 text-sm ${bubble}`}>
                      <div className="mb-0.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-0.5">
                        <span className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white">
                          {m.isInternal && <Lock className="h-3 w-3 text-warning-600" aria-hidden="true" />}
                          {m.authorName ?? (staff ? "Support Poramma Communauté" : "Membre")}
                          {m.isInternal && <span className="text-xs font-normal text-warning-700 dark:text-orange-400">Note interne</span>}
                        </span>
                        <span className="text-xs text-gray-400">{formatDateTime(m.createdAt)}</span>
                      </div>
                      <p className="whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300">{m.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {canManage ? (
              closed ? (
                <p className="mt-5 rounded-lg bg-gray-50 p-3 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  Ce ticket est clôturé. Changez son statut pour le rouvrir.
                </p>
              ) : (
                <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
                  <TextAreaField
                    label={internal ? "Note interne" : "Réponse au membre"}
                    rows={4}
                    value={content}
                    onChange={(v) => setContent(v.slice(0, MAX_LENGTH))}
                    placeholder={internal ? "Note visible uniquement par l'équipe…" : "Écrire au membre…"}
                  />
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={internal}
                        onChange={(e) => setInternal(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                      />
                      Note interne <span className="text-xs text-gray-400">(invisible pour le membre)</span>
                    </label>
                    <span>
                      {content.length}/{MAX_LENGTH}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" onClick={() => void send()} disabled={sending || !content.trim()} startIcon={internal ? <Lock className="h-4 w-4" /> : <Send className="h-4 w-4" />}>
                      {sending ? "Envoi…" : internal ? "Ajouter la note" : "Envoyer la réponse"}
                    </Button>
                  </div>
                </div>
              )
            ) : (
              <p className="mt-5 rounded-lg bg-gray-50 p-3 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                Consultation seule : votre rôle ne permet pas de répondre aux tickets.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">Traitement</h2>
            {canManage ? (
              <div className="space-y-3">
                <SelectField label="Statut" value={ticket.status} options={STATUS_OPTIONS} onChange={(v) => v && v !== ticket.status && void update({ status: v as AdminTicketStatus }, "Statut mis à jour.")} />
                <SelectField label="Priorité" value={ticket.priority} options={PRIORITY_OPTIONS} onChange={(v) => v && v !== ticket.priority && void update({ priority: v as AdminTicketPriority }, "Priorité mise à jour.")} />
                <SelectField
                  label="Assigné à"
                  value={ticket.assignee?.id ?? ""}
                  allLabel="Non assigné"
                  options={assigneeOptions}
                  onChange={(v) => void update({ assignedTo: v || null }, v ? "Ticket assigné." : "Assignation retirée.")}
                />
                {!assignedToMe && user && (
                  <Button size="xs" variant="outline" disabled={updating} onClick={() => void update({ assignedTo: user.id }, "Ticket assigné à vous.")} startIcon={<UserRoundCheck className="h-3.5 w-3.5" />}>
                    Me l'assigner
                  </Button>
                )}
              </div>
            ) : (
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-gray-500 dark:text-gray-400">Statut</dt>
                  <dd><Badge color={st.color} size="sm">{st.label}</Badge></dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-gray-500 dark:text-gray-400">Priorité</dt>
                  <dd><Badge color={pr.color} size="sm">{pr.label}</Badge></dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-gray-500 dark:text-gray-400">Assigné à</dt>
                  <dd className="text-gray-800 dark:text-white/90">{ticket.assignee?.name ?? "Non assigné"}</dd>
                </div>
              </dl>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">Demande</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">Membre</dt>
                <dd className="text-gray-800 dark:text-white/90">
                  {ticket.requester.id ? (
                    <Link to={`/admin/membres/${ticket.requester.id}`} className="font-medium text-brand-700 hover:underline dark:text-brand-300">
                      {ticket.requester.name || ticket.requester.email || "Voir le membre"}
                    </Link>
                  ) : (
                    ticket.requester.name || "—"
                  )}
                  {ticket.requester.name && ticket.requester.email && <span className="block break-all text-xs text-gray-500 dark:text-gray-400">{ticket.requester.email}</span>}
                  {ticket.requester.phone && <span className="block text-xs text-gray-500 dark:text-gray-400">{ticket.requester.phone}</span>}
                  {ticket.requester.inue && <span className="block text-xs text-gray-500 dark:text-gray-400">INUE {ticket.requester.inue}</span>}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">Catégorie</dt>
                <dd className="text-gray-800 dark:text-white/90">{CATEGORY_LABELS[ticket.category as keyof typeof CATEGORY_LABELS] ?? ticket.category}</dd>
              </div>
              {ticket.linkedReference && (
                <div>
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Référence indiquée</dt>
                  <dd className="break-all font-mono text-xs text-gray-800 dark:text-white/90">{ticket.linkedReference}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">Première réponse</dt>
                <dd className="text-gray-800 dark:text-white/90">{ticket.firstResponseAt ? formatDateTime(ticket.firstResponseAt) : "Pas encore"}</dd>
              </div>
              {ticket.resolvedAt && (
                <div>
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Résolu le</dt>
                  <dd className="text-gray-800 dark:text-white/90">{formatDateTime(ticket.resolvedAt)}</dd>
                </div>
              )}
              {ticket.closedAt && (
                <div>
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Clôturé le</dt>
                  <dd className="text-gray-800 dark:text-white/90">{formatDateTime(ticket.closedAt)}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
