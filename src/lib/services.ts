// ============================================================
// src/lib/services.ts — appels au backend réel, un objet par domaine
// ============================================================
//
// Routage (gateway nginx) :
//  - identity-api  → chemins nus   (/auth/*, /users/*)
//  - communaute-api → préfixe /api/communaute (catalogue, profil, documents, demandes)
//  - rendez-vous et notifications restent, en attendant leur module
//    communaute-api, sur les chemins historiques d'ambassade-api.

import { api, setTokens, clearTokens, API_BASE_URL } from "./api";
import type {
  AuthUser,
  Demande,
  DemandeComment,
  DemandeDocument,
  DemandeHistoryEntry,
  DemandeRequirement,
  CatalogService,
  RendezVousSlot,
  RendezVous,
  NotificationItem,
  NotificationsResult,
  Campagne,
  FullUserProfile,
  SubServiceDetail,
  MyDocument,
  RegistrationChecklist,
  UserType,
  CultureOverview,
  CultureThread,
  CultureMessage,
} from "./types";

const C = "/api/communaute";

function unwrap<T>(res: { data: { data: T } }): T {
  return res.data.data;
}

export const authService = {
  sendOtp: async (emailOrPhone: string): Promise<void> => {
    await api.post("/auth/send-otp", { emailOrPhone });
  },

  /** Crée le compte (voir identity-api's auth.service.verifyOtp) — ne renvoie pas de tokens, un login() séparé est requis ensuite. */
  verifyOtp: async (payload: {
    email: string;
    otp: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<{ id: string; email: string }> => {
    const res = await api.post("/auth/verify-otp", payload);
    return unwrap<{ success: boolean; user: { id: string; email: string } }>(res).user;
  },

  login: async (email: string, password: string, rememberMe?: boolean): Promise<AuthUser> => {
    const res = await api.post("/auth/login", { email, password, rememberMe });
    const { accessToken, refreshToken, user } = unwrap<{ accessToken: string; refreshToken: string; user: AuthUser }>(res);
    setTokens(accessToken, refreshToken);
    return user;
  },

  /** Envoie un code à 6 chiffres par email — réponse identique que le compte existe ou non. */
  forgotPassword: async (email: string): Promise<void> => {
    await api.post("/auth/forgot-password", { email });
  },

  /** Vérifie le code et remplace le mot de passe ; toutes les sessions de l'utilisateur sont fermées. */
  resetPassword: async (payload: { email: string; otp: string; newPassword: string }): Promise<void> => {
    await api.post("/auth/reset-password", payload);
  },

  me: async (): Promise<AuthUser> => {
    const res = await api.get("/auth/me");
    return unwrap(res);
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearTokens();
    }
  },
};

/** Catalogue public des services — aucune authentification requise. */
export const catalogService = {
  /** Arbre du catalogue : services → sous-services (avec leurs horaires d'ouverture, visibles de tous). */
  listServices: async (): Promise<CatalogService[]> => {
    const res = await api.get(`${C}/services`);
    return unwrap(res);
  },

  getSubService: async (id: string): Promise<SubServiceDetail> => {
    const res = await api.get(`${C}/sub-services/${id}`);
    return unwrap(res);
  },
};

export const demandeService = {
  listMine: async (): Promise<Demande[]> => {
    const res = await api.get(`${C}/demandes`);
    return unwrap(res);
  },

  getById: async (id: string): Promise<Demande> => {
    const res = await api.get(`${C}/demandes/${id}`);
    return unwrap(res);
  },

  /**
   * Les pièces ont déjà été téléversées (documentService.upload) ; elles sont
   * jointes ici, en une seule transaction côté serveur. `requirementId` =
   * id du prérequis du catalogue (SubServiceDetail.requirements[].id).
   */
  create: async (data: {
    subServiceId: string;
    customPayload?: Record<string, unknown>;
    documents?: { requirementId?: string | null; documentId: string }[];
  }): Promise<Demande> => {
    const res = await api.post(`${C}/demandes`, data);
    return unwrap(res);
  },

  listHistory: async (id: string): Promise<DemandeHistoryEntry[]> => {
    const res = await api.get(`${C}/demandes/${id}/history`);
    return unwrap(res);
  },

  listComments: async (id: string): Promise<DemandeComment[]> => {
    const res = await api.get(`${C}/demandes/${id}/comments`);
    return unwrap(res);
  },

  addComment: async (id: string, content: string): Promise<DemandeComment> => {
    const res = await api.post(`${C}/demandes/${id}/comments`, { content });
    return unwrap(res);
  },

  listRequirements: async (id: string): Promise<DemandeRequirement[]> => {
    const res = await api.get(`${C}/demandes/${id}/requirements`);
    return unwrap(res);
  },

  listDocuments: async (id: string): Promise<DemandeDocument[]> => {
    const res = await api.get(`${C}/demandes/${id}/documents`);
    return unwrap(res);
  },
};

export const documentService = {
  listMine: async (): Promise<MyDocument[]> => {
    const res = await api.get(`${C}/documents`);
    return unwrap(res);
  },

  /**
   * Téléversement d'un document personnel. `demandeId` (optionnel) rattache
   * la pièce à un de SES dossiers. Le propriétaire est toujours l'utilisateur
   * connecté, décidé côté serveur — aucun identifiant de propriétaire à envoyer.
   */
  upload: async (file: File, type: string, demandeId?: string): Promise<MyDocument> => {
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    if (demandeId) form.append("demandeId", demandeId);
    const res = await api.post(`${C}/documents`, form, { headers: { "Content-Type": "multipart/form-data" } });
    return unwrap(res);
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`${C}/documents/${id}`);
  },

  download: async (id: string): Promise<Blob> => {
    const res = await api.get(`${C}/documents/${id}/download`, { responseType: "blob" });
    return res.data as Blob;
  },
};

/** Enregistrement auprès de l'ambassade (statut du dossier, pièces manquantes, soumission). */
export const registrationService = {
  get: async (): Promise<RegistrationChecklist> => {
    const res = await api.get(`${C}/profile/registration`);
    return unwrap(res);
  },

  submit: async (): Promise<RegistrationChecklist> => {
    const res = await api.post(`${C}/profile/registration/submit`);
    return unwrap(res);
  },
};

export const rendezvousService = {
  /** Créneaux d'un service pour une date — jamais d'agent, créneaux passés exclus. */
  listSlots: async (subServiceId: string, date: string): Promise<RendezVousSlot[]> => {
    const res = await api.get(`${C}/rendez-vous/slots`, { params: { subServiceId, date } });
    return unwrap(res);
  },

  /** Jours à venir ayant au moins un créneau libre. */
  listAvailableDates: async (subServiceId: string, days = 30): Promise<string[]> => {
    const res = await api.get(`${C}/rendez-vous/available-dates`, { params: { subServiceId, days } });
    return unwrap(res);
  },

  listMine: async (): Promise<RendezVous[]> => {
    const res = await api.get(`${C}/rendez-vous`);
    return unwrap(res);
  },

  getById: async (id: string): Promise<RendezVous> => {
    const res = await api.get(`${C}/rendez-vous/${id}`);
    return unwrap(res);
  },

  book: async (data: { subServiceId: string; date: string; startTime: string; motif?: string; demandeId?: string }): Promise<RendezVous> => {
    const res = await api.post(`${C}/rendez-vous`, data);
    return unwrap(res);
  },

  reschedule: async (id: string, data: { date: string; startTime: string }): Promise<RendezVous> => {
    const res = await api.post(`${C}/rendez-vous/${id}/reschedule`, data);
    return unwrap(res);
  },

  cancel: async (id: string, reason?: string): Promise<RendezVous> => {
    const res = await api.post(`${C}/rendez-vous/${id}/cancel`, { reason });
    return unwrap(res);
  },

  /** Espace d'échange avec l'ambassade autour du rendez-vous (messages publics uniquement). */
  listNotes: async (id: string): Promise<DemandeComment[]> => {
    const res = await api.get(`${C}/rendez-vous/${id}/notes`);
    return unwrap(res);
  },

  addNote: async (id: string, content: string): Promise<DemandeComment> => {
    const res = await api.post(`${C}/rendez-vous/${id}/notes`, { content });
    return unwrap(res);
  },
};

/** URL absolue d'un média d'annonce (le serveur renvoie un chemin signé relatif). */
export const campagneMediaUrl = (path: string, opts: { download?: boolean } = {}) =>
  `${API_BASE_URL}${path}${opts.download ? "&download=1" : ""}`;

/** Annonces de l'ambassade et interactions du citoyen (statistiques côté ambassade). */
export const campagneService = {
  list: async (params: { type?: string; limit?: number; offset?: number } = {}): Promise<Campagne[]> => {
    const res = await api.get(`${C}/campagnes`, { params });
    return unwrap(res);
  },

  getById: async (id: string): Promise<Campagne> => {
    const res = await api.get(`${C}/campagnes/${id}`);
    return unwrap(res);
  },

  /** Ouverture du détail — le serveur ne compte qu'une vue toutes les 30 minutes. */
  recordView: async (id: string): Promise<void> => {
    await api.post(`${C}/campagnes/${id}/view`);
  },

  /** Clic sur un média, un document (id de pièce jointe) ou un lien du texte (« link:<url> »). */
  recordClick: async (id: string, targetId: string): Promise<void> => {
    await api.post(`${C}/campagnes/${id}/click`, { targetId });
  },

  /** Bascule « j'aime » / « je participe » ; renvoie l'état et le total à jour. */
  react: async (id: string, type: "LIKE" | "PARTICIPATE"): Promise<{ active: boolean; count: number }> => {
    const res = await api.post(`${C}/campagnes/${id}/reactions/${type}`);
    return unwrap(res);
  },
};

export const notificationService = {
  /** Notifications du membre + nombre de non lues (communaute-api renvoie { notifications, unreadCount }). */
  fetch: async (): Promise<NotificationsResult> => {
    const res = await api.get(`${C}/notifications`);
    return unwrap<NotificationsResult>(res);
  },

  list: async (): Promise<NotificationItem[]> => (await notificationService.fetch()).notifications,

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get(`${C}/notifications/unread-count`);
    return unwrap<{ unreadCount: number }>(res).unreadCount;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`${C}/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch(`${C}/notifications/read-all`);
  },
};

/**
 * Ces routes identity-api (/users/me/:id/*) ne passent pas par l'enveloppe
 * `ok()` du reste de l'API — elles renvoient l'objet directement, d'où
 * l'absence d'unwrap() ici (voir users.controller.ts).
 */
// Plusieurs cartes du profil demandent le même profil au même instant : on partage la requête en cours
// plutôt que d'en envoyer une par carte.
const profileRequests = new Map<string, Promise<FullUserProfile>>();

export const userService = {
  getProfile: (userId: string): Promise<FullUserProfile> => {
    const pending = profileRequests.get(userId);
    if (pending) return pending;
    const request = api
      .get(`/users/me/${userId}/profile`)
      .then((res) => res.data as FullUserProfile)
      .finally(() => profileRequests.delete(userId));
    profileRequests.set(userId, request);
    return request;
  },

  /** Change le mot de passe du compte connecté (identity-api, exige l'ancien mot de passe). */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post("/profile/password", { currentPassword, newPassword });
  },

  /** Confirme le code reçu par email (enrôlement sur place) — voir RequireOnboarded. */
  verifyEmail: async (userId: string, otp: string): Promise<void> => {
    await api.post(`/users/me/${userId}/verify-email`, { otp });
  },

  /** Redemande un code : l'ancien (perdu ou expiré) est invalidé côté serveur. */
  resendVerification: async (userId: string): Promise<void> => {
    await api.post(`/users/me/${userId}/resend-verification`);
  },

  updatePersonalInfo: async (
    userId: string,
    data: { firstName: string; lastName: string; phone?: string; userType?: UserType; gender?: string; bio?: string; birthDate?: string }
  ) => {
    const res = await api.patch(`/users/me/${userId}/personal-info`, data);
    return res.data;
  },

  updateAddress: async (userId: string, data: { address?: string; city?: string; country?: string; zipCode?: string }) => {
    const res = await api.patch(`/users/me/${userId}/address`, data);
    return res.data;
  },

  updateStudentProfile: async (
    userId: string,
    data: { university?: string; faculty?: string; studyLevel?: string; scholarship?: { isRecipient: boolean; decisionNumber?: string; promotion?: string } }
  ) => {
    const res = await api.patch(`/users/me/${userId}/student`, data);
    return res.data;
  },

  updateWorkerProfile: async (userId: string, data: { employer?: string; profession?: string; contractType?: string }) => {
    const res = await api.patch(`/users/me/${userId}/worker`, data);
    return res.data;
  },
};

export type SupportCategory = "ACCOUNT" | "DEMANDE" | "RENDEZ_VOUS" | "REGISTRATION" | "TECHNICAL" | "OTHER";

export type SupportStatus = "OPEN" | "IN_PROGRESS" | "WAITING_USER" | "RESOLVED" | "CLOSED";

export interface SupportTicket {
  id: string;
  reference: string;
  subject: string;
  category: SupportCategory;
  linkedReference: string | null;
  status: SupportStatus;
  createdAt: string;
  lastMessageAt: string;
  lastMessageBy: "USER" | "STAFF";
  resolvedAt: string | null;
}

export interface SupportMessage {
  id: string;
  authorType: "USER" | "STAFF" | "SYSTEM";
  authorName: string | null;
  content: string;
  createdAt: string;
}

/** Tickets de support (communaute-api) — ouverts à tout compte connecté, même non validé ; jamais d'identité d'agent ni de note interne. */
export const supportService = {
  send: async (data: { category: SupportCategory; subject: string; message: string; reference?: string }): Promise<{ id: string; ticket: string }> => {
    const res = await api.post(`${C}/support`, data);
    return unwrap(res);
  },

  listMine: async (): Promise<SupportTicket[]> => {
    const res = await api.get(`${C}/support/tickets`);
    return unwrap(res);
  },

  get: async (id: string): Promise<SupportTicket & { messages: SupportMessage[] }> => {
    const res = await api.get(`${C}/support/tickets/${id}`);
    return unwrap(res);
  },

  reply: async (id: string, content: string): Promise<SupportMessage> => {
    const res = await api.post(`${C}/support/tickets/${id}/messages`, { content });
    return unwrap(res);
  },

  resolve: async (id: string): Promise<SupportTicket> => {
    const res = await api.post(`${C}/support/tickets/${id}/resolve`);
    return unwrap(res);
  },
};

/**
 * Espace culturel (communaute-api /culture) : le Conseiller Culturel se présente à visage découvert,
 * et les échanges avec lui ne sont pas anonymisés — contrairement aux autres services de l'ambassade.
 */
export const cultureService = {
  overview: async (): Promise<CultureOverview> => {
    const res = await api.get(`${C}/culture`);
    return unwrap(res);
  },

  listThreads: async (): Promise<CultureThread[]> => {
    const res = await api.get(`${C}/culture/threads`);
    return unwrap(res);
  },

  getThread: async (id: string): Promise<CultureThread & { messages: CultureMessage[] }> => {
    const res = await api.get(`${C}/culture/threads/${id}`);
    return unwrap(res);
  },

  createThread: async (data: { subject: string; message: string }): Promise<CultureThread> => {
    const res = await api.post(`${C}/culture/threads`, data);
    return unwrap(res);
  },

  reply: async (id: string, content: string): Promise<CultureMessage> => {
    const res = await api.post(`${C}/culture/threads/${id}/messages`, { content });
    return unwrap(res);
  },
};
