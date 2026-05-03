import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function ProcurationRetraitPasseport() {
  const overview = {
    documents: [
      {name: "Lettre de procuration signée", required: true},
      {name: "Copie du passeport ou récépissé du mandant", required: true},
      {name: "Copie de la pièce d'identité du mandataire", required: true},
      {name: "Preuve de paiement des frais", required: true}
    ],
    isFree: false,
    fees: "50 MAD",
    delay: "1 jour ouvrable",
    extraInfo: "Le nom du mandataire doit correspondre exactement à celui figurant sur la procuration."
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
        title="Procuration - Retrait passeport"
        description="Service de procuration pour le retrait d'un passeport."
      />
      <PageBreadcrumb pageTitle="Procuration - Retrait passeport" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
