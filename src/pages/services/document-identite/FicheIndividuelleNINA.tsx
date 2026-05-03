import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function FicheIndividuelleNINA() {
  const overview = {
    documents: [
      {name: "Numéro NINA", required: true},
      {name: "Pièce d'identité valide", required: true},
      {name: "Justificatif de domicile", required: true}
    ],
    isFree: false,
    fees: "0 MAD",
    delay: "1 jour ouvrable",
    extraInfo: "La fiche individuelle NINA est délivrée gratuitement."
  };

  const steps = [
    "Informations personnelles",
    "Téléversement documents",
    "Révision et soumission",
  ];

  return (
    <>
      <PageMeta title="Fiche Individuelle NINA" description="Demande de fiche individuelle NINA" />
      <PageBreadcrumb pageTitle="Fiche Individuelle NINA" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
