import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock3, AlertTriangle, ShieldAlert, UserPlus } from "lucide-react";
import Button from "../ui/button/Button";
import { useRegistration } from "../../context/RegistrationContext";

/**
 * Explique où en est l'enregistrement auprès de l'ambassade et ce que le
 * membre peut faire ensuite. Utilisé sur le tableau de bord et à la place
 * des formulaires de service tant que le dossier n'est pas validé.
 */
export default function RegistrationStatusCard({ className = "", hideAction = false }: { className?: string; hideAction?: boolean }) {
  const navigate = useNavigate();
  const { registration, loading } = useRegistration();

  if (loading && !registration) {
    return <div className={`rounded-xl border border-gray-200 dark:border-gray-800 p-5 text-sm text-gray-500 ${className}`}>Chargement de votre dossier…</div>;
  }
  if (!registration) return null;

  const go = () => navigate("/enregistrement");

  const variants = {
    INCOMPLETE: {
      icon: UserPlus,
      tone: "border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-500/10",
      title: "Enregistrement auprès de l'ambassade requis",
      text: "Pour demander un service consulaire, prendre un rendez-vous ou échanger avec l'ambassade, vous devez d'abord vous enregistrer : indiquez votre situation et déposez vos pièces justificatives. Vous pouvez en attendant consulter tous les services et leurs conditions.",
      cta: "Je m'enregistre",
    },
    SUBMITTED: {
      icon: Clock3,
      tone: "border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-500/10",
      title: "Dossier reçu — en cours d'examen",
      text: "Votre dossier d'enregistrement a bien été transmis à l'ambassade. Un agent va l'examiner ; vous serez informé dès qu'il sera validé. Les demandes et rendez-vous seront alors accessibles.",
      cta: "Voir mon dossier",
    },
    REJECTED: {
      icon: AlertTriangle,
      tone: "border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-500/10",
      title: "Votre dossier doit être corrigé",
      text: registration.reviewNote
        ? `Motif indiqué par l'ambassade : « ${registration.reviewNote} ». Corrigez les informations ou pièces concernées puis soumettez à nouveau.`
        : "L'ambassade a demandé des corrections. Vérifiez vos informations et pièces puis soumettez à nouveau.",
      cta: "Corriger mon dossier",
    },
    SUSPENDED: {
      icon: ShieldAlert,
      tone: "border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-500/10",
      title: "Dossier suspendu",
      text: registration.reviewNote
        ? `Motif : « ${registration.reviewNote} ». Contactez l'ambassade pour régulariser votre situation.`
        : "Votre dossier est suspendu. Contactez l'ambassade pour régulariser votre situation.",
      cta: "Voir mon dossier",
    },
    VALIDATED: {
      icon: CheckCircle2,
      tone: "border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-500/10",
      title: "Vous êtes enregistré auprès de l'ambassade",
      text: registration.inue
        ? `Votre numéro INUE : ${registration.inue}. Tous les services consulaires sont accessibles.`
        : "Votre dossier est validé. Votre numéro INUE vous sera communiqué prochainement.",
      cta: "Voir mon dossier",
    },
  } as const;

  const v = variants[registration.registrationStatus];
  const Icon = v.icon;

  return (
    <div className={`rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${v.tone} ${className}`}>
      <Icon className="w-8 h-8 shrink-0 text-gray-700 dark:text-gray-200" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-white">{v.title}</h3>
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{v.text}</p>
      </div>
      {!hideAction && (
        <Button variant={registration.registrationStatus === "VALIDATED" ? "outline" : "primary"} onClick={go}>
          {v.cta}
        </Button>
      )}
    </div>
  );
}
