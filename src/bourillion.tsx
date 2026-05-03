import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Lock, Upload, CheckCircle, AlertCircle, FileText, Clock, Key, ArrowLeft, BookOpen, GraduationCap, Briefcase, Home, Users, Badge } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Input from "./components/form/input/InputField";
import Label from "./components/form/Label";
import Select from "./components/form/Select";
import Button from "./components/ui/button/Button";

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  inue?: string;
  result: "success" | "error" | "rejected";
}

interface Document {
  name: string;
  url: string;
  status: "SUBMITTED" | "APPROVED" | "REJECTED";
}

interface StudentProfile {
  id: string;
  email: string;
  status: "UNVERIFIED" | "PENDING" | "VERIFIED";
  inue?: string;
  userType: "student" | "worker" | "family" | "other" | "";
  personalInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    // Student specific
    university?: string;
    faculty?: string;
    studyLevel?: string;
    scholarship?: {
      isRecipient: boolean;
      decisionNumber?: string;
      promotion?: string;
    };
    // Worker specific
    employer?: string;
    profession?: string;
    contractType?: string;
    // Family specific
    familyRelation?: string;
    mainApplicantINUE?: string;
  };
  documents: Document[];
  logs: LogEntry[];
}

const mockProfile: StudentProfile = {
  id: `STU-${Math.random().toString(36).substr(2, 9)}`,
  email: "",
  status: "UNVERIFIED",
  userType: "",
  personalInfo: {
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: ""
  },
  documents: [],
  logs: [],
};

const citiesInMorocco = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", 
  "Meknès", "Agadir", "Oujda", "Kénitra", "Tétouan",
  "Safi", "Mohammédia", "El Jadida", "Béni Mellal", "Nador"
];

const universitiesInMorocco = [
  "Université Mohammed V de Rabat",
  "Université Hassan II de Casablanca",
  "Université Cadi Ayyad de Marrakech",
  "Université Sidi Mohamed Ben Abdellah de Fès",
  "Université Ibn Tofail de Kénitra",
  "Université Abdelmalek Essaâdi de Tétouan/Tanger",
  "Université Chouaib Doukkali d'El Jadida",
  "Université Ibn Zohr d'Agadir",
  "Université Mohammed Premier d'Oujda",
  "Université Moulay Ismail de Meknès"
];

const studyLevels = [
  "Baccalauréat",
  "Bac +1",
  "Bac +2 (DEUG, DUT, BTS)",
  "Licence (Bac +3)",
  "Master (Bac +5)",
  "Doctorat (Bac +8)",
  "Autre"
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function StudentSpace() {
  const [profile, setProfile] = useState<StudentProfile>(mockProfile);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [step, setStep] = useState<"ENREGISTREMENT" | "OTP" | "USER_TYPE" | "PERSONAL_INFO" | "DOCUMENTS" | "PROFILE">("ENREGISTREMENT");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (step === "ENREGISTREMENT") {
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        newErrors.email = "Adresse email invalide";
      }
      if (!formData.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
        newErrors.password =
          "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      }
    } else if (step === "OTP") {
      if (!formData.otp.match(/^\d{6}$/)) {
        newErrors.otp = "Le code OTP doit contenir 6 chiffres";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEnregistrement = () => {
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs avant de continuer.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setProfile((prev) => ({
        ...prev,
        email: formData.email,
        status: "PENDING",
        logs: [
          ...prev.logs,
          {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            action: "ENREGISTREMENT",
            userId: prev.id,
            result: "success",
          },
        ],
      }));
      setStep("OTP");
      toast.info("Enregistrement initié. Veuillez vérifier votre code OTP envoyé par email/SMS.");
    }, 1000);
  };

  const handleOtpVerification = () => {
    if (!validateForm()) {
      toast.error("Veuillez entrer un code OTP valide.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setProfile((prev) => ({
        ...prev,
        status: "PENDING",
        logs: [
          ...prev.logs,
          {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            action: "OTP_VERIFICATION",
            userId: prev.id,
            result: "success",
          },
        ],
      }));
      setStep("USER_TYPE");
      toast.success("Vérification réussie ! Veuillez sélectionner votre statut.");
    }, 1000);
  };

  const handleUserTypeSelection = (type: StudentProfile["userType"]) => {
    setProfile(prev => ({
      ...prev,
      userType: type
    }));
    setStep("PERSONAL_INFO");
  };

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("personalInfo.")) {
      const field = name.split(".")[1];
      setProfile(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [field]: value
        }
      }));
    } else if (name.startsWith("scholarship.")) {
      const field = name.split(".")[1];
      setProfile(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          scholarship: {
            ...prev.personalInfo.scholarship,
            isRecipient: value === "true",
            [field]: value
          }
        }
      }));
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfile((prev) => ({
        ...prev,
        documents: [
          ...prev.documents.filter((doc) => doc.name !== docType),
          { name: docType, url: URL.createObjectURL(file), status: "SUBMITTED" },
        ],
        logs: [
          ...prev.logs,
          {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            action: `UPLOAD_DOCUMENT_${docType}`,
            userId: prev.id,
            result: "success",
          },
        ],
      }));
      toast.success(`Document "${docType}" téléversé avec succès !`);
    }
  };

  const getRequiredDocuments = () => {
    const baseDocs = ["Pièce d'identité malienne", "Passeport"];
    
    if (profile.userType === "student") {
      return [...baseDocs, "Attestation d'inscription", "Carte consulaire", "Photo d'identité"];
    } else if (profile.userType === "worker") {
      return [...baseDocs, "Contrat de travail", "Attestation de travail", "Carte de séjour"];
    } else if (profile.userType === "family") {
      return [...baseDocs, "Acte de mariage", "Livret de famille", "Carte de séjour"];
    }
    
    return baseDocs;
  };

  const renderContent = () => {
    switch (step) {
      case "ENREGISTREMENT":
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            <motion.h3 variants={itemVariants} className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">
              Enregistrement auprès de l'ambassade
            </motion.h3>
            <motion.div variants={itemVariants}>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Entrez votre email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={!!errors.email}
                hint={errors.email}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Label>Mot de passe</Label>
              <Input
                type="password"
                placeholder="Créez un mot de passe sécurisé"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={!!errors.password}
                hint={errors.password}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Label>Confirmer le mot de passe</Label>
              <Input
                type="password"
                placeholder="Confirmez votre mot de passe"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={!!errors.confirmPassword}
                hint={errors.confirmPassword}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="flex justify-end">
              <Button
                onClick={handleEnregistrement}
                variant="primary"
                className="bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-2"
                disabled={isLoading}
                aria-label="Démarrer l'enregistrement"
              >
                {isLoading ? "Enregistrement..." : "Démarrer"}
                <User className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        );

      case "OTP":
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            <motion.h3 variants={itemVariants} className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">
              Vérification OTP
            </motion.h3>
            <motion.div variants={itemVariants}>
              <Label>Code OTP</Label>
              <Input
                type="text"
                placeholder="Entrez le code OTP (6 chiffres)"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                error={!!errors.otp}
                hint={errors.otp}
                max="6"
              />
            </motion.div>
            <motion.div variants={itemVariants} className="flex justify-end">
              <Button
                onClick={handleOtpVerification}
                variant="primary"
                className="bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-2"
                disabled={isLoading}
                aria-label="Vérifier le code OTP"
              >
                {isLoading ? "Vérification..." : "Vérifier"}
                <CheckCircle className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        );

      case "USER_TYPE":
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <motion.h3 variants={itemVariants} className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">
              Sélectionnez votre statut
            </motion.h3>
            
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleUserTypeSelection("student")}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                  profile.userType === "student" 
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30" 
                    : "border-neutral-200 dark:border-neutral-600 hover:border-brand-300"
                }`}
              >
                <GraduationCap className="w-8 h-8 mb-2 text-brand-500" />
                <span className="font-medium">Étudiant(e)</span>
              </button>
              
              <button
                onClick={() => handleUserTypeSelection("worker")}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                  profile.userType === "worker" 
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30" 
                    : "border-neutral-200 dark:border-neutral-600 hover:border-brand-300"
                }`}
              >
                <Briefcase className="w-8 h-8 mb-2 text-brand-500" />
                <span className="font-medium">Travailleur</span>
              </button>
              
              <button
                onClick={() => handleUserTypeSelection("family")}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                  profile.userType === "family" 
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30" 
                    : "border-neutral-200 dark:border-neutral-600 hover:border-brand-300"
                }`}
              >
                <Users className="w-8 h-8 mb-2 text-brand-500" />
                <span className="font-medium">Membre de famille</span>
              </button>
              
              <button
                onClick={() => handleUserTypeSelection("other")}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                  profile.userType === "other" 
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30" 
                    : "border-neutral-200 dark:border-neutral-600 hover:border-brand-300"
                }`}
              >
                <User className="w-8 h-8 mb-2 text-brand-500" />
                <span className="font-medium">Autre statut</span>
              </button>
            </motion.div>
          </motion.div>
        );

      case "PERSONAL_INFO":
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            <motion.h3 variants={itemVariants} className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">
              Informations personnelles
            </motion.h3>
            
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Prénom</Label>
                <Input
                  type="text"
                  name="personalInfo.firstName"
                  value={profile.personalInfo.firstName}
                  onChange={handlePersonalInfoChange}
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <Label>Nom</Label>
                <Input
                  type="text"
                  name="personalInfo.lastName"
                  value={profile.personalInfo.lastName}
                  onChange={handlePersonalInfoChange}
                  placeholder="Votre nom"
                />
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Label>Téléphone</Label>
              <Input
                type="tel"
                name="personalInfo.phone"
                value={profile.personalInfo.phone}
                onChange={handlePersonalInfoChange}
                placeholder="Votre numéro de téléphone"
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Label>Adresse au Maroc</Label>
              <Input
                type="text"
                name="personalInfo.address"
                value={profile.personalInfo.address}
                onChange={handlePersonalInfoChange}
                placeholder="Votre adresse complète"
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Label>Ville</Label>
              <Select
            name="personalInfo.city"
            defaultValue={profile.personalInfo.city}
            onChange={(value) => {
                // Create a synthetic event
                const syntheticEvent = {
                target: {
                    name: "personalInfo.city",
                    value: value
                }
                } as React.ChangeEvent<HTMLSelectElement>;
                handlePersonalInfoChange(syntheticEvent);
            }}
            options={citiesInMorocco.map(city => ({ value: city, label: city }))}
            />
            </motion.div>
            
            {profile.userType === "student" && (
              <>
                <motion.h4 variants={itemVariants} className="text-md font-medium text-neutral-700 dark:text-neutral-200 mt-6">
                  Informations académiques
                </motion.h4>
                
                <motion.div variants={itemVariants}>
                  <Label>Université/Établissement</Label>
                  <Select
                    name="personalInfo.university"
                    defaultValue={profile.personalInfo.university || ""}
                    onChange={(value) => {
                        // Create a synthetic event
                        const syntheticEvent = {
                        target: {
                            name: "personalInfo.university",
                            value: value
                        }
                        } as React.ChangeEvent<HTMLSelectElement>;
                        handlePersonalInfoChange(syntheticEvent);
                    }}
                    options={universitiesInMorocco.map(uni => ({ value: uni, label: uni }))}
                    placeholder="Sélectionnez votre université"
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Label>Faculté/Filière</Label>
                  <Input
                    type="text"
                    value={profile.personalInfo.faculty || ""}
                    onChange={(e) => handlePersonalInfoChange(e)}
                    placeholder="Votre faculté ou filière"
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Label>Niveau d'études</Label>
                  <Select
                    name="personalInfo.studyLevel"
                    defaultValue={profile.personalInfo.studyLevel || ""}
                    onChange={(value) => {
                        // Create a synthetic event
                        const syntheticEvent = {
                        target: {
                            name: "personalInfo.studyLevel",
                            value: value
                        }
                        } as React.ChangeEvent<HTMLSelectElement>;
                        handlePersonalInfoChange(syntheticEvent);
                    }}
                    options={studyLevels.map(level => ({ value: level, label: level }))}
                    placeholder="Sélectionnez votre niveau"
                  />
                </motion.div>
                
                <motion.div variants={itemVariants} className="mt-4">
                  <Label className="flex items-center gap-2">
                    <input
                      id="personalInfo.scholarship.isRecipient"
                      placeholder="Boursier(ère) de l'État malien"
                      type="checkbox"
                      name="personalInfo.scholarship.isRecipient"
                      checked={profile.personalInfo.scholarship?.isRecipient || false}
                      onChange={(e) => handlePersonalInfoChange({
                        target: {
                          name: "personalInfo.scholarship.isRecipient",
                          value: e.target.checked
                        }
                      } as unknown as React.ChangeEvent<HTMLInputElement>)}
                      className="rounded text-brand-500"
                    />
                    Boursier(ère) de l'État malien
                  </Label>
                  
                  {profile.personalInfo.scholarship?.isRecipient && (
                    <div className="mt-2 space-y-2 pl-6">
                      <div>
                        <Label>Numéro de décision</Label>
                        <Input
                          type="text"
                          name="personalInfo.scholarship.decisionNumber"
                          value={profile.personalInfo.scholarship?.decisionNumber || ""}
                          onChange={ handlePersonalInfoChange}
                          placeholder="Numéro de décision d'attribution"
                        />
                      </div>
                      <div>
                        <Label>Promotion</Label>
                        <Input
                          type="text"
                          name="personalInfo.scholarship.promotion"
                          value={profile.personalInfo.scholarship?.promotion || ""}
                          onChange={ handlePersonalInfoChange}
                          placeholder="Année de promotion"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </>
            )}
            
            {profile.userType === "worker" && (
              <>
                <motion.h4 variants={itemVariants} className="text-md font-medium text-neutral-700 dark:text-neutral-200 mt-6">
                  Informations professionnelles
                </motion.h4>
                
                <motion.div variants={itemVariants}>
                  <Label>Employeur</Label>
                  <Input
                    type="text"
                    name="personalInfo.employer"
                    value={profile.personalInfo.employer || ""}
                    onChange={handlePersonalInfoChange}
                    placeholder="Nom de votre employeur"
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Label>Profession</Label>
                  <Input
                    type="text"
                    name="personalInfo.profession"
                    value={profile.personalInfo.profession || ""}
                    onChange={handlePersonalInfoChange}
                    placeholder="Votre profession"
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Label>Type de contrat</Label>
                  <Select
                    name="personalInfo.contractType"
                    defaultValue={profile.personalInfo.contractType || ""}
                    onChange={(value) => {
                        // Create a synthetic event
                        const syntheticEvent = {
                        target: {
                            name: "personalInfo.contractType",
                            value: value
                        }
                        } as React.ChangeEvent<HTMLSelectElement>;
                        handlePersonalInfoChange(syntheticEvent);
                    }}
                    options={[
                      { value: "CDI", label: "CDI" },
                      { value: "CDD", label: "CDD" },
                      { value: "Stage", label: "Stage" },
                      { value: "Freelance", label: "Freelance" },
                      { value: "Autre", label: "Autre" }
                    ]}
                    placeholder="Sélectionnez votre type de contrat"
                  />
                </motion.div>
              </>
            )}
            
            {profile.userType === "family" && (
              <>
                <motion.h4 variants={itemVariants} className="text-md font-medium text-neutral-700 dark:text-neutral-200 mt-6">
                  Informations familiales
                </motion.h4>
                
                <motion.div variants={itemVariants}>
                  <Label>Lien de parenté</Label>
                  <Select
                    name="personalInfo.familyRelation"
                    defaultValue={profile.personalInfo.familyRelation || ""}
                    onChange={(value) => {
                        // Create a synthetic event
                        const syntheticEvent = {
                        target: {
                            name: "personalInfo.familyRelation",
                            value: value
                        }
                        } as React.ChangeEvent<HTMLSelectElement>;
                        handlePersonalInfoChange(syntheticEvent);
                    }}
                    options={[
                      { value: "Conjoint(e)", label: "Conjoint(e)" },
                      { value: "Enfant", label: "Enfant" },
                      { value: "Parent", label: "Parent" },
                      { value: "Autre", label: "Autre" }
                    ]}
                    placeholder="Sélectionnez votre lien de parenté"
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Label>INUE du membre principal</Label>
                  <Input
                    type="text"
                    name="personalInfo.mainApplicantINUE"
                    value={profile.personalInfo.mainApplicantINUE || ""}
                    onChange={ handlePersonalInfoChange}
                    placeholder="INUE du membre principal de la famille"
                  />
                </motion.div>
              </>
            )}
            
            <motion.div variants={itemVariants} className="flex justify-end pt-4">
              <Button
                onClick={() => setStep("DOCUMENTS")}
                variant="primary"
                className="bg-brand-500 hover:bg-brand-600 text-white"
                disabled={!profile.personalInfo.firstName || !profile.personalInfo.lastName || !profile.personalInfo.phone || !profile.personalInfo.city}
              >
                Continuer
                <ArrowLeft className="w-4 h-4 transform rotate-180 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        );

      case "DOCUMENTS":
        const requiredDocs = getRequiredDocuments();
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            <motion.h3 variants={itemVariants} className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">
              Documents requis
            </motion.h3>
            
            <motion.div variants={itemVariants}>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                Veuillez téléverser les documents suivants pour compléter votre enregistrement. 
                Les documents doivent être clairs et lisibles, au format PDF, JPG ou PNG.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-6">
              {requiredDocs.map((doc, idx) => (
                <motion.div key={idx} variants={itemVariants} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-neutral-700 dark:text-neutral-200">{doc}</h4>
                    {profile.documents.find(d => d.name === doc) && (
                      <Badge variant="solid" color="success" className="text-xs">
                        Téléversé
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex-1">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleDocumentUpload(e, doc)}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <div className="cursor-pointer border border-neutral-300 dark:border-neutral-600 rounded-lg p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                          <Upload className="w-4 h-4" />
                          <span>{profile.documents.find(d => d.name === doc) ? "Remplacer le document" : "Sélectionner un fichier"}</span>
                        </div>
                      </div>
                    </label>
                    
                    {profile.documents.find(d => d.name === doc) && (
                      <a
                        href={profile.documents.find(d => d.name === doc)?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        Voir le document
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex justify-between pt-4">
              <Button
                onClick={() => setStep("PERSONAL_INFO")}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
              
              <Button
                onClick={() => {
                  if (profile.documents.length >= requiredDocs.length) {
                    const inue = `INUE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                    setProfile(prev => ({
                      ...prev,
                      inue,
                      status: "PENDING",
                      logs: [
                        ...prev.logs,
                        {
                          id: Date.now().toString(),
                          timestamp: new Date().toISOString(),
                          action: "DOCUMENTS_SUBMITTED",
                          userId: prev.id,
                          inue,
                          result: "success"
                        }
                      ]
                    }));
                    setStep("PROFILE");
                    toast.success("Votre demande d'enregistrement a été soumise avec succès !");
                  } else {
                    toast.error("Veuillez téléverser tous les documents requis avant de continuer.");
                  }
                }}
                variant="primary"
                className="bg-brand-500 hover:bg-brand-600 text-white"
                disabled={profile.documents.length < requiredDocs.length}
              >
                Soumettre ma demande
              </Button>
            </motion.div>
          </motion.div>
        );

      case "PROFILE":
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <motion.div variants={itemVariants} className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-brand-500 mb-4" />
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
                {profile.status === "VERIFIED" 
                  ? "Enregistrement validé !" 
                  : "Demande soumise avec succès !"}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                {profile.status === "VERIFIED" 
                  ? "Votre enregistrement auprès de l'ambassade a été validé." 
                  : "Votre demande est en cours de traitement par nos services."}
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-4">
              <h4 className="font-medium text-neutral-700 dark:text-neutral-200 mb-3">Récapitulatif</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">Statut :</span>
                  <Badge
                    variant={profile.status === "VERIFIED" ? "solid" : "outline"}
                    color={profile.status === "VERIFIED" ? "success" : "warning"}
                    className="text-sm"
                  >
                    {profile.status === "VERIFIED" ? "Validé" : "En attente"}
                  </Badge>
                </div>
                
                {profile.inue && (
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">INUE :</span>
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{profile.inue}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">Type :</span>
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100 capitalize">
                    {profile.userType === "student" ? "Étudiant(e)" : 
                     profile.userType === "worker" ? "Travailleur" : 
                     profile.userType === "family" ? "Membre de famille" : "Autre"}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">Nom complet :</span>
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    {profile.personalInfo.firstName} {profile.personalInfo.lastName}
                  </span>
                </div>
                
                {profile.userType === "student" && profile.personalInfo.university && (
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">Université :</span>
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                      {profile.personalInfo.university}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-4">
              <h4 className="font-medium text-neutral-700 dark:text-neutral-200 mb-3">Documents soumis</h4>
              
              <ul className="space-y-2">
                {profile.documents.map((doc, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-300">{doc.name}</span>
                    </div>
                    <Badge
                      variant="solid"
                      color={doc.status === "APPROVED" ? "success" : "warning"}
                      className="text-xs"
                    >
                      {doc.status === "APPROVED" ? "Approuvé" : "En vérification"}
                    </Badge>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex justify-center pt-2">
              <Button
                onClick={() => navigate("/student/home")}
                variant="primary"
                className="bg-brand-500 hover:bg-brand-600 text-white"
              >
                Accéder à mon espace
              </Button>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 sm:p-6 space-y-6 font-outfit animate-fade-in"
      aria-labelledby="registration-title"
    >
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1
            id="registration-title"
            className="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-2"
          >
            Enregistrement auprès de l'Ambassade du Mali au Maroc
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {step === "ENREGISTREMENT" ? "Créez votre compte pour accéder aux services consulaires" :
             step === "OTP" ? "Vérifiez votre identité avec le code OTP" :
             step === "USER_TYPE" ? "Sélectionnez votre statut au Maroc" :
             step === "PERSONAL_INFO" ? "Renseignez vos informations personnelles" :
             step === "DOCUMENTS" ? "Téléversez vos documents justificatifs" :
             "Votre demande a été soumise avec succès"}
          </p>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {["ENREGISTREMENT", "OTP", "USER_TYPE", "PERSONAL_INFO", "DOCUMENTS", "PROFILE"].map((s, index) => (
              <React.Fragment key={s}>
                <button
                  onClick={() => {
                    const currentIndex = ["ENREGISTREMENT", "OTP", "USER_TYPE", "PERSONAL_INFO", "DOCUMENTS", "PROFILE"].indexOf(step);
                    if (index < currentIndex) setStep(s as any);
                  }}
                  className={`flex flex-col items-center relative ${index <= ["ENREGISTREMENT", "OTP", "USER_TYPE", "PERSONAL_INFO", "DOCUMENTS", "PROFILE"].indexOf(step) ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index < ["ENREGISTREMENT", "OTP", "USER_TYPE", "PERSONAL_INFO", "DOCUMENTS", "PROFILE"].indexOf(step) 
                      ? "bg-brand-500 text-white" 
                      : index === ["ENREGISTREMENT", "OTP", "USER_TYPE", "PERSONAL_INFO", "DOCUMENTS", "PROFILE"].indexOf(step)
                      ? "border-2 border-brand-500 bg-white dark:bg-neutral-800 text-brand-500"
                      : "border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-400"
                  }`}>
                    {index < ["ENREGISTREMENT", "OTP", "USER_TYPE", "PERSONAL_INFO", "DOCUMENTS", "PROFILE"].indexOf(step) ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`text-xs mt-2 text-center ${
                    index <= ["ENREGISTREMENT", "OTP", "USER_TYPE", "PERSONAL_INFO", "DOCUMENTS", "PROFILE"].indexOf(step)
                      ? "text-neutral-700 dark:text-neutral-200 font-medium"
                      : "text-neutral-400"
                  }`}>
                    {s === "ENREGISTREMENT" ? "Compte" :
                     s === "OTP" ? "Vérification" :
                     s === "USER_TYPE" ? "Statut" :
                     s === "PERSONAL_INFO" ? "Informations" :
                     s === "DOCUMENTS" ? "Documents" : "Terminé"}
                  </span>
                </button>
                
                {index < 5 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    index < ["ENREGISTREMENT", "OTP", "USER_TYPE", "PERSONAL_INFO", "DOCUMENTS", "PROFILE"].indexOf(step)
                      ? "bg-brand-500"
                      : "bg-neutral-200 dark:bg-neutral-700"
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-neutral-800 shadow-theme-lg rounded-xl p-6"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}