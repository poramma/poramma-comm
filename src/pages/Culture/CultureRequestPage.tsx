import { useEffect, useMemo, useState } from "react";
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
import { cultureService, demandeService } from "../../lib/services";
import type { CultureOverview } from "../../lib/types";

/** Dépôt d'une demande adressée au Conseiller Culturel (projet, partenariat, soutien à un événement, information). */
export default function CultureRequestPage() {
  const { user, loading } = useAuth();
  const { isValidated, loading: registrationLoading } = useRegistration();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<CultureOverview | null>(null);
  const [subServiceId, setSubServiceId] = useState("");
  const [objet, setObjet] = useState("");
  const [description, setDescription] = useState("");
  const [dateSouhaitee, setDateSouhaitee] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) cultureService.overview().then(setOverview).catch(() => toast.error("Impossible de charger les prestations culturelles."));
  }, [user]);

  // Les prestations « demande » (celles qui ne se réservent pas comme un rendez-vous).
  const options = useMemo(() => overview?.services.flatMap((s) => s.subServices.filter((sub) => sub.kind === "DEMANDE")) ?? [], [overview]);
  const selected = options.find((o) => o.id === subServiceId);

  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace state={{ from: "/culture/demande" }} />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!subServiceId) return setError("Choisissez la nature de votre demande.");
    if (objet.trim().length < 3) return setError("Indiquez l'objet de votre demande.");
    if (description.trim().length < 20) return setError("Décrivez votre demande en quelques phrases (20 caractères minimum).");

    setSending(true);
    try {
      const demande = await demandeService.create({
        subServiceId,
        customPayload: { objet: objet.trim(), description: description.trim(), ...(dateSouhaitee ? { dateSouhaitee } : {}) },
      });
      toast.success("Votre demande a été transmise au Conseiller Culturel.");
      setTimeout(() => navigate(`/services/mesdemandes/details/${demande.id}`), 900);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Votre demande n'a pas pu être envoyée.");
    } finally {
      setSending(false);
    }
  };

  const card = "rounded-2xl border border-gray-200 bg-white p-5 space-y-4 dark:border-gray-800 dark:bg-white/[0.03]";

  return (
    <>
      <PageMeta title="Adresser une demande au Conseiller Culturel" description="Projet, partenariat, soutien à un événement ou information culturelle." />
      <ToastContainer />
      <PageBreadcrumb pageTitle="Demande culturelle" />

      <div className="mx-auto max-w-3xl space-y-5">
        <Link to="/culture" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600 dark:text-gray-400">
          <ArrowLeft className="h-4 w-4" />
          Espace culturel
        </Link>

        {registrationLoading ? null : !isValidated ? (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pour adresser une demande, vous devez d'abord être enregistré(e) auprès de l'ambassade.</p>
            <RegistrationStatusCard />
          </>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            {error && <p className="rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-800 dark:bg-error-500/10">{error}</p>}

            <div className={card}>
              <Label>Nature de la demande</Label>
              {options.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Chargement…</p>
              ) : (
                <div className="grid gap-3">
                  {options.map((o) => (
                    <label
                      key={o.id}
                      className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${
                        subServiceId === o.id ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      }`}
                    >
                      <input type="radio" name="subService" className="mt-1" checked={subServiceId === o.id} onChange={() => setSubServiceId(o.id)} />
                      <span>
                        <span className="block font-medium text-gray-900 dark:text-white">{o.name}</span>
                        {o.description && <span className="block text-sm text-gray-600 dark:text-gray-400">{o.description}</span>}
                        <span className="mt-0.5 block text-xs text-gray-500">Réponse sous {o.slaDays} jours environ</span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className={card}>
              <div>
                <Label>Objet</Label>
                <Input value={objet} onChange={(e) => setObjet(e.target.value.slice(0, 150))} placeholder="En une phrase : de quoi s'agit-il ?" />
              </div>
              <div>
                <Label>Votre demande</Label>
                <TextArea rows={6} value={description} onChange={(v) => setDescription(v.slice(0, 3000))} placeholder="Présentez votre projet, votre événement ou votre question : contexte, objectifs, public, besoins…" />
                <p className="mt-1 text-right text-xs text-gray-400">{description.length}/3000</p>
              </div>
              <div>
                <Label>Date souhaitée (facultatif)</Label>
                <Input type="date" value={dateSouhaitee} onChange={(e) => setDateSouhaitee(e.target.value)} />
              </div>
              <p className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                Votre demande est traitée <strong>personnellement par le Conseiller Culturel</strong>, qui vous répondra en son nom dans l'espace d'échange du dossier.
                {selected ? ` Délai indicatif : ${selected.slaDays} jours.` : ""}
              </p>
              <div className="flex justify-end">
                <Button type="submit" disabled={sending} startIcon={<Send className="h-4 w-4" />}>
                  {sending ? "Envoi…" : "Envoyer ma demande"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
