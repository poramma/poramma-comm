import React from "react";
import ServiceView from "../../ServiceView";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";

export default function DemandePasseport() {

  const overview = {
    documents: [
      {name: "Formulaire de demande rempli", required: true},
      {name: "Copie de la carte d'identité", required: true},
      {name: "Acte de naissance", required: true},
      {name: "2 photos d'identité récentes", required: true}
    ],
    isFree: false,
    fees: "300 MAD",
    delay: "15 jours ouvrables",
    extraInfo: "Vérifiez la validité de vos documents avant soumission."
  };

  const steps = [
    "Informations personnelles",
    "Téléversement documents",
    "Révision des informations",
    "Paiement et soumission",
  ];

  return (
    <>
      <PageMeta
          title="Demande de Passeport"
          description="Page pour la demande de passeport, incluant les documents requis, les frais et les étapes du processus."
        />
      <PageBreadcrumb pageTitle="Demande de Passeport" />
      <ServiceView
        overview={overview}
        steps={steps}
      />
    </>
  );
}
