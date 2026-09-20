import { useEffect, useState } from "react";
import ServiceOverview from "../../components/demandes/ServiceOverview";
import ServiceForm from "../../components/demandes/ServiceForm";
import RegistrationStatusCard from "../../components/registration/RegistrationStatusCard";
import { useRegistration } from "../../context/RegistrationContext";
import { catalogService } from "../../lib/services";
import type { SubServiceDetail } from "../../lib/types";

interface ServiceViewProps {
  /** Identifiant réel du sous-service (catalogue ambassade, ex: "sub-006"). */
  subServiceId: string;
}

function formatFees(sub: SubServiceDetail): string {
  if (sub.basePrice === 0) return "Gratuit";
  if (sub.basePrice == null) return "Selon le dossier";
  return `${sub.basePrice} ${sub.currency ?? "MAD"}`;
}

/**
 * Fiche d'un service : la consultation (pièces, frais, délai) est libre ;
 * le formulaire de demande n'apparaît qu'une fois le dossier d'enregistrement
 * du membre validé — sinon un encart explique la marche à suivre.
 */
export default function ServiceView({ subServiceId }: ServiceViewProps) {
  const { isValidated, loading: registrationLoading } = useRegistration();
  const [sub, setSub] = useState<SubServiceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSub(null);
    setError(null);
    catalogService
      .getSubService(subServiceId)
      .then(setSub)
      .catch(() => setError("Impossible de charger les informations de ce service. Réessayez dans un instant."));
  }, [subServiceId]);

  if (error) {
    return <div className="rounded-xl border border-error-200 bg-error-50 p-5 text-sm text-error-700">{error}</div>;
  }
  if (!sub) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const uploadable = sub.requirements.filter((r) => r.type === "DOCUMENT" || r.type === "PHOTO");
  const onSite = sub.requirements.filter((r) => r.type === "FIELD" || r.type === "SIGNATURE");

  const overview = {
    documents: [
      ...uploadable.map((r) => ({ name: r.label, required: r.required })),
      ...onSite.map((r) => ({ name: `${r.label} (à fournir sur place)`, required: r.required })),
    ],
    fees: formatFees(sub),
    delay: `${sub.slaDays} jour${sub.slaDays > 1 ? "s" : ""}`,
    extraInfo:
      "Les frais éventuels se règlent en espèces auprès de l'ambassade — aucun paiement en ligne." +
      (sub.requiresInPerson ? " Votre présence à l'ambassade est nécessaire pour finaliser ce service." : ""),
  };

  return (
    <div className="space-y-6">
      <ServiceOverview {...overview} />
      {registrationLoading ? null : isValidated ? <ServiceForm subService={sub} /> : <RegistrationStatusCard />}
    </div>
  );
}
