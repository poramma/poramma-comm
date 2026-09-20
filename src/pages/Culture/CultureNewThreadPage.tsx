import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLeft, Send } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import RegistrationStatusCard from "../../components/registration/RegistrationStatusCard";
import { useAuth } from "../../context/AuthContext";
import { useRegistration } from "../../context/RegistrationContext";
import { cultureService } from "../../lib/services";

/** Premier message au Conseiller Culturel : ouvre un échange direct, suivi ensuite dans « Mes échanges ». */
export default function CultureNewThreadPage() {
  const { user, loading } = useAuth();
  const { isValidated, loading: registrationLoading } = useRegistration();
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace state={{ from: "/culture/echanges/nouveau" }} />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (subject.trim().length < 3) return setError("Indiquez l'objet de votre message.");
    if (message.trim().length < 10) return setError("Écrivez votre message en quelques phrases (10 caractères minimum).");

    setSending(true);
    try {
      const thread = await cultureService.createThread({ subject: subject.trim(), message: message.trim() });
      toast.success("Message envoyé au Conseiller Culturel.");
      setTimeout(() => navigate(`/culture/echanges/${thread.id}`), 700);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Votre message n'a pas pu être envoyé.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageMeta title="Écrire au Conseiller Culturel" description="Envoyez un message direct au Conseiller Culturel de l'ambassade." />
      <ToastContainer />
      <PageBreadcrumb pageTitle="Écrire au conseiller" />

      <div className="mx-auto max-w-3xl space-y-5">
        <Link to="/culture" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600 dark:text-gray-400">
          <ArrowLeft className="h-4 w-4" />
          Espace culturel
        </Link>

        {registrationLoading ? null : !isValidated ? (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pour écrire au Conseiller Culturel, vous devez d'abord être enregistré(e) auprès de l'ambassade.</p>
            <RegistrationStatusCard />
          </>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            {error && <p className="rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-800 dark:bg-error-500/10">{error}</p>}
            <div>
              <Label>Objet</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value.slice(0, 150))} placeholder="Sujet de votre message" />
            </div>
            <div>
              <Label>Votre message</Label>
              <TextArea rows={7} value={message} onChange={(v) => setMessage(v.slice(0, 3000))} placeholder="Écrivez directement au Conseiller Culturel…" />
              <p className="mt-1 text-right text-xs text-gray-400">{message.length}/3000</p>
            </div>
            <p className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              Votre message est lu par le Conseiller Culturel, qui vous répond <strong>en son nom</strong>. Vous êtes prévenu(e) par notification et par email.
            </p>
            <div className="flex justify-end">
              <Button type="submit" disabled={sending} startIcon={<Send className="h-4 w-4" />}>
                {sending ? "Envoi…" : "Envoyer"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
