import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Send, FileDown, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import Input from "../../components/form/input/InputField";
import { demandeService, documentService } from "../../lib/services";
import { useRequests } from "../../hooks/useRequests";
import type { Demande, DemandeComment, DemandeDocument, DemandeHistoryEntry } from "../../lib/types";

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

const formatDate = (iso: string) => new Date(iso).toLocaleString("fr-FR");

type OutcomeTone = "success" | "error" | "warning" | "neutral";

interface Outcome {
  tone: OutcomeTone;
  title: string;
  text: string;
}

/** Message clair affiché en tête du dossier pour les statuts qui appellent une réaction ou marquent une issue. */
const outcomeFor = (status: string): Outcome | null => {
  switch (status) {
    case "COMPLETED":
      return {
        tone: "success",
        title: "Le traitement de votre demande est terminé",
        text: "Si votre présence est nécessaire pour finaliser ce service (retrait d'un document, par exemple), rendez-vous à l'ambassade. Les frais éventuels se règlent en espèces sur place.",
      };
    case "REJECTED":
      return {
        tone: "error",
        title: "Votre demande a été rejetée",
        text: "Vous pouvez déposer une nouvelle demande en corrigeant les points indiqués, ou contacter l'ambassade pour plus d'informations.",
      };
    case "APPROVED":
      return { tone: "success", title: "Votre demande a été approuvée", text: "Son traitement se poursuit ; vous serez informé(e) de la suite." };
    case "ADDITIONAL_INFO_REQUIRED":
      return {
        tone: "warning",
        title: "L'ambassade a besoin d'un complément d'information",
        text: "Répondez dans l'espace d'échanges ci-dessous ou ajoutez le document demandé à votre dossier.",
      };
    case "CANCELLED":
      return { tone: "neutral", title: "Cette demande a été annulée", text: "Vous pouvez déposer une nouvelle demande si nécessaire." };
    default:
      return null;
  }
};

const OUTCOME_STYLES: Record<OutcomeTone, { box: string; icon: typeof CheckCircle2; iconColor: string }> = {
  success: { box: "border-success-200 bg-success-50 dark:border-success-500/30 dark:bg-success-500/10", icon: CheckCircle2, iconColor: "text-success-600" },
  error: { box: "border-error-200 bg-error-50 dark:border-error-500/30 dark:bg-error-500/10", icon: XCircle, iconColor: "text-error-600" },
  warning: { box: "border-warning-200 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/10", icon: AlertTriangle, iconColor: "text-warning-600" },
  neutral: { box: "border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-700/40", icon: Info, iconColor: "text-neutral-500" },
};

export default function RequestDetails() {
  const { id } = useParams();
  const { downloadReceipt } = useRequests();
  const [demande, setDemande] = useState<Demande | null>(null);
  const [history, setHistory] = useState<DemandeHistoryEntry[]>([]);
  const [comments, setComments] = useState<DemandeComment[]>([]);
  const [documents, setDocuments] = useState<DemandeDocument[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [newDocument, setNewDocument] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [d, h, c, docs] = await Promise.all([
        demandeService.getById(id),
        demandeService.listHistory(id),
        demandeService.listComments(id),
        demandeService.listDocuments(id),
      ]);
      setDemande(d);
      setHistory(h);
      setComments(c);
      setDocuments(docs);
    } catch {
      toast.error("Impossible de charger cette demande");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [comments]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !id) return;
    setIsSending(true);
    try {
      const comment = await demandeService.addComment(id, messageInput);
      setComments((prev) => [...prev, comment]);
      setMessageInput("");
    } catch {
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setIsSending(false);
    }
  };

  const handleAddDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setNewDocument(file);
    try {
      await documentService.upload(file, "OTHER", id);
      setDocuments(await demandeService.listDocuments(id));
      toast.success("Document ajouté à votre dossier.");
    } catch {
      toast.error("Erreur lors de l'envoi du document");
    } finally {
      setNewDocument(null);
      e.target.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!demande) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-800">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Demande non trouvée</h2>
          <p className="text-neutral-500 dark:text-neutral-400">La demande que vous recherchez n'existe pas ou vous n'y avez pas accès.</p>
        </div>
      </div>
    );
  }

  const outcome = outcomeFor(demande.status);
  const OutcomeIcon = outcome ? OUTCOME_STYLES[outcome.tone].icon : Info;
  // Dernier changement de statut vers le statut actuel, avec le message de l'agent s'il l'a rendu visible au demandeur.
  const agentNote = [...history]
    .reverse()
    .find((h) => h.action === "STATUS_CHANGE" && h.toStatus === demande.status && h.comment?.trim())?.comment;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-800 p-2 lg:p-1 space-y-6 font-outfit animate-fade-in">
      <ToastContainer />

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-title-md font-heading font-bold text-neutral-700 dark:text-neutral-50">
            {demande.subService?.name ?? "Demande"}
          </h1>
          <p className="text-theme-xs text-neutral-500 dark:text-neutral-400">Dossier {demande.dossierNumber}</p>
          {demande.advisor && (
            <p className="mt-1 text-theme-xs font-medium text-brand-600 dark:text-brand-300">
              Traitée par {demande.advisor.name} — {demande.advisor.title}
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => downloadReceipt(demande)}>
          <FileDown className="w-4 h-4 mr-1" /> Reçu
        </Button>
      </header>

      <div className="flex items-center gap-2">
        <p className="text-theme-sm text-neutral-500 dark:text-neutral-400">Soumise le {formatDate(demande.submittedAt)}</p>
        <div className="ml-2">{statusBadge(demande.status)}</div>
      </div>

      {outcome && (
        <div role="status" className={`flex gap-3 rounded-radius-lg border p-4 ${OUTCOME_STYLES[outcome.tone].box}`}>
          <OutcomeIcon className={`mt-0.5 h-6 w-6 shrink-0 ${OUTCOME_STYLES[outcome.tone].iconColor}`} />
          <div className="space-y-1">
            <p className="font-semibold text-neutral-800 dark:text-neutral-50">{outcome.title}</p>
            {agentNote && (
              <p className="text-sm text-neutral-700 dark:text-neutral-200">
                <span className="font-medium">{demande.status === "REJECTED" ? "Motif : " : "Message de l'ambassade : "}</span>
                {agentNote}
              </p>
            )}
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{outcome.text}</p>
          </div>
        </div>
      )}

      {/* Historique */}
      <section className="space-y-4 animate-scale-up">
        <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-50">Suivi du dossier</h2>
        <ul className="space-y-3">
          {history.length === 0 && <li className="text-theme-sm text-neutral-500 dark:text-neutral-400">Aucun événement pour l'instant.</li>}
          {history.map((h) => (
            <motion.li
              key={h.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-radius-lg bg-white dark:bg-neutral-700"
            >
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{h.comment}</p>
              <p className="text-theme-xs text-neutral-500 dark:text-neutral-400">{formatDate(h.createdAt)}</p>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* Documents */}
      <section className="space-y-4 animate-scale-up">
        <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-50">Documents joints au dossier</h2>
        <ul className="space-y-2">
          {documents.length === 0 && <li className="text-theme-sm text-neutral-500 dark:text-neutral-400">Aucune pièce jointe pour l'instant.</li>}
          {documents.map((d) => (
            <li key={d.id} className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-radius-lg bg-white dark:bg-neutral-700">
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{d.file.originalName}</p>
                {d.reviewNote && <p className="text-theme-xs text-error-600">Remarque de l'ambassade : {d.reviewNote}</p>}
              </div>
              <Badge variant="outline" color={d.status === "ACCEPTED" ? "success" : d.status === "REJECTED" ? "error" : "light"}>
                {d.status === "ACCEPTED" ? "Acceptée" : d.status === "REJECTED" ? "Refusée" : "Reçue"}
              </Badge>
            </li>
          ))}
        </ul>
        <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-50">Ajouter un document</h2>
        <label className="inline-flex items-center gap-2 cursor-pointer text-brand-600 hover:text-brand-700">
          <input title="Ajouter un document" type="file" className="hidden" onChange={handleAddDocument} disabled={!!newDocument} />
          {newDocument ? "Envoi en cours..." : "Téléverser un nouveau document pour ce dossier"}
        </label>
      </section>

      {/* Échanges */}
      <section className="flex flex-col h-full space-y-4 animate-scale-up">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-medium text-neutral-800 dark:text-neutral-100">Échanges avec le service consulaire</h2>
        </div>

        <div
          ref={chatRef}
          className="h-80 overflow-y-auto space-y-3 p-4 border border-neutral-200 dark:border-neutral-700 rounded-radius-lg bg-white dark:bg-neutral-700 scroll-smooth"
        >
          {comments.length === 0 && <p className="text-theme-sm text-neutral-500 dark:text-neutral-400">Aucun message pour l'instant.</p>}
          <AnimatePresence>
            {comments.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={`flex ${c.authorType === "STUDENT" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex flex-col max-w-[85%]">
                  <div
                    className={`p-3 rounded-xl ${
                      c.authorType === "STUDENT"
                        ? "bg-brand-500 text-white rounded-tr-none"
                        : "bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 rounded-tl-none border border-neutral-200 dark:border-neutral-600"
                    }`}
                  >
                    {c.authorType === "AGENT" && (
                      <p className="text-xs font-medium mb-1 opacity-70">{c.authorName ?? "Agent"}</p>
                    )}
                    <p className="text-sm leading-relaxed">{c.content}</p>
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{formatDate(c.createdAt)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 bg-white dark:bg-neutral-800">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Écrivez votre message..."
              className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              title="Envoyer le message"
              type="button"
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isSending}
              className={`p-3 rounded-xl ${
                messageInput.trim() && !isSending
                  ? "bg-brand-500 hover:bg-brand-600 text-white"
                  : "bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
              } transition-colors`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
