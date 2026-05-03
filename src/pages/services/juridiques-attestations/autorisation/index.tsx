// src/pages/services/autorisation-parentale/index.tsx
import React from "react";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import ServiceView from "../../ServiceView";

export default function AutorisationParentale() {
  const overview = {
    documents: [
      {name: "Formulaire d’autorisation rempli et signé par les parents/tuteurs", required: true},
      {name: "Copie des pièces d’identité des parents/tuteurs", required: true},
      {name: "Acte de naissance de l’enfant", required: true},
    ],
    isFree: false,
    fees: "50 MAD",
    delay: "2 jours ouvrables",
    extraInfo: "L’autorisation est valable uniquement pour l’objet indiqué."
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
        title="Autorisation parentale"
        description="Demande d’autorisation parentale."
      />
      <PageBreadcrumb pageTitle="Autorisation parentale" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
