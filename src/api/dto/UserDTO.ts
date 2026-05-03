export type UserStatus = "UNVERIFIED" | "PENDING" | "VERIFIED";
export type UserType = "student" | "worker" | "family" | "other" | "";
export type DocumentStatus = "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "REJECTED";


export interface DocumentDTO {
  id?: string;
  type?: string;
  required?: boolean;
  status?: DocumentStatus;
  url?: string;
  uploadedAt?: string;
}



export interface LogEntryDTO {
  id: string;
  timestamp: string;
  operation: string;
  result: "SUCCESS" | "ERROR" | "REJECTED";
}

export interface UserProfileDTO {
  id: string;
  email: string;
  status?: UserStatus;
  inue?: string;
  userType?: UserType;
  personalInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    gender: string;
    bio?: string;
    birthDate: string;
  },
  address: {
    address: string;
    city: string;
    country: string;
    zipCode: string;
  },
  studentProfile?: {
    university?: string;
    faculty?: string;
    studyLevel?: string;
    scholarship?: {
      isRecipient: boolean;
      decisionNumber?: string;
      promotion?: string;
    };
  },
  workerProfile?: {
    employer?: string;
    profession?: string;
    contractType?: string;
    familyRelation?: string;
    mainApplicantINUE?: string;
  },
  documents: DocumentDTO[];
  logs: LogEntryDTO[];
}

export interface updateAddressDto {
  address: string;
  city: string;
  country: string;
  zipCode: string;
}

export interface updatePersonalInfoDto {
  firstName: string;
  lastName: string;
  gender: string;
  bio?: string;
  birthDate?: string;
}

export interface updateStudentProfileDto {
  university?: string;
  faculty?: string;
  studyLevel?: string;
  scholarship?: {
    isRecipient: boolean;
    decisionNumber?: string;
    promotion?: string;
  };
}

export interface updateWorkerProfileDto {
  employer?: string;
  profession?: string;
  contractType?: string;
  familyRelation?: string;
  mainApplicantINUE?: string;
}

