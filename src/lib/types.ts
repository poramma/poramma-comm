// Types centraux pour l'Espace Étudiant & INUE

export type Role = "STUDENT" | "CONSULAR_AGENT" | "ADMIN";

export type VerificationStatus =
  | "UNREGISTERED"        // pas de compte
  | "BASIC_REGISTERED"    // phase 1 OK (accès public)
  | "SUBMITTED"           // justificatifs envoyés
  | "UNDER_REVIEW"        // en cours de contrôle consulaire
  | "VERIFIED"            // validé (INUE attribué)
  | "REJECTED";           // rejeté

export type DocumentKind =
  | "ID_MALIENNE"       // Pièce d’identité malienne
  | "CERTIFICAT_SCOLARITE"
  | "CARTE_CONSULAIRE"
  | "DEMANDE_CARTE_CONSULAIRE";

export interface StudentProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  inue?: string;                     // INUE une fois validé
  roles: Role[];
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BasicRegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface OtpChannel { channel: "sms" | "email"; }

export interface OtpRequestPayload extends OtpChannel {
  reason: "LOGIN" | "VERIFY_STEP2";
}

export interface OtpVerifyPayload {
  code: string; // 6 chiffres
  reason: "LOGIN" | "VERIFY_STEP2";
}

export interface IdentityDocUpload {
  kind: DocumentKind;
  file: File;
}

export interface VerificationSubmitPayload {
  documents: { kind: DocumentKind; fileId: string }[]; // fileId retourné par /upload
}

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export type AuditAction =
  | "REGISTER_BASIC"
  | "LOGIN_REQUEST_OTP"
  | "LOGIN_VERIFY_OTP"
  | "VERIFY_DOCS_UPLOAD"
  | "VERIFY_SUBMIT"
  | "VERIFY_APPROVED"
  | "VERIFY_REJECTED"
  | "INUE_ISSUED";

export interface AuditEvent {
  at: string;                // ISO date
  userId?: string;           // si dispo
  inue?: string;             // si dispo
  action: AuditAction;
  entity?: string;           // ex: "student_profile"
  entityId?: string;
  result: "SUCCESS" | "ERROR";
  meta?: Record<string, any>;
}
