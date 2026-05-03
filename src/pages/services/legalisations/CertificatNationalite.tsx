import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function LegalisationCertificatNationalite() {
  const overview = {
    documents: [
      {name: "Certificat de nationalité malienne", required: true},
      {name: "Pièce d’identité en cours de validité", required: true},
    ],
    isFree: false,
    fees: "50 MAD",
    delay: "1 jour ouvrable",
    extraInfo: "Le certificat doit être délivré par une autorité compétente."
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
        title="Légalisation certificat de nationalité"
        description="Service de légalisation d'un certificat de nationalité."
      />
      <PageBreadcrumb pageTitle="Légalisation certificat de nationalité" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
