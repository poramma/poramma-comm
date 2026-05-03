import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function LegalisationCopiePasseport() {
  const overview = {
    documents: [
      {name: "Copie du passeport", required: true},
      {name: "Passeport original pour vérification", required: true},
    ],
    isFree: false,
    fees: "50 MAD",
    delay: "1 jour ouvrable",
    extraInfo: "La copie doit être claire et lisible."
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
        title="Légalisation copie du passeport"
        description="Service de légalisation d'une copie de passeport."
      />
      <PageBreadcrumb pageTitle="Légalisation copie du passeport" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
