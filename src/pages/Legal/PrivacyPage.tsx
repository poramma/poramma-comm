import { Link } from "react-router-dom";
import LegalLayout, { type LegalSection } from "./LegalLayout";
import { EMBASSY_CONTACT } from "../../config/contact";

const sections: LegalSection[] = [
  {
    id: "responsable",
    title: "Qui est responsable de vos données ?",
    body: (
      <p>
        Le responsable du traitement est l'<strong>{EMBASSY_CONTACT.name}</strong>, qui exploite la plateforme Poramma pour l'accomplissement de ses missions consulaires. Pour toute question relative à vos données : <a href={`mailto:${EMBASSY_CONTACT.email}`} className="text-brand-600 hover:underline">{EMBASSY_CONTACT.email}</a> ou via le <Link to="/support" className="text-brand-600 hover:underline">support</Link>.
      </p>
    ),
  },
  {
    id: "donnees",
    title: "Les données que nous collectons",
    body: (
      <>
        <ul>
          <li><strong>Compte :</strong> adresse email, téléphone (si renseigné), mot de passe (conservé sous forme chiffrée irréversible, jamais en clair).</li>
          <li><strong>Identité et coordonnées :</strong> prénom, nom, genre, date de naissance, adresse, ville, pays.</li>
          <li><strong>Situation :</strong> étudiant (université, filière, niveau d'études, bourse), travailleur (employeur, profession, type de contrat), migrant ou autre.</li>
          <li><strong>Enregistrement :</strong> statut de votre dossier, décision de l'ambassade et numéro INUE attribué.</li>
          <li><strong>Documents :</strong> pièces justificatives et fichiers que vous déposez à l'appui de votre enregistrement ou de vos demandes.</li>
          <li><strong>Démarches :</strong> demandes et leur historique, messages et compléments d'information échangés, rendez-vous, tickets de support.</li>
          <li><strong>Connexion avec Google (facultative) :</strong> si vous choisissez de vous connecter ou de vous inscrire avec Google, nous recevons de Google votre adresse email vérifiée, votre prénom et votre nom, ainsi qu'un identifiant technique de votre compte Google. Nous ne recevons ni votre mot de passe Google ni l'accès à vos contenus Google, et nous n'écrivons rien dans votre compte Google. Vous pouvez dissocier Google à tout moment depuis les Paramètres.</li>
          <li><strong>Notifications :</strong> alertes envoyées dans l'application et par email, et leur état de lecture.</li>
          <li><strong>Données techniques :</strong> adresse IP, navigateur et appareil, sessions de connexion, journal des actions de sécurité (connexion, déconnexion, changement de mot de passe).</li>
        </ul>
        <p>Nous ne collectons que ce qui est nécessaire aux finalités décrites ci-dessous.</p>
      </>
    ),
  },
  {
    id: "finalites",
    title: "Pourquoi nous les utilisons",
    body: (
      <ul>
        <li>créer et sécuriser votre compte, vous authentifier et vous permettre de récupérer votre accès ;</li>
        <li>instruire votre enregistrement auprès de l'ambassade et vous attribuer un numéro INUE ;</li>
        <li>traiter vos demandes de service et organiser vos rendez-vous ;</li>
        <li>vous informer de l'avancement de vos démarches et échanger avec vous ;</li>
        <li>vous assister (support) et répondre à vos demandes d'exercice de droits ;</li>
        <li>assurer la sécurité de la plateforme, prévenir la fraude et les usages abusifs ;</li>
        <li>établir des statistiques internes de fonctionnement, sans vous identifier ;</li>
        <li>respecter les obligations légales et réglementaires de l'ambassade.</li>
      </ul>
    ),
  },
  {
    id: "base",
    title: "Sur quel fondement",
    body: (
      <p>
        Ces traitements reposent principalement sur l'exécution des missions de service public consulaire confiées à l'ambassade et sur ses obligations légales. La sécurité de la plateforme relève de l'intérêt légitime de l'ambassade. Lorsque nous vous demandons votre consentement (par exemple pour certaines communications non liées au suivi de vos démarches), vous pouvez le retirer à tout moment.
      </p>
    ),
  },
  {
    id: "destinataires",
    title: "Qui peut accéder à vos données",
    body: (
      <>
        <ul>
          <li>les <strong>agents habilités</strong> de l'ambassade, dans la limite de leur rôle et des services dont ils ont la charge ;</li>
          <li>les <strong>administrateurs</strong> de la plateforme, pour la gestion des comptes, des accès et du support ;</li>
          <li>nos <strong>prestataires techniques</strong> (hébergement, envoi d'emails), qui n'agissent que sur instruction de l'ambassade et sont tenus à la confidentialité ;</li>
          <li>les <strong>autorités compétentes</strong> du Mali ou du Maroc, lorsque la loi l'exige.</li>
        </ul>
        <p>Vos données ne sont ni vendues ni cédées à des fins commerciales. Dans vos échanges, les réponses de l'ambassade sont signées au nom du service : l'identité personnelle des agents n'est pas communiquée aux usagers.</p>
      </>
    ),
  },
  {
    id: "conservation",
    title: "Combien de temps nous les conservons",
    body: (
      <p>
        Vos données sont conservées tant que votre compte est actif, puis pendant la durée nécessaire au traitement de vos démarches, à l'archivage administratif et au respect des obligations légales de l'ambassade, qui varient selon la nature des documents. À l'issue de ces durées, elles sont supprimées ou anonymisées. Les journaux de sécurité sont conservés pour la durée strictement utile à la protection de la plateforme.
      </p>
    ),
  },
  {
    id: "securite",
    title: "Comment nous les protégeons",
    body: (
      <ul>
        <li>mots de passe conservés sous forme chiffrée irréversible ;</li>
        <li>accès aux données limité par rôle : chaque agent ne voit que ce que sa fonction exige ;</li>
        <li>sessions de connexion révocables, avec fermeture de toutes les sessions lors d'une réinitialisation de mot de passe ;</li>
        <li>limitation des tentatives de connexion et des envois répétés pour freiner les abus ;</li>
        <li>journalisation des actions sensibles réalisées par les agents et les administrateurs (validation, rejet, création, affectation, archivage…) ;</li>
        <li>documents accessibles uniquement par des liens contrôlés, jamais en accès public.</li>
      </ul>
    ),
  },
  {
    id: "droits",
    title: "Vos droits",
    body: (
      <>
        <p>Conformément à la réglementation applicable en matière de protection des données personnelles, vous disposez d'un droit d'<strong>accès</strong>, de <strong>rectification</strong>, d'<strong>opposition</strong> pour motif légitime, de <strong>limitation</strong> et, dans les limites des obligations de conservation de l'ambassade, de <strong>suppression</strong> de vos données.</p>
        <ul>
          <li>Vous pouvez consulter et corriger la plupart de vos informations depuis <Link to="/profile" className="text-brand-600 hover:underline">Mon profil</Link>.</li>
          <li>Pour tout autre droit (copie de vos données, suppression, opposition), écrivez au <Link to="/support" className="text-brand-600 hover:underline">support</Link> en précisant votre demande ; nous pouvons vous demander de justifier votre identité.</li>
          <li>Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir l'autorité de protection des données compétente (au Maroc, la CNDP ; au Mali, l'APDP).</li>
        </ul>
      </>
    ),
  },
  {
    id: "stockage",
    title: "Cookies et stockage local",
    body: (
      <p>
        Poramma utilise le stockage local de votre navigateur uniquement pour son fonctionnement : maintenir votre session ouverte (« Rester connecté ») et mémoriser votre thème d'affichage. Aucun traceur publicitaire n'est utilisé. Vous pouvez effacer ces données en vous déconnectant ou depuis les réglages de votre navigateur.
      </p>
    ),
  },
  {
    id: "transferts",
    title: "Hébergement et transferts",
    body: (
      <p>
        Les données sont hébergées sur l'infrastructure de la plateforme, sous le contrôle de l'ambassade. Si un transfert de données hors du Mali ou du Maroc devait être nécessaire au fonctionnement du service, il serait réalisé dans le respect de la réglementation applicable et avec des garanties appropriées.
      </p>
    ),
  },
  {
    id: "evolution",
    title: "Évolution de cette politique",
    body: (
      <p>
        Cette politique peut être mise à jour, notamment pour refléter l'évolution des services ou de la réglementation. La version en vigueur et sa date de mise à jour figurent en haut de cette page ; les changements importants vous sont signalés dans l'application. Voir aussi les <Link to="/conditions-utilisation" className="text-brand-600 hover:underline">conditions d'utilisation</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      metaDescription="Politique de confidentialité et de protection des données personnelles de la plateforme Poramma."
      intro="Cette politique explique quelles données personnelles Poramma collecte, pourquoi, qui peut y accéder, combien de temps elles sont conservées et comment exercer vos droits."
      sections={sections}
    />
  );
}
