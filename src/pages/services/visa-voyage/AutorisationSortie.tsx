import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function AutorisationSortie() {
  const overview = {
    documents: [
      {name: "Pièce d'identité valide", required: true},
      {name: "Passeport valide (si applicable)", required: true},
      {name: "Formulaire d’autorisation rempli", required: true},
      {name: "Justificatif du motif de sortie", required: true}
    ],
    isFree: true,
    fees: "0 MAD",
    delay: "10 jours ouvrables",
    extraInfo: "L’autorisation est délivrée gratuitement et uniquement sur présentation des documents requis."
  };

  const steps = [
    "Informations personnelles",
    "Téléversement documents",
    "Révision et soumission",
  ];

  return (
    <>
      <PageMeta
        title="Autorisation de sortie du territoire marocain"
        description="Demande d’autorisation de sortie du territoire marocain"
      />
      <PageBreadcrumb pageTitle="Autorisation de Sortie du Territoire Marocain" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
