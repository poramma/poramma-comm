// src/pages/services/etat-civil/Mariage.tsx
import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function ActeMariage() {
  const overview = {
    documents: [
      {name: "Formulaire de demande d’acte de mariage rempli et signé", required: true},
      {name: "Copie intégrale ou extrait d’acte de mariage (si disponible)", required: true},
      {name: "Pièces d’identité des époux", required: true},
      {name: "Justificatif de domicile", required: true},
    ],
    isFree: false,
    fees: "60 DH",
    delay: "2 à 4 jours ouvrables",
    extraInfo: "L’acte de mariage est délivré en version papier signée et cachetée."
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
        title="Demande d’acte de mariage"
        description="Effectuez la demande d’un acte de mariage officiel."
      />
      <PageBreadcrumb pageTitle="Demande d’acte de mariage" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
