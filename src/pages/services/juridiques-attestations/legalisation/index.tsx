// src/pages/services/legalisation/index.tsx
import React from "react";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import ServiceView from "../../ServiceView";

export default function Legalisation() {
  const overview = {
    documents: [
      {name: "Document original à légaliser", required: true},
      {name: "Copie de la pièce d’identité", required: true},
      {name: "Justificatif de domicile", required: true},
    ],
    isFree: false,
    fees: "50 MAD",
    delay: "1 jour ouvrable",
    extraInfo: "Les documents doivent être présentés en version originale."
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
        title="Légalisation / Authentification"
        description="Demande de légalisation ou authentification de documents."
      />
      <PageBreadcrumb pageTitle="Légalisation / Authentification" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
