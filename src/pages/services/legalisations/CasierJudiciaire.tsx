import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function LegalisationCasierJudiciaire() {
  const overview = {
    documents: [
      {name: "Casier judiciaire délivré par les autorités compétentes", required: true},
      {name: "Pièce d’identité en cours de validité", required: true},
    ],
    isFree: false,
    fees: "50 MAD",
    delay: "1 jour ouvrable",
    extraInfo: "Le document doit être original et non périmé."
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
        title="Légalisation casier judiciaire"
        description="Service de légalisation d'un casier judiciaire."
      />
      <PageBreadcrumb pageTitle="Légalisation casier judiciaire" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
