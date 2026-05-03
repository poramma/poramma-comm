// src/pages/services/documents-identite/EnrolementNINA.tsx
import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function EnrolementNINA() {
  const overview = {
    documents: [
      {name: "Pièce d'identité valide", required: true},
      {name: "Preuve de résidence", required: true},
      {name: "Formulaire d'enrôlement rempli", required: true}
    ],
    isFree: true,
    fees: "0 MAD",
    delay: "1 jour ouvrable",
    extraInfo: "L’enrôlement NINA est obligatoire pour l’obtention de documents biométriques."
  };

  const steps = [
    "Informations personnelles",
    "Téléversement documents",
    "Révision et soumission",
  ];

  return (
    <>
      <PageMeta
        title="Enrôlement NINA"
        description="Procédure d'enrôlement NINA."
      />
      <PageBreadcrumb pageTitle="Enrôlement NINA" />
      <ServiceView
        steps={steps}
        overview={overview}
      />
    </>
  );
}
