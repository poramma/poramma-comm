import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function ProcurationRetraitCarteBiometrique() {
  const overview = {
    documents: [
      {name: "Lettre de procuration signée", required: true},
      {name: "Copie de la carte biométrique ou récépissé du mandant", required: true},
      {name: "Copie de la pièce d'identité du mandataire", required: true},
      {name: "Preuve de paiement des frais", required: true}
    ],
    isFree: false,
    fees: "50 MAD",
    delay: "1 jour ouvrable",
    extraInfo: "La procuration doit être claire et lisible, avec les pièces justificatives jointes."
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
        title="Procuration - Retrait carte biométrique"
        description="Service de procuration pour le retrait d'une carte biométrique."
      />
      <PageBreadcrumb pageTitle="Procuration - Retrait carte biométrique" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
