import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function Procuration() {
  const overview = {
    documents: [
      {name: "Copie de la pièce d'identité du mandant", required: true},
      {name: "Copie de la pièce d'identité du mandataire", required: true},
      {name: "Lettre de procuration signée", required: true},
      {name: "Justificatif de lien entre mandant et mandataire", required: true},
    ],
    isFree: false,
    fees: "100 MAD",
    delay: "2 jours ouvrables",
    extraInfo: "La procuration doit être signée en présence d’un agent consulaire."
  };

  const steps = [
    "Informations personnelles",
    "Téléversement documents",
    "Révision des informations",
    "Paiement et soumission"
  ];

  return (
    <>
      <PageMeta
        title="Demande de Procuration"
        description="Formulaire et étapes pour la demande de procuration."
      />
      <PageBreadcrumb pageTitle="Procuration" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
