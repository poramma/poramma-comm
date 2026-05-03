import React from "react";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import ServiceView from "../../ServiceView";

export default function PasseportOrdinaire() {
  const overview = {
    documents: [
      {name: "Acte de naissance ou copie intégrale", required: true},
      {name: "Pièce d'identité valide", required: true},
      {name: "Justificatif de domicile", required: true},
      {name: "Photos d’identité récentes", required: true}
    ],
    isFree: false,
    fees: "Voir tarifs visa",
    delay: "7 à 10 jours ouvrables",
    extraInfo: "Les frais varient selon la durée et le type de passeport."
  };

  const steps = [
    "Informations personnelles",
    "Téléversement documents",
    "Révision des informations",
    "Paiement des frais",
  ];

  return (
    <>
      <PageMeta title="Passeport Ordinaire" description="Demande de passeport ordinaire" />
      <PageBreadcrumb pageTitle="Passeport Ordinaire" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
