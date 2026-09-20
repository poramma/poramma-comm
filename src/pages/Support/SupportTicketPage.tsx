import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import TextArea from "../../components/form/input/TextArea";
import { useAuth } from "../../context/AuthContext";
import { supportService, type SupportMessage, type SupportTicket } from "../../lib/services";
import { CATEGORY_LABELS, STATUS_INFO, formatWhen } from "./ticketLabels";

const MAX_LENGTH = 3000;

/** Suivi d'un ticket de support : fil de discussion avec l'ambassade, réponse, résolution. */
export default function SupportTicketPage() {
  const { id = "" } = useParams();
  const { user, loading } = useAuth();
  const [ticket, setTicket] = useState<(SupportTicket & { messages: SupportMessage[] }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      setTicket(await supportService.get(id));
      setError(null);
    } catch (err: any) {
      setError(err?.response?.status === 404 ? "Ce ticket est introuvable." : "Impossible de charger ce ticket.");
    } finally {
      setLoadingTicket(false);
    }
  }, [id]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [ticket?.messages.length]);

  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace state={{ from: `/support/tickets/${id}` }} />;

  const send = async () => {
    const text = content.trim();
    if (!text) return;
    setSending(true);
    try {
      await supportService.reply(id, text);
      setContent("");
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Votre message n'a pas pu être envoyé.");
    } finally {
      setSending(false);
    }
  };

  const resolve = async () => {
    setResolving(true);
    try {
      await supportService.resolve(id);
      toast.success("Ticket marqué comme résolu.");
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Action impossible pour le moment.");
    } finally {
      setResolving(false);
    }
  };

  const status = ticket ? STATUS_INFO[ticket.status] : null;
  const closed = ticket?.status === "CLOSED";
  const canResolve = ticket && (ticket.status === "OPEN" || ticket.status === "IN_PROGRESS" || ticket.status === "WAITING_USER");

  return (
    <>
      <PageMeta title="Suivi de mon ticket" description="Suivi d'un ticket de support." />
      <ToastContainer />
      <PageBreadcrumb pageTitle="Suivi de mon ticket" />

      <div className="mx-auto max-w-3xl space-y-5">
        <Link to="/support" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600 dark:text-gray-400">
          <ArrowLeft className="h-4 w-4" />
          Retour au support
        </Link>

        {loadingTicket && <p className="py-10 text-center text-sm text-gray-500">Chargement…</p>}
        {error && !ticket && <p className="rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-800 dark:bg-error-500/10">{error}</p>}

        {ticket && status && (
          <>
            <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{ticket.reference}</p>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{ticket.subject}</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {CATEGORY_LABELS[ticket.category]}
                    {ticket.linkedReference ? ` · Réf. ${ticket.linkedReference}` : ""} · Ouvert le {formatWhen(ticket.createdAt)}
                  </p>
                </div>
                <Badge color={status.color} variant="light">
                  {status.label}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{status.hint}</p>
              {canResolve && (
                <div className="mt-4">
                  <Button size="sm" variant="outline" onClick={resolve} disabled={resolving} startIcon={<CheckCircle2 className="h-4 w-4" />}>
                    {resolving ? "Enregistrement..." : "Mon problème est résolu"}
                  </Button>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
              <div className="max-h-[28rem] space-y-3 overflow-y-auto">
                {ticket.messages.map((m) => {
                  if (m.authorType === "SYSTEM") {
                    return (
                      <p key={m.id} className="text-center text-xs text-gray-400">
                        {m.content} · {formatWhen(m.createdAt)}
                      </p>
                    );
                  }
                  const mine = m.authorType === "USER";
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${mine ? "bg-brand-50 dark:bg-brand-500/10" : "bg-gray-100 dark:bg-gray-800"}`}>
                        <div className="mb-0.5 flex items-center justify-between gap-4">
                          <span className="font-medium text-gray-900 dark:text-white">{mine ? "Vous" : m.authorName ?? "Ambassade du Mali"}</span>
                          <span className="text-xs text-gray-400">{formatWhen(m.createdAt)}</span>
                        </div>
                        <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{m.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {closed ? (
                <p className="mt-5 rounded-lg bg-gray-50 p-3 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  Ce ticket est clôturé. <Link to="/support" className="text-brand-600 hover:underline">Ouvrir un nouveau ticket</Link>
                </p>
              ) : (
                <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
                  <TextArea rows={4} value={content} onChange={(v) => setContent(v.slice(0, MAX_LENGTH))} placeholder="Écrire à l'ambassade…" />
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                    <span>{ticket.status === "RESOLVED" ? "Répondre rouvrira le ticket." : "L'ambassade est prévenue par notification et email."}</span>
                    <span>
                      {content.length}/{MAX_LENGTH}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" onClick={send} disabled={sending || !content.trim()} startIcon={<Send className="h-4 w-4" />}>
                      {sending ? "Envoi..." : "Envoyer"}
                    </Button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
