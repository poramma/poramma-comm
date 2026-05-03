import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function TransfertCorps() {
  const overview = {
    documents: [
      {name: "Certificat de décès", required: true},
      {name: "Autorisation de transport de corps", required: true},
      {name: "Pièce d'identité du défunt", required: true},
      {name: "Pièce d'identité du demandeur", required: true},
      {name: "Preuve de lien de parenté", required: true},
    ],
    isFree: false,
    fees: "Variable selon le pays",
    delay: "5 à 10 jours ouvrables",
    extraInfo: "Veuillez contacter le consulat pour confirmer les procédures spécifiques au pays."
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
        title="Transfert de Corps"
        description="Demande officielle pour le transfert de corps vers le Mali."
      />
      <PageBreadcrumb pageTitle="Transfert de Corps" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
