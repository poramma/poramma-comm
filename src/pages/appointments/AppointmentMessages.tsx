// src/pages/appointments/AppointmentMessages.tsx
//
// Espace d'échange entre l'usager et l'ambassade autour d'un rendez-vous.
// Les messages de l'ambassade sont signés du service (jamais d'un agent) ;
// les notes internes du personnel ne sont jamais renvoyées par l'API.

import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import { rendezvousService } from "../../lib/services";
import type { DemandeComment, RendezVous } from "../../lib/types";

const MAX_LENGTH = 1000;

const formatWhen = (iso: string) => new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

interface Props {
  rendezVous: RendezVous;
  onClose: () => void;
}

const AppointmentMessages: React.FC<Props> = ({ rendezVous, onClose }) => {
  const [notes, setNotes] = useState<DemandeComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rendezvousService
      .listNotes(rendezVous.id)
      .then(setNotes)
      .catch(() => setError("Impossible de charger les échanges."))
      .finally(() => setLoading(false));
  }, [rendezVous.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [notes.length, loading]);

  const send = async () => {
    const text = content.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    try {
      const created = await rendezvousService.addNote(rendezVous.id, text);
      setNotes((prev) => [...prev, created]);
      setContent("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Votre message n'a pas pu être envoyé.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-lg p-6">
      <h2 className="text-xl font-bold mb-1">Échanges avec l'ambassade</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Rendez-vous {rendezVous.ticketId} — {rendezVous.subService?.name ?? "Service"}
      </p>

      <div className="max-h-72 overflow-y-auto space-y-3 rounded-lg border border-gray-200 dark:border-gray-800 p-3 mb-4">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-6">Chargement…</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Aucun message pour le moment. Vous pouvez écrire à l'ambassade au sujet de ce rendez-vous.
          </p>
        ) : (
          notes.map((n) => {
            const mine = n.authorType === "STUDENT";
            return (
              <div key={n.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${mine ? "bg-brand-50 dark:bg-brand-500/10" : "bg-gray-100 dark:bg-gray-800"}`}>
                  <div className="flex items-center justify-between gap-3 mb-0.5">
                    <span className="font-medium text-gray-900 dark:text-white">{mine ? "Vous" : n.authorName ?? "Ambassade"}</span>
                    <span className="text-xs text-gray-400">{formatWhen(n.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{n.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
        placeholder="Écrire à l'ambassade…"
        rows={3}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-3 text-sm text-gray-800 dark:text-white"
      />
      <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
        <span>{error ? <span className="text-red-600">{error}</span> : "Un agent de l'ambassade vous répondra ici et par email."}</span>
        <span>
          {content.length}/{MAX_LENGTH}
        </span>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
        <Button onClick={send} disabled={sending || !content.trim()}>
          <Send className="w-4 h-4 mr-2" />
          {sending ? "Envoi…" : "Envoyer"}
        </Button>
      </div>
    </Modal>
  );
};

export default AppointmentMessages;
