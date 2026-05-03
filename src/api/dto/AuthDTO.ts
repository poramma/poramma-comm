import { UserProfileDTO } from "./UserDTO";

// Requête connexion
export interface LoginRequest {
    email: string;
    password: string;
  }
  
  // Réponse connexion
  export interface LoginResponse {
    token: string;
    refreshToken?: string;
    user: UserProfileDTO;
  }
  
  // Requête inscription
  export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }
  
  // OTP
  export interface OtpRequest {
    emailOrPhone: string;
  }
  
  export interface VerifyOtpRequest extends OtpRequest {
    otp: string;
  }
  