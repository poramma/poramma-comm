import React from "react";
import ServiceView from "../../ServiceView";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";

export default function PasseportMineur() {

  const overview = {
    documents: [
      {name: "Formulaire de demande rempli", required: true},
      {name: "Copie de la carte d'identité du parent", required: true},
      {name: "Acte de naissance du mineur", required: true},
      {name: "2 photos d'identité récentes du mineur", required: true}
    ],
    isFree: false,
    fees: "300 MAD",
    delay: "15 jours ouvrables",
    extraInfo: "Assurez-vous que tous les documents sont à jour."
  };
  
  const steps = [
    "Informations sur le mineur",
    "Téléversement des documents",
    "Révision des informations",
    "Paiement et soumission",
  ];

  return (
    <>
      <PageMeta
        title="Passeport pour Mineur"
        description="Informations et étapes pour la demande de passeport pour mineurs, incluant les documents requis et les frais."
      />
      <PageBreadcrumb pageTitle="Passeport Mineur" />
      <ServiceView
        overview={overview}
        steps={steps}
      />
    </>
  );
}
