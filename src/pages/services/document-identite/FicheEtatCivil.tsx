import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function FicheEtatCivil() {
  const overview = {
    documents: [
      {name: "Acte de naissance ou copie intégrale", required: true},
      {name: "Pièce d'identité valide", required: true},
      {name: "Justificatif de domicile", required: true}
    ],
    isFree: false,
    fees: "50 MAD",
    delay: "2 jours ouvrables",
    extraInfo: "La fiche individuelle d'état civil est payante et requiert un acte de naissance récent."
  };

  const steps = [
    "Informations personnelles",
    "Téléversement documents",
    "Révision des informations",
    "Paiement et soumission"
  ];

  return (
    <>
      <PageMeta title="Fiche Individuelle d'État Civil" description="Demande de fiche individuelle d'État civil" />
      <PageBreadcrumb pageTitle="Fiche Individuelle d'État Civil" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
