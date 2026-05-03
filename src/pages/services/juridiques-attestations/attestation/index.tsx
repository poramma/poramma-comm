// src/pages/services/attestations/index.tsx
import React from "react";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import ServiceView from "../../ServiceView";

export default function Attestations() {
  const overview = {
    documents: [
      {name: "Formulaire de demande rempli et signé", required: true},
      {name: "Copie de la pièce d’identité", required: true},
      {name: "Justificatif de domicile", required: true},
      {name: "Toute pièce justificative liée à l’attestation demandée", required: true},
    ],
    isFree: false,
    fees: "80 MAD",
    delay: "1 à 2 jours ouvrables",
    extraInfo: "L’attestation sera délivrée sous format papier, signée et cachetée."
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
        title="Demande d’Attestation"
        description="Effectuez une demande d’attestation officielle."
      />
      <PageBreadcrumb pageTitle="Demande d’Attestation" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
