import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function LegalisationCasierJudiciaireEtudiant() {
  const overview = {
    documents: [
      {name: "Casier judiciaire étudiant délivré par les autorités compétentes", required: true},
      {name: "Carte d'étudiant en cours de validité", required: true},
      {name: "Pièce d’identité", required: true}
    ],
    isFree: true,
    fees: "0 MAD",
    delay: "1 jour ouvrable",
    extraInfo: "Le service est gratuit pour les étudiants avec justificatif."
  };

  const steps = [
    "Informations personnelles",
    "Téléversement documents",
    "Révision des informations",
    "Soumission"
  ];

  return (
    <>
      <PageMeta
        title="Légalisation casier judiciaire étudiant"
        description="Service gratuit de légalisation pour les étudiants."
      />
      <PageBreadcrumb pageTitle="Légalisation casier judiciaire étudiant" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
