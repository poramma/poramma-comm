import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function Celibat() {
  const overview = {
    documents: [
      {name: "Copie de l'acte de naissance", required: true},
      {name: "Copie de la pièce d'identité", required: true},
      {name: "Déclaration sur l'honneur de célibat", required: true},
    ],
    isFree: true,
    fees: "0 MAD",
    delay: "1 jour ouvrable",
    extraInfo: "Ce certificat atteste officiellement que vous n'êtes pas marié(e)."
  };

  const steps = [
    "Informations personnelles",
    "Téléversement documents",
    "Révision et soumission",
  ];

  return (
    <>
      <PageMeta
        title="Certificat de Célibat"
        description="Obtenez un certificat de célibat avec les documents requis."
      />
      <PageBreadcrumb pageTitle="Certificat de Célibat" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
