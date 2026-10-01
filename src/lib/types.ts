// ============================================================
// src/lib/types.ts — formes réelles renvoyées par le backend
// ============================================================

export interface AuthUser {
  id: string;
  email: string;
  phone: string | null;
  status: string;
  // Compte enrôlé sur place (mot de passe par défaut, email pas encore
  // confirmé) — voir routes/RequireAuth.tsx's RequireOnboarded, qui bloque
  // l'accès à l'app tant que ces deux points ne sont pas réglés.
  emailVerified: boolean;
  mustChangePassword: boolean;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    userType?: string;
    inue?: string | null;
  } | null;
  roles?: { role: { id: string; name: string; level: number } }[];
}

/** Réponse de GET /users/me/:id/profile (identity-api) — pas d'enveloppe ok(). */
export interface FullUserProfile {
  id: string;
  email: string;
  status: string;
  inue?: string | null;
  userType?: string;
  personalInfo: { firstName: string; lastName: string; phone: string; gender: string; bio?: string; birthDate?: string };
  address: { address: string; city: string; country: string; zipCode: string };
  studentProfile?: {
    university?: string;
    faculty?: string;
    studyLevel?: string;
    scholarship?: { isRecipient: boolean; decisionNumber?: string; promotion?: string };
  };
  workerProfile?: { employer?: string; profession?: string; contractType?: string };
}

// ---------- Catalogue des services (communaute-api, public) ----------

export interface CatalogRequirement {
  id: string;
  type: "DOCUMENT" | "FIELD" | "FEE" | "PHOTO" | "SIGNATURE" | string;
  label: string;
  key: string;
  description: string | null;
  required: boolean;
  order: number;
}

export interface CatalogSchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface SubServiceDetail {
  id: string;
  serviceId: string;
  name: string;
  code: string;
  description: string | null;
  basePrice: number | null;
  currency: string | null;
  slaDays: number;
  requiresInPerson: boolean;
  service?: { id: string; name: string } | null;
  schedules: CatalogSchedule[];
  requirements: CatalogRequirement[];
}

// ---------- Demandes (communaute-api — vue citoyen, agents masqués) ----------

export interface Demande {
  id: string;
  dossierNumber: string;
  status: string;
  priority: string;
  totalAmount: number | null;
  currency: string | null;
  customPayload: Record<string, unknown> | null;
  submittedAt: string;
  deadlineAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  subService: {
    id: string;
    name: string;
    code: string;
    basePrice: number | null;
    currency: string | null;
    slaDays: number;
    service: { id: string; name: string; isCultural?: boolean } | null;
  } | null;
  /** Espace culturel : le conseiller qui traite la demande, à visage découvert (null pour un service consulaire). */
  advisor?: CultureAdvisor | null;
}

/** Le Conseiller Culturel (nom réel et fonction — jamais d'identifiant interne). */
export interface CultureAdvisor {
  name: string;
  title: string;
}

export interface CultureSubService {
  id: string;
  name: string;
  description: string | null;
  slaDays: number;
  schedules: ServiceSchedule[];
  /** RENDEZ_VOUS = se réserve ; DEMANDE = se dépose comme une demande. */
  kind: "RENDEZ_VOUS" | "DEMANDE";
}

export interface CultureOverview {
  advisors: CultureAdvisor[];
  services: { id: string; name: string; description: string | null; subServices: CultureSubService[] }[];
}

export type CultureThreadStatus = "OPEN" | "ANSWERED" | "CLOSED";

export interface CultureThread {
  id: string;
  reference: string;
  subject: string;
  status: CultureThreadStatus;
  /** name = null tant qu'aucun conseiller n'a répondu. */
  advisor: { name: string | null; title: string };
  createdAt: string;
  lastMessageAt: string;
  lastMessageBy: "USER" | "ADVISOR";
  closedAt: string | null;
}

export interface CultureMessage {
  id: string;
  authorType: "USER" | "ADVISOR" | "SYSTEM";
  authorName: string | null;
  content: string;
  createdAt: string;
}

export interface DemandeHistoryEntry {
  id: string;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  comment: string | null;
  createdAt: string;
}

export interface DemandeComment {
  id: string;
  content: string;
  createdAt: string;
  authorType: "STUDENT" | "AGENT";
  authorName: string | null;
}

export interface DemandeRequirement {
  id: string;
  requirementId: string;
  label: string;
  type: string;
  status: string;
  providedDocumentId: string | null;
  reviewerNote: string | null;
}

export interface DemandeDocument {
  id: string;
  requirementId: string | null;
  type: string;
  status: string;
  reviewNote: string | null;
  createdAt: string;
  file: { originalName: string; mimeType: string; size: number };
}

// ---------- Documents (communaute-api) ----------

export interface MyDocument {
  id: string;
  type: string;
  status: string;
  reviewNote: string | null;
  expiryDate: string | null;
  version: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  file: { originalName: string; mimeType: string; size: number; uploadedAt: string } | null;
  category: { id: string; name: string } | null;
}

// ---------- Enregistrement auprès de l'ambassade (communaute-api) ----------

export type RegistrationStatus = "INCOMPLETE" | "SUBMITTED" | "VALIDATED" | "REJECTED" | "SUSPENDED";
export type UserType = "student" | "worker" | "migrant" | "other";

export interface RegistrationDocumentItem {
  key: string;
  label: string;
  acceptedTypes: string[];
  optional: boolean;
  provided: boolean;
  documentId: string | null;
  documentStatus: string | null;
}

export interface RegistrationChecklist {
  registrationStatus: RegistrationStatus;
  status: "PENDING" | "VALIDATED" | "REJECTED" | "SUSPENDED";
  isValidated: boolean;
  submittedAt: string | null;
  inue: string | null;
  inueAssignedAt: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  userType: UserType;
  info: { complete: boolean; missing: string[] };
  documents: { complete: boolean; missing: string[]; items: RegistrationDocumentItem[] };
  canSubmit: boolean;
}

// ---------- Rendez-vous / notifications (communaute-api : aucun agent n'est jamais exposé) ----------

export interface ServiceSchedule {
  dayOfWeek: number; // 1 = lundi … 7 = dimanche
  startTime: string;
  endTime: string;
  isActive: boolean | null;
}

/** Catalogue public : un service et ses sous-services (avec horaires d'ouverture). */
export interface CatalogService {
  id: string;
  name: string;
  active: boolean | null;
  subServices: { id: string; name: string; active: boolean | null; schedules?: ServiceSchedule[] }[];
}

/** Créneau d'une date pour un service ; `isAvailable=false` = complet. */
export interface RendezVousSlot {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface RendezVous {
  id: string;
  ticketId: string;
  status: string;
  type: string;
  /** Jour du rendez-vous (AAAA-MM-JJ, heure de l'ambassade). */
  date: string;
  startTime: string;
  endTime: string;
  motif: string | null;
  demandeId: string | null;
  subService: { id: string; name: string; serviceName: string | null; isCultural?: boolean } | null;
  /** Espace culturel : le Conseiller Culturel se présente à visage découvert (null pour un service consulaire). */
  advisor?: CultureAdvisor | null;
  /** Vrai tant que le rendez-vous peut être annulé ou déplacé. */
  canModify: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  status: "SENT" | "READ" | "FAILED";
  title: string;
  message: string;
  /** Chemin frontend vers l'objet concerné (détail de la demande, rendez-vous…), s'il existe. */
  actionUrl: string | null;
  demandeId: string | null;
  rendezVousId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsResult {
  notifications: NotificationItem[];
  unreadCount: number;
}

// ---------- Annonces de l'ambassade (campagnes) — communaute-api ----------

export type CampagneType = "INFO" | "ALERT" | "EVENT" | "SURVEY" | "REMINDER";

/** Fichier d'une annonce : `url` est un lien signé propre au citoyen (relatif au serveur d'API). */
export interface CampagneMedia {
  name: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface CampagneAttachment extends CampagneMedia {
  id: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
  caption: string | null;
  /** Affiché dans le carrousel « bannière » entre le titre et le contenu (image ou vidéo). */
  isBanner: boolean;
}

export interface Campagne {
  id: string;
  type: CampagneType;
  title: string;
  /** Aperçu en texte brut (cartes du fil). */
  excerpt: string;
  /** HTML rédigé par l'ambassade — toujours passer par sanitizeHtml() avant affichage. */
  content: string;
  publishedAt: string | null;
  cover: CampagneMedia | null;
  attachments: CampagneAttachment[];
  likes: number;
  participants: number;
  likedByMe: boolean;
  participatingByMe: boolean;
}
