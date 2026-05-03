import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function EnrolementCarteBiometrique() {
  const overview = {
    documents: [
      {name: "Pièce d'identité valide", required: true},
      {name: "Preuve de résidence", required: true},
      {name: "Formulaire biométrique rempli", required: true}
    ],
    isFree: true,
    fees: "0 MAD",
    delay: "1 jour ouvrable",
    extraInfo: "L’enrôlement pour la carte biométrique est gratuit."
  };

  const steps = [
    "Informations personnelles",
    "Téléversement documents",
    "Révision et soumission",
  ];

  return (
    <>
      <PageMeta title="Enrôlement Carte Biométrique" description="Procédure d'enrôlement pour la carte biométrique" />
      <PageBreadcrumb pageTitle="Enrôlement Carte Biométrique" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
