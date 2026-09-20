import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLeft, Send } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import TextArea from "../../components/form/input/TextArea";
import { useAuth } from "../../context/AuthContext";
import { cultureService } from "../../lib/services";
import type { CultureMessage, CultureThread } from "../../lib/types";
import { THREAD_STATUS, formatWhen, initialsOf } from "./cultureLabels";

const MAX_LENGTH = 3000;

/** Un échange avec le Conseiller Culturel : le fil montre son vrai nom. */
export default function CultureThreadPage() {
  const { id = "" } = useParams();
  const { user, loading } = useAuth();
  const [thread, setThread] = useState<(CultureThread & { messages: CultureMessage[] }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingThread, setLoadingThread] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      setThread(await cultureService.getThread(id));
      setError(null);
    } catch (err: any) {
      setError(err?.response?.status === 404 ? "Cet échange est introuvable." : "Impossible de charger cet échange.");
    } finally {
      setLoadingThread(false);
    }
  }, [id]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [thread?.messages.length]);

  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace state={{ from: `/culture/echanges/${id}` }} />;

  const send = async () => {
    const text = content.trim();
    if (!text) return;
    setSending(true);
    try {
      await cultureService.reply(id, text);
      setContent("");
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Votre message n'a pas pu être envoyé.");
    } finally {
      setSending(false);
    }
  };

  const status = thread ? THREAD_STATUS[thread.status] : null;
  const closed = thread?.status === "CLOSED";
  const advisorName = thread?.advisor.name;

  return (
    <>
      <PageMeta title="Échange avec le Conseiller Culturel" description="Suivi d'un échange avec le Conseiller Culturel." />
      <ToastContainer />
      <PageBreadcrumb pageTitle="Échange culturel" />

      <div className="mx-auto max-w-3xl space-y-5">
        <Link to="/culture" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600 dark:text-gray-400">
          <ArrowLeft className="h-4 w-4" />
          Espace culturel
        </Link>

        {loadingThread && <p className="py-10 text-center text-sm text-gray-500">Chargement…</p>}
        {error && !thread && <p className="rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-800 dark:bg-error-500/10">{error}</p>}

        {thread && status && (
          <>
            <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{thread.reference}</p>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{thread.subject}</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Ouvert le {formatWhen(thread.createdAt)}</p>
                </div>
                <Badge color={status.color} variant="light">
                  {status.label}
                </Badge>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200" aria-hidden>
                  {advisorName ? initialsOf(advisorName) : "CC"}
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{advisorName ?? thread.advisor.title}</span>
                  {advisorName ? <span className="text-gray-500"> — {thread.advisor.title}</span> : <span className="text-gray-500"> — vous répondra en son nom</span>}
                </p>
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{status.hint}</p>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
              <div className="max-h-[28rem] space-y-3 overflow-y-auto">
                {thread.messages.map((m) => {
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
                          <span className="font-medium text-gray-900 dark:text-white">{mine ? "Vous" : m.authorName ?? "Conseiller Culturel"}</span>
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
                  Cet échange est clos. <Link to="/culture/echanges/nouveau" className="text-brand-600 hover:underline">Ouvrir un nouvel échange</Link>
                </p>
              ) : (
                <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
                  <TextArea rows={4} value={content} onChange={(v) => setContent(v.slice(0, MAX_LENGTH))} placeholder="Écrire au Conseiller Culturel…" />
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                    <span>Le conseiller est prévenu par notification et par email.</span>
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
