import api from "../axios";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  OtpRequest,
  VerifyOtpRequest,
} from "../dto/AuthDTO";
import { UserProfileDTO } from "../dto/UserDTO";

export const authService = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post("/auth/login", payload);
    return res.data;
  },
  getProfile: async (userId: string): Promise<UserProfileDTO> => {
    const res = await api.get("/auth/me", { params: { userId } });
    return res.data;
  },

  register: async (payload: RegisterRequest): Promise<void> => {
    await api.post("/auth/register", payload);
  },

  sendOtp: async (payload: OtpRequest): Promise<void> => {
    await api.post("/auth/send-otp", payload);
  },

  verifyOtp: async (payload: VerifyOtpRequest): Promise<void> => {
    await api.post("/auth/verify-otp", payload);
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
};
