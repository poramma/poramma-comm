import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "react-toastify";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import { useRegistration } from "../../context/RegistrationContext";
import { documentService, userService } from "../../lib/services";
import type { FullUserProfile, MyDocument } from "../../lib/types";

const USER_TYPE_LABELS: Record<string, string> = {
  student: "Étudiant(e)",
  worker: "Travailleur(se)",
  migrant: "Migrant(e)",
  other: "Autre situation",
};

const DOC_STATUS: Record<string, { label: string; color: "brand" | "success" | "error" | "warning" | "light" }> = {
  UPLOADED: { label: "Reçue", color: "brand" },
  IN_REVIEW: { label: "En cours de vérification", color: "warning" },
  ACCEPTED: { label: "Acceptée", color: "success" },
  REJECTED: { label: "Refusée", color: "error" },
  EXPIRED: { label: "Expirée", color: "error" },
};

const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : null;

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <dt className="sm:w-56 shrink-0 text-sm text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="text-sm font-medium text-gray-900 dark:text-white">{value || <span className="font-normal text-gray-400">Non renseigné</span>}</dd>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
    <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
    <dl>{children}</dl>
  </section>
);

/**
 * « Mon dossier » : ce que l'ambassade a reçu (informations, suivi, pièces),
 * en lecture seule — affiché une fois le dossier transmis, validé ou suspendu.
 */
export default function RegistrationDossier() {
  const { user } = useAuth();
  const { registration } = useRegistration();
  const [profile, setProfile] = useState<FullUserProfile | null>(null);
  const [docs, setDocs] = useState<MyDocument[]>([]);

  useEffect(() => {
    if (user) userService.getProfile(user.id).then(setProfile).catch(() => toast.error("Impossible de charger vos informations."));
    documentService.listMine().then(setDocs).catch(() => undefined);
  }, [user]);

  if (!registration) return null;
  const docById = new Map(docs.map((d) => [d.id, d]));
  const type = registration.userType;
  const p = profile;

  const download = async (doc: MyDocument) => {
    try {
      const blob = await documentService.download(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file?.originalName ?? "document";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Impossible de télécharger ce document.");
    }
  };

  return (
    <div className="space-y-4">
      <Section title="Mes informations">
        <Row label="Nom complet" value={p ? `${p.personalInfo.firstName} ${p.personalInfo.lastName}`.trim() : ""} />
        <Row label="Adresse email" value={user?.email} />
        <Row label="Téléphone" value={p?.personalInfo.phone} />
        <Row label="Ville de résidence" value={p?.address.city} />
        <Row label="Adresse au Maroc" value={p?.address.address} />
        <Row label="Situation" value={USER_TYPE_LABELS[type]} />
      </Section>

      {type === "student" && (
        <Section title="Informations académiques">
          <Row label="Établissement" value={p?.studentProfile?.university} />
          <Row label="Faculté / filière" value={p?.studentProfile?.faculty} />
          <Row label="Niveau d'études" value={p?.studentProfile?.studyLevel} />
          <Row
            label="Boursier(ère) de l'État malien"
            value={p?.studentProfile?.scholarship?.isRecipient ? `Oui${p.studentProfile.scholarship.decisionNumber ? ` — décision n° ${p.studentProfile.scholarship.decisionNumber}` : ""}` : "Non"}
          />
        </Section>
      )}

      {type === "worker" && (
        <Section title="Informations professionnelles">
          <Row label="Employeur" value={p?.workerProfile?.employer} />
          <Row label="Profession" value={p?.workerProfile?.profession} />
          <Row label="Type de contrat" value={p?.workerProfile?.contractType} />
        </Section>
      )}

      <Section title="Suivi de mon dossier">
        <Row label="Transmis à l'ambassade le" value={formatDate(registration.submittedAt)} />
        <Row label="Examiné le" value={formatDate(registration.reviewedAt)} />
        {registration.registrationStatus === "VALIDATED" && (
          <Row label="Numéro INUE" value={registration.inue ? `${registration.inue}${registration.inueAssignedAt ? ` (attribué le ${formatDate(registration.inueAssignedAt)})` : ""}` : "En cours d'attribution"} />
        )}
        {registration.reviewNote && <Row label="Note de l'ambassade" value={registration.reviewNote} />}
      </Section>

      <Section title="Pièces déposées">
        {registration.documents.items.map((item) => {
          const doc = item.documentId ? docById.get(item.documentId) : undefined;
          const status = DOC_STATUS[item.documentStatus ?? doc?.status ?? ""];
          return (
            <div key={item.key} className="flex flex-col sm:flex-row sm:items-center gap-2 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {item.provided ? (doc?.file?.originalName ?? "Fichier reçu") : item.optional ? "Non fournie (facultative)" : "Non fournie"}
                </p>
              </div>
              {item.provided && status && <Badge variant="outline" color={status.color}>{status.label}</Badge>}
              {doc && (
                <Button size="sm" variant="outline" onClick={() => download(doc)}>
                  <Download className="w-4 h-4 mr-1" /> Télécharger
                </Button>
              )}
            </div>
          );
        })}
      </Section>
    </div>
  );
}
