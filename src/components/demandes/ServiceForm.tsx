import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Paperclip } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StepIndicator from "./StepIndicator";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Label from "../form/Label";
import Textarea from "../form/input/TextArea";
import DatePicker from "../form/date-picker";
import { useAuth } from "../../context/AuthContext";
import { demandeService, documentService } from "../../lib/services";
import type { SubServiceDetail } from "../../lib/types";

interface ServiceFormProps {
  subService: SubServiceDetail;
}

const STEPS = ["Informations personnelles", "Pièces justificatives", "Révision et soumission"];
const ACCEPTED = ".pdf,.jpg,.jpeg,.png";

interface UploadedFile {
  key: string;
  documentId: string;
}

const fileKey = (f: File) => `${f.name}|${f.size}|${f.lastModified}`;

/**
 * Formulaire de demande d'un service — trois étapes, aucun paiement en ligne
 * (les frais se règlent en espèces à l'ambassade). Les pièces sont réellement
 * téléversées puis jointes au dossier côté serveur ; le serveur exige à son
 * tour les pièces obligatoires du sous-service, quoi que l'écran affiche.
 */
export default function ServiceForm({ subService }: ServiceFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const slots = subService.requirements.filter((r) => r.type === "DOCUMENT" || r.type === "PHOTO");
  const onSite = subService.requirements.filter((r) => r.type === "FIELD" || r.type === "SIGNATURE");

  const defaultName = [user?.profile?.firstName, user?.profile?.lastName].filter(Boolean).join(" ");
  const [currentStep, setCurrentStep] = useState(0);
  const [nom, setNom] = useState(defaultName);
  const [dateNaissance, setDateNaissance] = useState("");
  const [nationalite, setNationalite] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  // Pièces déjà envoyées lors d'une tentative précédente — évite les doublons si la création échoue puis qu'on réessaie.
  const uploaded = useRef<Record<string, UploadedFile>>({});

  const validateStep = (): boolean => {
    const next: Record<string, string> = {};
    if (currentStep === 0) {
      if (!nom.trim()) next.nom = "Le nom complet est requis";
      if (!dateNaissance) next.dateNaissance = "La date de naissance est requise";
      if (!nationalite) next.nationalite = "La nationalité est requise";
    }
    if (currentStep === 1) {
      slots.forEach((r) => {
        if (r.required && !files[r.id]) next[r.id] = `« ${r.label} » est requis`;
      });
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) {
      toast.error("Veuillez corriger les erreurs avant de continuer.");
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const attachments: { requirementId: string; documentId: string }[] = [];
      for (const r of slots) {
        const file = files[r.id];
        if (!file) continue;
        const key = fileKey(file);
        const cached = uploaded.current[r.id];
        if (cached && cached.key === key) {
          attachments.push({ requirementId: r.id, documentId: cached.documentId });
          continue;
        }
        const doc = await documentService.upload(file, r.type === "PHOTO" ? "PHOTO" : "OTHER");
        uploaded.current[r.id] = { key, documentId: doc.id };
        attachments.push({ requirementId: r.id, documentId: doc.id });
      }

      const demande = await demandeService.create({
        subServiceId: subService.id,
        customPayload: { nom, dateNaissance, nationalite, commentaire },
        documents: attachments,
      });

      toast.success(`Demande soumise ! N° de dossier : ${demande.dossierNumber}`);
      setTimeout(() => navigate(`/services/mesdemandes/details/${demande.id}`), 1200);
    } catch (err: any) {
      const data = err.response?.data;
      const missing: string[] | undefined = data?.details?.documents;
      toast.error(
        missing?.length ? `Pièces manquantes : ${missing.join(", ")}` : data?.message || "Erreur lors de la soumission de la demande"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-4">
          <div>
            <Label>Nom complet</Label>
            <Input
              placeholder="Entrez votre nom complet"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              error={!!errors.nom}
              hint={errors.nom}
            />
          </div>
          <div>
            <DatePicker
              id="date-picker"
              label="Date de naissance"
              placeholder="Sélectionnez une date"
              onChange={(v) => setDateNaissance(Array.isArray(v) ? v[0]?.toISOString().slice(0, 10) : (v as any))}
            />
            {errors.dateNaissance && <p className="text-sm text-error-500 mt-1">{errors.dateNaissance}</p>}
          </div>
          <div>
            <Label>Nationalité</Label>
            <Select
              options={[
                { value: "mali", label: "Mali" },
                { value: "autre", label: "Autre" },
              ]}
              defaultValue={nationalite}
              onChange={(value) => setNationalite(value)}
              error={!!errors.nationalite}
              hint={errors.nationalite}
            />
          </div>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="space-y-4">
          {slots.length === 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-300">Aucune pièce à téléverser pour ce service.</p>
          )}
          {slots.map((r) => (
            <div key={r.id}>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                {r.label} {r.required && <span className="text-error-500">*</span>}
              </label>
              {r.description && <p className="text-xs text-gray-500 dark:text-gray-400">{r.description}</p>}
              <input
                type="file"
                accept={ACCEPTED}
                title={r.label}
                className="mt-1 block w-full text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                onChange={(e) => setFiles((prev) => ({ ...prev, [r.id]: e.target.files?.[0] ?? null }))}
              />
              {errors[r.id] && <p className="text-sm text-error-500 mt-1">{errors[r.id]}</p>}
            </div>
          ))}
          {onSite.length > 0 && (
            <div className="rounded-lg bg-gray-50 dark:bg-white/5 p-3 text-sm text-gray-700 dark:text-gray-300">
              À fournir directement à l'ambassade : {onSite.map((r) => r.label).join(", ")}.
            </div>
          )}
        </div>
      );
    }

    const feesText =
      subService.basePrice === 0 ? "Gratuit" : subService.basePrice == null ? "selon le dossier" : `${subService.basePrice} ${subService.currency ?? "MAD"}`;
    return (
      <div className="space-y-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Vérifiez vos informations avant de soumettre. Délai estimé : <strong>{subService.slaDays} jour{subService.slaDays > 1 ? "s" : ""}</strong>.
        </p>
        <ul className="text-sm text-neutral-600 dark:text-neutral-300 space-y-1">
          <li><strong>Service :</strong> {subService.name}</li>
          <li><strong>Nom :</strong> {nom}</li>
          <li><strong>Date de naissance :</strong> {dateNaissance}</li>
          <li><strong>Nationalité :</strong> {nationalite}</li>
          {slots.map((r) => (
            <li key={r.id} className="flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" /> <strong>{r.label} :</strong> {files[r.id]?.name ?? "non fourni"}
            </li>
          ))}
        </ul>
        <div className="rounded-lg bg-brand-50 dark:bg-brand-500/10 p-3 text-sm text-brand-800 dark:text-brand-200">
          Frais : <strong>{feesText}</strong> — à régler en espèces auprès de l'ambassade. Aucun paiement n'est demandé en ligne.
        </div>
        <div>
          <Label>Commentaires supplémentaires</Label>
          <Textarea placeholder="Ajoutez des précisions..." value={commentaire} onChange={(value) => setCommentaire(value)} />
        </div>
      </div>
    );
  };

  const isLast = currentStep === STEPS.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-neutral-50 dark:bg-neutral-800 shadow-theme-md rounded-radius-lg p-4 sm:p-6 space-y-6 font-outfit"
      aria-labelledby="service-form-title"
    >
      <ToastContainer />
      <h2 id="service-form-title" className="text-title-md font-heading font-bold text-neutral-700 dark:text-neutral-50">
        Formulaire de demande
      </h2>
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <Button
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          variant="outline"
          disabled={currentStep === 0 || submitting}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Précédent
        </Button>
        <Button
          onClick={isLast ? handleSubmit : handleNext}
          variant="primary"
          disabled={submitting}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white"
        >
          {submitting ? (
            <span className="animate-pulse">Envoi en cours...</span>
          ) : isLast ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Soumettre ma demande
            </>
          ) : (
            <>
              Suivant <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
