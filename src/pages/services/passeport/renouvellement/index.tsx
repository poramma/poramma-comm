import React from "react";
import ServiceView from "../../ServiceView";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";

export default function RenouvellementPasseport() {
  const overview = {
    documents: [
      {name: "Formulaire de renouvellement rempli", required: true},
      {name: "Copie du passeport actuel", required: true},
      {name: "2 photos d'identité récentes", required: true},
      {name: "Justificatif de domicile", required: true}
    ],
    isFree: false,
    fees: "400 MAD",
    delay: "10 jours ouvrables",
    extraInfo: "Assurez-vous que votre passeport actuel est valide pour le renouvellement."
  };

  const steps = [
    "Vérification des documents",
    "Téléversement des fichiers",
    "Paiement des frais",
    "Confirmation de la demande"
  ];

  return (
    <>
      <PageMeta
          title="Renouvellement de Passeport"
          description="Page pour le renouvellement de passeport, incluant les documents requis, les frais et les étapes du processus."
        />
      <PageBreadcrumb pageTitle="Renouvellement de Passeport" />
      <ServiceView
        overview={overview}
        steps={steps}
      />
    </>
  );
}