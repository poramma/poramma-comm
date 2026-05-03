import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function Visa3Mois() {
  const overview = {
    documents: [
      {name: "Formulaire de demande de visa rempli", required: true},
      {name: "Passeport valide (au moins 6 mois)", required: true},
      {name: "2 photos d’identité récentes", required: true},
      {name: "Preuve de moyens financiers suffisants", required: true},
      {name: "Réservation de billet d’avion aller-retour", required: true},
      {name: "Réservation d’hôtel ou attestation d’hébergement", required: true}
    ],
    isFree: false,
    fees: "1500 MAD",
    delay: "7 jours ouvrables",
    extraInfo: "Le visa de 3 mois est à entrée unique et ne peut pas être prolongé."
  };

  const steps = [
    "Informations personnelles",
    "Téléversement documents",
    "Révision des informations",
    "Paiement et soumission"
  ];

  return (
    <>
      <PageMeta title="Visa 3 Mois" description="Demande de visa de 3 mois" />
      <PageBreadcrumb pageTitle="Visa 3 Mois" />
      <ServiceView steps={steps} overview={overview} />
    </>
  );
}
