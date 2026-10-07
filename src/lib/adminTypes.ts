// ============================================================
// src/lib/adminTypes.ts — charges utiles de l'administration de la communauté
// ============================================================

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Paginated<T, M = PageMeta> {
  rows: T[];
  meta: M;
}

// ---------- Tableau de bord ----------

export interface DayCount {
  /** AAAA-MM-JJ */
  day: string;
  n: number;
}

export interface AdminOverview {
  members: { total: number; suspended: number; verified: number; unverified: number; new7: number; new30: number };
  byUserType: Record<string, number>;
  byRegistration: Record<string, number>;
  activity: { logins24h: number; failedLogins24h: number; criticalEvents24h: number; activeMembers24h: number };
  series: { registrations: DayCount[]; logins: DayCount[] };
  support: { open: number; inProgress: number; waitingUser: number; unassigned: number };
}

// ---------- Système ----------

export interface ComponentHealth {
  ok: boolean;
  ms: number;
}

export interface AdminSystem {
  checkedAt: string;
  components: {
    database: ComponentHealth;
    redis: ComponentHealth;
    storage: ComponentHealth;
    mail: { configured: boolean; provider: string | null };
  };
  runtime: { service: string; node: string; environment: string; uptimeSeconds: number; memoryMb: number };
}

// ---------- Membres ----------

export type MemberStatus = "VERIFIED" | "UNVERIFIED" | "SUSPENDED";
export type MemberUserType = "student" | "worker" | "other";
export type MemberRegistration = "PENDING" | "VALIDATED" | "REJECTED" | "SUSPENDED" | "NONE";

export interface MemberFilters {
  search?: string;
  status?: MemberStatus | "";
  userType?: MemberUserType | "";
  registration?: MemberRegistration | "";
  page?: number;
  limit?: number;
}

export interface MemberRow {
  id: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
  userType: string | null;
  city: string | null;
  country: string | null;
  inue: string | null;
  registrationStatus: string | null;
  lastLoginAt: string | null;
}

export interface MemberSession {
  id: string;
  ip: string | null;
  userAgent: string | null;
  rememberMe: boolean;
  createdAt: string;
  revokedAt: string | null;
}

export interface MemberActivity {
  id: string;
  at: string;
  action: string;
  entityType: string | null;
  result: string;
  severity: string;
  ip: string | null;
}

export interface MemberDetail {
  id: string;
  email: string;
  phone: string | null;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  firstName: string | null;
  lastName: string | null;
  userType: string | null;
  birthDate: string | null;
  nationality: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  gender: string | null;
  registrationStatus: string | null;
  inue: string | null;
  submittedAt: string | null;
  counts: { demandes: number; rendezVous: number; tickets: number };
  sessions: MemberSession[];
  recentActivity: MemberActivity[];
}

// ---------- Journal d'audit ----------

export type AuditSeverity = "INFO" | "WARNING" | "CRITICAL";
export type AuditResult = "SUCCESS" | "ERROR" | "REJECT" | "WARNING";

export interface AuditFilters {
  search?: string;
  action?: string;
  entityType?: string;
  result?: AuditResult | "";
  severity?: AuditSeverity | "";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface AuditRow {
  id: string;
  at: string;
  actorUserId: string | null;
  actorEmail: string | null;
  actorInue: string | null;
  actorName: string | null;
  actorRole: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  entitySnapshot: unknown;
  result: string;
  details: unknown;
  ip: string | null;
  ua: string | null;
  sessionId: string | null;
  severity: string;
}

export interface AuditStats {
  total: number;
  bySeverity: Partial<Record<AuditSeverity, number>>;
  byResult: Partial<Record<AuditResult, number>>;
  failedLogins: number;
  criticalEvents: number;
}

export type AuditExportFormat = "CSV" | "JSON";

// ---------- Support de la communauté ----------

export type AdminTicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_USER" | "RESOLVED" | "CLOSED";
export type AdminTicketStatusFilter = AdminTicketStatus | "ACTIVE";
export type AdminTicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface AdminTicketFilters {
  status?: AdminTicketStatusFilter | "";
  category?: string;
  priority?: AdminTicketPriority | "";
  /** 'me' | 'unassigned' | identifiant d'un agent */
  assigned?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminTicketRow {
  id: string;
  reference: string;
  subject: string;
  target: string;
  category: string;
  linkedReference: string | null;
  status: AdminTicketStatus;
  priority: AdminTicketPriority;
  requester: { id: string; name: string | null; email: string | null; phone: string | null; inue: string | null };
  assignee: { id: string; name: string | null } | null;
  createdAt: string;
  lastMessageAt: string;
  lastMessageBy: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
}

export interface AdminTicketStats {
  open: number;
  inProgress: number;
  waitingUser: number;
  resolved: number;
  closed: number;
  unassigned: number;
  mine: number;
}

export type AdminTicketMeta = PageMeta & { stats: AdminTicketStats };

export interface AdminTicketMessage {
  id: string;
  authorType: "USER" | "STAFF" | "SYSTEM";
  authorName: string | null;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface AdminTicketDetail extends AdminTicketRow {
  messages: AdminTicketMessage[];
}

export interface Assignee {
  id: string;
  name: string | null;
}

// ---------- Équipe ----------

export type TeamRole = "COMMUNITY_ADMIN" | "COMMUNITY_SUPPORT";

export interface TeamMember {
  userId: string;
  email: string;
  name: string | null;
  status: string;
  role: TeamRole;
  assignedAt: string;
}
