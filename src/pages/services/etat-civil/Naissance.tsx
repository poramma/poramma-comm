// src/pages/services/etat-civil/Naissance.tsx
import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function ActeNaissance() {
  const overview = {
    documents: [
      {name: "Formulaire de demande d’acte de naissance rempli et signé", required: true},
      {name: "Copie intégrale ou extrait de naissance (si disponible)", required: true},
      {name: "Copie de la pièce d’identité du demandeur", required: true},
      {name: "Justificatif de lien de parenté (si demande pour un tiers)", required: true},
    ],
    isFree: false,
    fees: "40 MAD",
    delay: "1 à 3 jours ouvrables",
    extraInfo: "L’acte de naissance est délivré en version papier signée et cachetée."
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
        title="Demande d’acte de naissance"
        description="Effectuez la demande d’un acte de naissance officiel."
      />
      <PageBreadcrumb pageTitle="Demande d’acte de naissance" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
