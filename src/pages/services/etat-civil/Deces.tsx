// src/pages/services/etat-civil/Deces.tsx
import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function ActeDeces() {
  const overview = {
    documents: [
      {name: "Formulaire de demande d’acte de décès rempli et signé", required: true},
      {name: "Certificat médical de décès (si disponible)", required: true},
      {name: "Copie de la pièce d’identité du défunt (si disponible)", required: true},
      {name: "Pièce d’identité du demandeur", required: true},
      {name: "Justificatif de lien avec le défunt", required: true},
    ],
    isFree: false,
    fees: "40 DH",
    delay: "2 à 3 jours ouvrables",
    extraInfo: "L’acte de décès est délivré en version papier signée et cachetée."
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
        title="Demande d’acte de décès"
        description="Effectuez la demande d’un acte de décès officiel."
      />
      <PageBreadcrumb pageTitle="Demande d’acte de décès" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
