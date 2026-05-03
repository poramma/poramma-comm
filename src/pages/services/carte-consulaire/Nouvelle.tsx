// src/pages/services/carte-consulaire/Nouvelle.tsx
import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function CarteConsulaireNouvelle() {
  const overview = {
    documents: [
        {name: "Formulaire de demande rempli et signé", required: true},
        {name: "Copie de l’acte de naissance ou extrait", required: true},
        {name: "Copie du passeport ou carte d’identité", required: true},
        {name: "Justificatif de domicile au pays d’accueil", required: true},
        {name: "2 photos d’identité récentes", required: true},
        {name: "Preuve de paiement des frais", required: true}
    ],
    isFree: false,
    fees: "80 MAD",
    delay: "3 jours ouvrables"
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
            title="Nouvelle Carte Consulaire"
            description="Demande de nouvelle carte consulaire avec les étapes et documents requis."
        />
        <PageBreadcrumb pageTitle=" Nouvelle Carte Consulaire" />
        <ServiceView
            steps={steps}
            overview={overview}
        />
    </>
  );
}
