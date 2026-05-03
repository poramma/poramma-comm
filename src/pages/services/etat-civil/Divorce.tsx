import React from "react";
import ServiceView from "../ServiceView";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";

export default function Divorce() {
  const overview = {
    documents: [
      {name: "Formulaire de demande rempli et signé", required: true},
      {name: "Copie de la pièce d’identité des deux parties", required: true},
      {name: "Acte de mariage original", required: true},
    ],
    isFree: false,
    fees: "90 DH",
    delay: "3 à 5 jours ouvrables",
    extraInfo: "Le certificat de divorce sera délivré en version papier, signé et cacheté."
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
        title="Demande de Divorce"
        description="Effectuez une demande de divorce officiel."
      />
      <PageBreadcrumb pageTitle="Demande de Divorce" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}