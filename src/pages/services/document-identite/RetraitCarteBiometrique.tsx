import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function RetraitCarteBiometrique() {
  const overview = {
    documents: [
      {name: "Reçu de demande", required: true},
      {name: "Pièce d'identité valide", required: true}
    ],
    isFree: true,
    fees: "0 MAD",
    delay: "Le jour même",
    extraInfo: "Présentez-vous avec votre reçu et pièce d’identité pour retirer votre carte."
  };

  const steps = [
    "Vérification de l'identité",
    "Réception de la carte",
    "Confirmation de retrait"
  ];

  return (
    <>
      <PageMeta title="Retrait Carte Biométrique" description="Procédure de retrait de la carte biométrique sécurisée" />
      <PageBreadcrumb pageTitle="Retrait Carte Biométrique Sécurisée" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
