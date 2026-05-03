import api from "../axios";
import { UserProfileDTO, DocumentDTO,
  updateAddressDto,
  updatePersonalInfoDto,
  updateStudentProfileDto,
  updateWorkerProfileDto
 } from "../dto/UserDTO";

export const userService = {
  getProfile: async (): Promise<UserProfileDTO> => {
    const res = await api.get("/users/me");
    return res.data;
  },
  getUserProfile: async (userId: string): Promise<UserProfileDTO> => {
    const res = await api.get(`/users/me/${userId}/profile`);
    return res.data;
  },
  updateProfile: async (payload: Partial<UserProfileDTO>): Promise<UserProfileDTO> => {
    const res = await api.put("/users/me", payload);
    return res.data;
  },

  updatePersonalInfo: async (payload: updatePersonalInfoDto, userId: string): Promise<updatePersonalInfoDto> => {
    const res = await api.patch(`/users/me/${userId}/personal-info`, payload);
    return res.data;
  },

  updateAddress: async (payload: updateAddressDto, userId: string): Promise<updateAddressDto> => {
    const res = await api.patch(`/users/me/${userId}/address`, payload);
    return res.data;
  },

  updateStudentProfile: async (payload: updateStudentProfileDto, userId: string): Promise<updateStudentProfileDto> => {
    const res = await api.patch(`/users/me/${userId}/student-profile`, payload);
    return res.data;
  },

  updateWorkerProfile: async (payload: updateWorkerProfileDto, userId: string): Promise<updateWorkerProfileDto> => {
    const res = await api.patch(`/users/me/${userId}/worker-profile`, payload);
    return res.data;
  },

  uploadDocument: async (file: File, type: string): Promise<DocumentDTO> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const res = await api.post("/users/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  getLogs: async (userId: string) => {
    const res = await api.get(`/users/${userId}/logs`);
    return res.data;
  },
};
