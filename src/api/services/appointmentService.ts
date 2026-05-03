import api from "../axios";
import { AppointmentDTO, AppointmentStatus } from "../dto/AppointmentDTO";

export const appointmentService = {
  list: async (): Promise<AppointmentDTO[]> => {
    const res = await api.get("/appointments");
    return res.data;
  },

  book: async (payload: {
    service: string;
    subservice?: string;
    agentId: string;
    dateISO: string;
    motif: string;
    description?: string;
  }): Promise<AppointmentDTO> => {
    const res = await api.post("/appointments", payload);
    return res.data;
  },

  cancel: async (id: string): Promise<void> => {
    await api.post(`/appointments/${id}/cancel`);
  },

  updateStatus: async (id: string, status: AppointmentStatus): Promise<void> => {
    await api.put(`/appointments/${id}/status`, { status });
  },
};
