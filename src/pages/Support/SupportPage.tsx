import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CalendarDays, CheckCircle2, ChevronDown, FileText, LifeBuoy, Mail, Phone, Send } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import TextArea from "../../components/form/input/TextArea";
import { useAuth } from "../../context/AuthContext";
import { EMBASSY_CONTACT } from "../../config/contact";
import Badge from "../../components/ui/badge/Badge";
import { supportService, type SupportCategory, type SupportTicket } from "../../lib/services";
import { CATEGORY_LABELS, STATUS_INFO, formatWhen } from "./ticketLabels";

const CATEGORIES: { value: SupportCategory; label: string }[] = [
  { value: "DEMANDE", label: "Une de mes demandes" },
  { value: "RENDEZ_VOUS", label: "Un rendez-vous" },
  { value: "REGISTRATION", label: "Mon enregistrement / mon INUE" },
  { value: "ACCOUNT", label: "Compte et connexion" },
  { value: "TECHNICAL", label: "Problème technique" },
  { value: "OTHER", label: "Autre question" },
];

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "Pourquoi ne puis-je pas encore faire de demande ni prendre de rendez-vous ?",
    a: (
      <>
        Ces fonctionnalités s'ouvrent une fois votre <strong>enregistrement auprès de l'ambassade validé</strong> : vous renseignez votre situation et déposez vos pièces
        depuis <Link to="/enregistrement" className="text-brand-600 hover:underline">Mon enregistrement</Link>, puis un agent examine votre dossier. À la validation, votre
        numéro <strong>INUE</strong> (identifiant unique de l'usager) vous est attribué. Vous pouvez en attendant consulter tous les services et leurs conditions.
      </>
    ),
  },
  {
    q: "Comment suivre l'avancement de ma demande ?",
    a: (
      <>
        Ouvrez <Link to="/services/mesdemandes/gerer" className="text-brand-600 hover:underline">Mes demandes</Link> : chaque dossier affiche son état et son historique.
        À chaque changement, vous recevez aussi une notification dans l'application et par email.
      </>
    ),
  },
  {
    q: "L'ambassade me demande un complément d'information. Que dois-je faire ?",
    a: "Ouvrez la demande concernée : le message de l'agent y figure. Répondez dans l'espace d'échange du dossier et, si des pièces sont demandées, ajoutez-les depuis le même dossier. L'agent est prévenu dès que vous répondez et reprend alors le traitement.",
  },
  {
    q: "Comment déplacer ou annuler un rendez-vous ?",
    a: (
      <>
        Depuis <Link to="/services/rendez-vous" className="text-brand-600 hover:underline">Mes rendez-vous</Link>, utilisez « Déplacer » ou « Annuler » sur le rendez-vous concerné
        (ces boutons n'apparaissent que si le rendez-vous est encore modifiable). Le créneau libéré peut être repris par un autre usager : annulez dès que vous ne pouvez pas venir.
      </>
    ),
  },
  {
    q: "Dois-je payer en ligne ?",
    a: "Non. Poramma n'accepte aucun paiement en ligne : les éventuels frais d'un service se règlent directement à l'ambassade, lors du retrait ou du rendez-vous.",
  },
  {
    q: "Quels documents dois-je fournir ?",
    a: "La liste dépend du service. Elle est indiquée dans la fiche de chaque service et rappelée au moment de déposer la demande. Préparez des scans lisibles (PDF ou image) de vos originaux.",
  },
  {
    q: "J'ai oublié mon mot de passe.",
    a: (
      <>
        Utilisez <Link to="/reset-password" className="text-brand-600 hover:underline">Mot de passe oublié</Link> : un code à 6 chiffres est envoyé à votre adresse email, valable
        15 minutes. Si vous êtes connecté(e), vous pouvez aussi le changer depuis les <Link to="/settings" className="text-brand-600 hover:underline">Paramètres</Link>.
      </>
    ),
  },
  {
    q: "Comment corriger mes informations personnelles ?",
    a: (
      <>
        Rendez-vous sur <Link to="/profile" className="text-brand-600 hover:underline">Mon profil</Link> et utilisez « Editer » sur la rubrique concernée. Une fois votre
        dossier validé, une correction du nom ou d'une pièce d'identité peut nécessiter de prévenir l'ambassade : écrivez-nous ci-dessous.
      </>
    ),
  },
];

export default function SupportPage() {
  const { user, loading } = useAuth();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const [category, setCategory] = useState<SupportCategory | "">("");
  const [reference, setReference] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<{ id: string; ticket: string } | null>(null);
  const [myTickets, setMyTickets] = useState<SupportTicket[] | null>(null);

  const loadTickets = useCallback(() => {
    supportService.listMine().then(setMyTickets).catch(() => setMyTickets([]));
  }, []);

  useEffect(() => {
    if (user) loadTickets();
  }, [user, loadTickets]);

  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace state={{ from: "/support" }} />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!category) return setError("Choisissez la nature de votre demande.");
    if (subject.trim().length < 3) return setError("Indiquez l'objet de votre message.");
    if (message.trim().length < 10) return setError("Décrivez votre demande en quelques phrases (10 caractères minimum).");

    setSending(true);
    try {
      const result = await supportService.send({
        category,
        subject: subject.trim(),
        message: message.trim(),
        reference: reference.trim() || undefined,
      });
      setTicket(result);
      loadTickets();
      setCategory("");
      setReference("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      const status = err?.response?.status;
      const text = status === 429 ? "Vous avez envoyé plusieurs messages récemment. Réessayez dans un moment." : err?.response?.data?.message || "Le message n'a pas pu être envoyé.";
      setError(text);
      toast.error(text);
    } finally {
      setSending(false);
    }
  };

  const card = "rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6";

  return (
    <>
      <PageMeta title="Support" description="Aide et contact de l'ambassade." />
      <ToastContainer />
      <PageBreadcrumb pageTitle="Support" />

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Raccourcis + coordonnées */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link to="/services/mesdemandes/gerer" className={`${card} flex items-center gap-3 hover:border-brand-300`}>
            <FileText className="h-6 w-6 text-brand-600" />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">Mes demandes</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Suivre un dossier</p>
            </div>
          </Link>
          <Link to="/services/rendez-vous" className={`${card} flex items-center gap-3 hover:border-brand-300`}>
            <CalendarDays className="h-6 w-6 text-brand-600" />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">Mes rendez-vous</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Déplacer ou annuler</p>
            </div>
          </Link>
          <div className={`${card} flex items-center gap-3`}>
            <LifeBuoy className="h-6 w-6 text-brand-600" />
            <div className="min-w-0 text-xs text-gray-600 dark:text-gray-400">
              <p className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <a href={`mailto:${EMBASSY_CONTACT.email}`} className="truncate hover:underline">
                  {EMBASSY_CONTACT.email}
                </a>
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {EMBASSY_CONTACT.phone}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <section className={card}>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Questions fréquentes</h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">La réponse à votre question s'y trouve peut-être déjà.</p>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {FAQ.map((item, index) => {
              const open = openIndex === index;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : index)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-gray-800 dark:text-white/90"
                  >
                    {item.q}
                    <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && <div className="pb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{item.a}</div>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Mes tickets */}
        {myTickets && myTickets.length > 0 && (
          <section className={card}>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Mes tickets</h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Suivez l'avancement de vos échanges avec l'ambassade.</p>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {myTickets.map((t) => {
                const info = STATUS_INFO[t.status];
                const needsYou = t.status === "WAITING_USER";
                return (
                  <Link key={t.id} to={`/support/tickets/${t.id}`} className="flex items-start justify-between gap-3 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">{t.subject}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-mono">{t.reference}</span> · {CATEGORY_LABELS[t.category]} · dernière activité {formatWhen(t.lastMessageAt)}
                      </p>
                    </div>
                    <Badge color={needsYou ? "warning" : info.color} variant="light" size="sm">
                      {info.label}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Formulaire */}
        <section className={card}>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Écrire à l'ambassade</h3>
          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
            Votre message est transmis aux agents ; ils vous répondent à <span className="font-medium">{user.email}</span>.
          </p>

          {ticket ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-success-200 bg-success-50 p-6 text-center dark:border-success-800 dark:bg-success-500/10">
              <CheckCircle2 className="h-8 w-8 text-success-600" />
              <p className="font-semibold text-gray-800 dark:text-white/90">Votre message a bien été transmis</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Numéro de suivi : <span className="font-mono font-semibold">{ticket.ticket}</span>. Un accusé de réception vous a été envoyé par email.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link to={`/support/tickets/${ticket.id}`} className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
                  Suivre mon ticket
                </Link>
                <Button size="sm" variant="outline" onClick={() => setTicket(null)}>
                  Envoyer un autre message
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Nature de votre demande *</Label>
                  <Select
                    options={CATEGORIES}
                    placeholder="Sélectionnez…"
                    defaultValue={category}
                    onChange={(value) => setCategory(value as SupportCategory)}
                  />
                </div>
                <div>
                  <Label>N° de dossier ou de ticket (facultatif)</Label>
                  <Input placeholder="DEM-2026-0000001" value={reference} maxLength={60} onChange={(e) => setReference(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Objet *</Label>
                <Input placeholder="Résumez votre demande en une phrase" value={subject} maxLength={150} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <Label>Message *</Label>
                <TextArea rows={6} value={message} onChange={(value) => setMessage(value.slice(0, 3000))}placeholder="Expliquez votre situation : plus vous êtes précis(e), plus vite nous pouvons vous aider." />
                <p className="mt-1 text-right text-xs text-gray-400">{message.length}/3000</p>
              </div>
              {error && <p className="text-sm text-error-600 dark:text-error-400">{error}</p>}
              <div className="flex justify-end">
                <Button size="sm" type="submit" disabled={sending} startIcon={<Send className="h-4 w-4" />}>
                  {sending ? "Envoi en cours..." : "Envoyer le message"}
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </>
  );
}
