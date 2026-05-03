// src/pages/services/carte-consulaire/Renouvellement.tsx
import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function CarteConsulaireRenouvellement() {
  const overview = {
    documents: [
      {name: "Ancienne carte consulaire", required: true},
      {name: "Copie de l’acte de naissance ou extrait", required: true},
      {name: "Copie du passeport ou carte d’identité", required: true},
      {name: "Justificatif de domicile actualisé", required: true},
      {name: "2 photos d’identité récentes", required: true},
      {name: "Preuve de paiement des frais", required: true}
    ],
    isFree: false,
    fees: "80 MAD",
    delay: "2 jours ouvrables",
    extraInfo: "Assurez-vous que les documents sont à jour et conformes aux exigences."

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
            title="Renouvellement Carte Consulaire"
            description="Renouvellement de la carte consulaire avec les étapes et documents requis."
        />
        <PageBreadcrumb pageTitle="Renouvelle Carte Consulaire" />
        <ServiceView
            steps={steps}
            overview={overview}
        />
    </>
  );
}
