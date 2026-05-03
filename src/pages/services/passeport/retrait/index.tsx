import React from "react";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import ServiceView from "../../ServiceView";

export default function RetraitPasseport() {
  const overview = {
    documents: [
      {name: "Reçu de demande", required: true},
      {name: "Pièce d'identité valide", required: true}
    ],
    isFree: true,
    fees: "0 MAD",
    delay: "Le jour même",
    extraInfo: "Présentez-vous avec votre reçu et pièce d’identité pour retirer le passeport."
  };

  const steps = [
    "Vérification de l'identité",
    "Réception du passeport",
    "Confirmation du retrait"
  ];

  return (
    <>
      <PageMeta title="Retrait Passeport" description="Procédure de retrait du passeport" />
      <PageBreadcrumb pageTitle="Retrait du Passeport" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
