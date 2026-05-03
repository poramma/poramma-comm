import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function ProcurationMandatsSpeciaux() {
  const overview = {
    documents: [
      {name: "Lettre de procuration signée", required: true},
      {name: "Copie de la pièce d'identité du mandant", required: true},
      {name: "Copie de la pièce d'identité du mandataire", required: true},
      {name: "Preuve de paiement des frais", required: true}
    ],
    isFree: false,
    fees: "50 MAD",
    delay: "1 jour ouvrable",
    extraInfo: "La procuration doit préciser clairement le mandat et être signée."
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
        title="Procuration - Mandats spéciaux"
        description="Service pour procurations relatives à des mandats spéciaux."
      />
      <PageBreadcrumb pageTitle="Procuration - Mandats spéciaux" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
