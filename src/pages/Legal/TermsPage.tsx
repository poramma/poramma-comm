import { Link } from "react-router-dom";
import LegalLayout, { type LegalSection } from "./LegalLayout";
import { EMBASSY_CONTACT } from "../../config/contact";

const sections: LegalSection[] = [
  {
    id: "objet",
    title: "Objet et éditeur",
    body: (
      <>
        <p>
          Poramma est la plateforme numérique de l'<strong>{EMBASSY_CONTACT.name}</strong>. Elle permet aux membres de la communauté malienne présents au Maroc d'effectuer en ligne certaines démarches consulaires : s'enregistrer auprès de l'ambassade, déposer des demandes, prendre rendez-vous, échanger avec les agents et suivre l'avancement de leurs dossiers.
        </p>
        <p>Les présentes conditions encadrent l'utilisation de la plateforme. En créant un compte ou en utilisant Poramma, vous les acceptez sans réserve.</p>
      </>
    ),
  },
  {
    id: "compte",
    title: "Création et sécurité du compte",
    body: (
      <>
        <ul>
          <li>La création d'un compte nécessite une adresse email valide, vérifiée par un code envoyé par email.</li>
          <li>Vous vous engagez à fournir des informations exactes, complètes et à jour, et à les corriger sans délai si elles changent.</li>
          <li>Un compte est strictement personnel : il ne doit être ni partagé, ni prêté, ni utilisé pour le compte d'une autre personne.</li>
          <li>Vous êtes responsable de la confidentialité de votre mot de passe. L'ambassade ne vous le demandera jamais, par aucun moyen.</li>
          <li>En cas de perte ou de soupçon d'utilisation frauduleuse de votre compte, changez immédiatement votre mot de passe et prévenez le <Link to="/support" className="text-brand-600 hover:underline">support</Link>.</li>
        </ul>
      </>
    ),
  },
  {
    id: "enregistrement",
    title: "Enregistrement auprès de l'ambassade et numéro INUE",
    body: (
      <>
        <p>
          L'accès aux demandes de service, aux rendez-vous et aux échanges avec l'ambassade est réservé aux usagers dont le dossier d'enregistrement a été <strong>validé</strong> par un agent. Vous renseignez votre situation et déposez vos pièces justificatives ; l'ambassade examine le dossier puis, en cas de validation, vous attribue un <strong>numéro INUE</strong> (identifiant unique de l'usager).
        </p>
        <p>L'ambassade peut demander des corrections ou des pièces complémentaires, refuser un dossier incomplet ou non conforme, ou suspendre un dossier lorsque la situation l'exige. Le motif vous est alors indiqué dans l'application.</p>
      </>
    ),
  },
  {
    id: "services",
    title: "Services proposés",
    body: (
      <>
        <ul>
          <li>consultation du catalogue des services et des pièces à fournir ;</li>
          <li>dépôt et suivi de demandes, avec historique et notifications ;</li>
          <li>réponse aux demandes de complément d'information ;</li>
          <li>prise, déplacement et annulation de rendez-vous à l'ambassade ;</li>
          <li>messages et annonces de l'ambassade, et assistance via le support.</li>
        </ul>
        <p>Les services disponibles, leurs conditions et leurs délais sont indiqués sur la plateforme et peuvent évoluer. Les délais annoncés sont indicatifs. Certaines démarches exigent votre présence à l'ambassade (dépôt ou retrait d'un document, par exemple) : Poramma ne s'y substitue pas.</p>
      </>
    ),
  },
  {
    id: "paiement",
    title: "Aucun paiement en ligne",
    body: (
      <>
        <p>
          Poramma <strong>n'accepte aucun paiement en ligne</strong>. Les éventuels frais liés à un service se règlent exclusivement à l'ambassade, en espèces, lors du dépôt ou du retrait. Toute demande de paiement par internet, virement, application mobile ou lien reçu au nom de l'ambassade ou de Poramma est frauduleuse : ne payez pas et signalez-la immédiatement au <Link to="/support" className="text-brand-600 hover:underline">support</Link>.
        </p>
      </>
    ),
  },
  {
    id: "engagements",
    title: "Vos engagements",
    body: (
      <>
        <p>En utilisant Poramma, vous vous engagez à :</p>
        <ul>
          <li>ne déposer que des documents authentiques, lisibles et vous concernant (ou pour lesquels vous êtes habilité à agir) ;</li>
          <li>ne faire aucune fausse déclaration : la production de faux documents ou de fausses informations est une infraction, que l'ambassade peut signaler aux autorités compétentes ;</li>
          <li>vous adresser aux agents avec courtoisie : tout message injurieux, menaçant ou discriminatoire peut entraîner la suspension du compte ;</li>
          <li>ne pas chercher à accéder aux données d'autrui, à contourner les protections de la plateforme, à la perturber ou à en extraire massivement le contenu ;</li>
          <li>ne pas utiliser la plateforme à des fins étrangères aux démarches consulaires.</li>
        </ul>
      </>
    ),
  },
  {
    id: "rendez-vous",
    title: "Rendez-vous",
    body: (
      <p>
        Un rendez-vous confirmé réserve un créneau qui ne peut plus être proposé à un autre usager. Si vous ne pouvez pas vous présenter, déplacez ou annulez le rendez-vous dès que possible depuis « Mes rendez-vous ». L'ambassade peut adapter les conditions de prise de rendez-vous en cas d'abus, et peut annuler ou déplacer un rendez-vous pour des raisons de service : vous en êtes alors informé.
      </p>
    ),
  },
  {
    id: "communications",
    title: "Communications et notifications",
    body: (
      <p>
        Le suivi de vos démarches (changement d'état d'une demande ou de votre dossier, rendez-vous, messages des agents, demandes de complément, réponses du support) vous est notifié dans l'application et par email à l'adresse de votre compte. Ces messages sont nécessaires au traitement de vos démarches ; pensez à consulter régulièrement vos notifications et à maintenir votre adresse email à jour. Les annonces de l'ambassade sont publiées dans l'espace « Annonces ».
      </p>
    ),
  },
  {
    id: "propriete",
    title: "Propriété intellectuelle",
    body: (
      <p>
        La marque, le logo, les textes, les interfaces et les contenus de Poramma sont la propriété de l'ambassade ou de leurs titulaires respectifs. Leur reproduction ou réutilisation, hors usage personnel dans le cadre de vos démarches, nécessite une autorisation préalable.
      </p>
    ),
  },
  {
    id: "responsabilite",
    title: "Disponibilité et responsabilité",
    body: (
      <>
        <p>L'ambassade s'efforce d'assurer la disponibilité de la plateforme mais ne peut la garantir en continu : des interruptions pour maintenance, incident technique ou cas de force majeure sont possibles.</p>
        <p>L'ambassade ne saurait être tenue responsable des conséquences d'informations inexactes ou de documents non conformes fournis par l'usager, d'un défaut de consultation de ses notifications, ni de l'utilisation de son compte par un tiers à qui il aurait communiqué ses identifiants.</p>
      </>
    ),
  },
  {
    id: "suspension",
    title: "Suspension, fermeture du compte",
    body: (
      <p>
        En cas de manquement aux présentes conditions ou de suspicion de fraude, l'ambassade peut restreindre l'accès à certaines fonctionnalités, suspendre ou fermer un compte, après en avoir informé l'usager lorsque la situation le permet. Vous pouvez demander la fermeture de votre compte en écrivant au <Link to="/support" className="text-brand-600 hover:underline">support</Link>, sous réserve de la conservation des informations que l'ambassade doit garder en application de la réglementation (voir la <Link to="/politique-confidentialite" className="text-brand-600 hover:underline">politique de confidentialité</Link>).
      </p>
    ),
  },
  {
    id: "donnees",
    title: "Données personnelles",
    body: (
      <p>
        Le traitement de vos données personnelles est décrit dans la <Link to="/politique-confidentialite" className="text-brand-600 hover:underline">politique de confidentialité</Link>, qui fait partie intégrante des présentes conditions.
      </p>
    ),
  },
  {
    id: "modification",
    title: "Modification des conditions",
    body: (
      <p>
        L'ambassade peut modifier ces conditions pour tenir compte de l'évolution des services ou de la réglementation. La version en vigueur, avec sa date de mise à jour, est toujours consultable sur cette page. Les modifications importantes vous sont signalées dans l'application ; poursuivre l'utilisation de Poramma après leur publication vaut acceptation.
      </p>
    ),
  },
  {
    id: "droit",
    title: "Droit applicable et contact",
    body: (
      <>
        <p>Les présentes conditions sont régies par la réglementation applicable à l'ambassade du Mali au Maroc. En cas de difficulté, contactez d'abord le <Link to="/support" className="text-brand-600 hover:underline">support</Link> afin de rechercher une solution amiable.</p>
        <p>
          Contact : {EMBASSY_CONTACT.name} — <a href={`mailto:${EMBASSY_CONTACT.email}`} className="text-brand-600 hover:underline">{EMBASSY_CONTACT.email}</a> — {EMBASSY_CONTACT.phone}
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Conditions d'utilisation"
      metaDescription="Conditions d'utilisation de la plateforme Poramma de l'ambassade du Mali au Maroc."
      intro="Ce document explique les règles d'utilisation de la plateforme Poramma : ce que vous pouvez y faire, ce que l'ambassade attend de vous et ce que vous pouvez attendre d'elle."
      sections={sections}
    />
  );
}
