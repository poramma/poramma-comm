// src/pages/services/nationalite/index.tsx
import React from "react";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import ServiceView from "../../ServiceView";

export default function Nationalite() {
  const overview = {
    documents: [
      {name: "Formulaire de demande rempli et signé", required: true},
      {name: "Acte de naissance", required: true},
      {name: "Copie de la pièce d’identité", required: true},
      {name: "Justificatif de domicile", required: true},
    ],
    isFree: false,
    fees: "120 MAD",
    delay: "5 jours ouvrables",
    extraInfo: "Vérifiez que tous les documents sont lisibles et à jour."
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
        title="Certificat de nationalité"
        description="Demande de certificat de nationalité malienne."
      />
      <PageBreadcrumb pageTitle="Certificat de nationalité" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
