export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface AgentDTO {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface AppointmentDTO {
  id: string;
  ticketId?: string;
  service: string;
  subservice?: string;
  agent: AgentDTO;
  dateISO: string;
  status: AppointmentStatus;
  createdAt: string;
}
