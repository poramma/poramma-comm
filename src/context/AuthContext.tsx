import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { updatePersonalInfoDto, updateAddressDto, updateStudentProfileDto, updateWorkerProfileDto, UserProfileDTO } from "../api/dto/UserDTO";
import { authService } from "../api/services/authService";

interface AuthContextType {
  user: UserProfileDTO | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  updateUserPersonalInfo: (user: updatePersonalInfoDto) => void;
  updateUserAddress: (user: updateAddressDto) => void;
  updateUserStudentProfile: (user: updateStudentProfileDto) => void;
  updateUserWorkerProfile: (user: updateWorkerProfileDto) => void;
  sendOtp: (emailOrPhone: string) => Promise<void>;
  verifyOtp: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger le user au démarrage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authService
        .getProfile("1")
        .then((profile) => setUser(profile))
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    localStorage.setItem("token", res.token);
    setUser(res.user);
  };

  const register = async (data: any) => {
    await authService.register(data);
  };

  const sendOtp = async (emailOrPhone: string) => {
    await authService.sendOtp({ emailOrPhone });
  };

  const verifyOtp = async (data: any) => {
    await authService.verifyOtp(data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUserPersonalInfo = (updatedInfo: updatePersonalInfoDto) => {
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      
      return {
        ...prevUser,
        personalInfo: {
          ...prevUser.personalInfo,
          ...updatedInfo
        }
      };
    });
  };

  const updateUserAddress = (updateInfo: updateAddressDto)=> {
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      
      return {
        ...prevUser,
        address: {
          ...prevUser.address,
          ...updateInfo
        }
      };
    }); 
  };

  const updateUserStudentProfile = (updateInfo: updateStudentProfileDto)=> {
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      
      return {
        ...prevUser,
        studentProfile: {
          ...prevUser.studentProfile,
          ...updateInfo
        }
      };
    }); 
  };

  const updateUserWorkerProfile = (updateInfo: updateWorkerProfileDto)=> {
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      
      return {
        ...prevUser,
        workerProfile: {
          ...prevUser.workerProfile,
          ...updateInfo
        }
      };
    }); 
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, 
        sendOtp, verifyOtp, logout, updateUserPersonalInfo,
        updateUserAddress, updateUserStudentProfile, updateUserWorkerProfile
       }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
