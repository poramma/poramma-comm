import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function LaissezPasser() {
  const overview = {
    documents: [
      {name: "Pièce d'identité valide ou passeport expiré", required: true},
      {name: "2 photos d’identité récentes", required: true},
      {name: "Justificatif du motif de voyage", required: true},
      {name: "Formulaire de demande de laissez-passer", required: true}
    ],
    isFree: false,
    fees: "300 MAD",
    delay: "2 jours ouvrables",
    extraInfo: "Le laissez-passer est délivré uniquement en cas d'urgence ou d'absence de passeport valide."
  };

  const steps = [
    "Informations personnelles",
    "Téléversement documents",
    "Révision des informations",
    "Paiement et soumission"
  ];

  return (
    <>
      <PageMeta title="Laissez-Passer" description="Demande de laissez-passer" />
      <PageBreadcrumb pageTitle="Laissez-Passer" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
