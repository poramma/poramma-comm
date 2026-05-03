import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function LegalisationActeNaissance() {
  const overview = {
    documents: [
      {name: "Copie intégrale ou extrait d’acte de naissance", required: true},
      {name: "Pièce d’identité en cours de validité", required: true},
    ],
    isFree: false,
    fees: "50 MAD",
    delay: "1 jour ouvrable",
    extraInfo: "Vérifiez que le document est signé et cacheté avant légalisation."
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
        title="Légalisation acte de naissance"
        description="Service de légalisation d'acte de naissance."
      />
      <PageBreadcrumb pageTitle="Légalisation acte de naissance" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
