import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, FileText, Clock, Mail, Info, CheckCircle, Upload, Calendar } from "lucide-react";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  inue?: string;
  result: "success" | "error" | "rejected";
}

interface StudentProfile {
  createdAt: string | number | Date;
  id: string;
  email: string;
  status: "UNVERIFIED" | "PENDING" | "VERIFIED";
  inue?: string;
  documents: { name: string; url: string; status: "SUBMITTED" | "APPROVED" | "REJECTED" }[];
  logs: LogEntry[];
}

// Profil simulé pour l'utilisateur en attente
const mockProfile: StudentProfile = {
    id: `STU-${Math.random().toString(36).substr(2, 9)}`,
    email: "etudiant@example.com",
    status: "PENDING",
    documents: [
        { name: "Pièce d’identité malienne", url: "#", status: "SUBMITTED" },
        { name: "Certificat de scolarité", url: "#", status: "SUBMITTED" },
        { name: "Carte consulaire", url: "#", status: "SUBMITTED" },
    ],
    logs: [
        {
            id: "1",
            timestamp: new Date().toISOString(),
            action: "ENREGISTREMENT",
            userId: `STU-${Math.random().toString(36).substr(2, 9)}`,
            result: "success",
        },
        {
            id: "2",
            timestamp: new Date().toISOString(),
            action: "OTP_VERIFICATION",
            userId: `STU-${Math.random().toString(36).substr(2, 9)}`,
            result: "success",
        },
    ],
    createdAt: new Date().toISOString(),
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function BasicHomePage() {
  const [profile, setProfile] = useState<StudentProfile>(mockProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [showRequestInfo, setShowRequestInfo] = useState(false);

  // Simuler journalisation à l'accès de la page
  useEffect(() => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action: "HOME_PAGE_ACCESS",
      userId: profile.id,
      result: "success",
    };
    setProfile((prev) => ({ ...prev, logs: [...prev.logs, newLog] }));
  }, []);

  const handleCheckStatus = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.info("Statut de votre demande : En attente de validation par les services consulaires.");
      setProfile((prev) => ({
        ...prev,
        logs: [
          ...prev.logs,
          {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            action: "CHECK_STATUS",
            userId: prev.id,
            result: "success",
          },
        ],
      }));
    }, 1000);
    setShowRequestInfo(!showRequestInfo);
  };

  const handleModifyDocuments = () => {
    toast.info("Redirection vers la page de gestion des documents...");
    setProfile((prev) => ({
      ...prev,
      logs: [
        ...prev.logs,
        {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          action: "MODIFY_DOCUMENTS_CLICK",
          userId: prev.id,
          result: "success",
        },
      ],
    }));
  };

  const handleContactSupport = () => {
    toast.info("Redirection vers le support consulaire...");
    setProfile((prev) => ({
      ...prev,
      logs: [
        ...prev.logs,
        {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          action: "CONTACT_SUPPORT_CLICK",
          userId: prev.id,
          result: "success",
        },
      ],
    }));
  };

  // Masquer partiellement l'email pour la confidentialité
  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split("@");
    return `${localPart.slice(0, 3)}****@${domain}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-neutral-50 dark:bg-neutral-800 p-4 sm:p-6 space-y-6 font-outfit animate-fade-in"
      aria-labelledby="home-page-title"
    >
      <ToastContainer />
      <h1
        id="home-page-title"
        className="text-title-lg font-heading font-bold text-neutral-700 dark:text-neutral-50 text-center"
      >
        Bienvenue sur Fivision
      </h1>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Section de bienvenue */}
        <motion.section variants={itemVariants} className="bg-white dark:bg-neutral-700 shadow-theme-md rounded-radius-lg p-4 sm:p-6">
          <h2 className="text-title-md font-semibold text-neutral-700 dark:text-neutral-50 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-500" /> Bonjour, {maskEmail(profile.email)}
          </h2>
          <p className="text-theme-sm text-neutral-600 dark:text-neutral-300 mt-2">
            Votre demande d’enregistrement auprès de l’ambassade est <strong>en attente de validation</strong>. Vous recevrez une notification par email une fois votre dossier vérifié et votre INUE attribué.
          </p>
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleCheckStatus}
              variant="primary"
              className="bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-2"
              disabled={isLoading}
              aria-label="Vérifier le statut de la demande"
            >
            {showRequestInfo ? "Masquer" : "Afficher"}
            
              <CheckCircle className="w-4 h-4" />
            </Button>
          </div>
        </motion.section>

        {/* Section des informations de la demande */}
        {showRequestInfo && (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-neutral-700 shadow-theme-md rounded-radius-lg p-4 sm:p-6 mt-6"
          >
            <h2 className="text-title-md font-semibold text-neutral-700 dark:text-neutral-50 flex items-center gap-2">
              <Info className="text-brand-500" /> Informations de la demande
            </h2>
            <ul className="text-theme-sm text-neutral-600 dark:text-neutral-300 mt-2 space-y-2">
              <li className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Date de soumission :{" "}
                <span className="font-semibold">{new Date(profile.createdAt).toLocaleDateString()}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Statut :{" "}
                <span className="font-semibold">{profile.status}</span>
              </li>
            </ul>
          </motion.section>
        )}   

        {/* Statut des documents */}
        <motion.section variants={itemVariants} className="bg-white dark:bg-neutral-700 shadow-theme-md rounded-radius-lg p-4 sm:p-6">
          <h2 className="text-title-md font-semibold text-neutral-700 dark:text-neutral-50 flex items-center gap-2">
            <FileText className="text-brand-500" /> Documents soumis
          </h2>
          <ul className="text-theme-sm text-neutral-600 dark:text-neutral-300 mt-2 space-y-2">
            {profile.documents.map((doc, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> {doc.name} -{" "}
                <Badge
                  variant={doc.status === "SUBMITTED" ? "outline" : "solid"}
                  color={doc.status === "SUBMITTED" ? "warning" : doc.status === "APPROVED" ? "success" : "error"}
                >
                  {doc.status === "SUBMITTED" ? "Soumis" : doc.status === "APPROVED" ? "Approuvé" : "Rejeté"}
                </Badge>
              </li>
            ))}
          </ul>
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleModifyDocuments}
              variant="outline"
              className="flex items-center gap-2"
              aria-label="Modifier les documents"
            >
              Modifier les documents
              <Upload className="w-4 h-4" />
            </Button>
          </div>
        </motion.section>

        {/* Ressources utiles */}
        <motion.section variants={itemVariants} className="bg-white dark:bg-neutral-700 shadow-theme-md rounded-radius-lg p-4 sm:p-6">
          <h2 className="text-title-md font-semibold text-neutral-700 dark:text-neutral-50 flex items-center gap-2">
            <Info className="text-brand-500" /> Ressources utiles
          </h2>
          <ul className="text-theme-sm text-neutral-600 dark:text-neutral-300 mt-2 space-y-2">
            <li>
              <a href="https://fivision.ml/faq" className="text-brand-600 hover:text-brand-700">
                FAQ sur les services consulaires
              </a>
            </li>
            <li>
              <a href="https://fivision.ml/contact" className="text-brand-600 hover:text-brand-700">
                Contacter le support consulaire
              </a>
            </li>
            <li>
              <a href="https://fivision.ml/guide" className="text-brand-600 hover:text-brand-700">
                Guide des démarches pour étudiants maliens
              </a>
            </li>
          </ul>
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleContactSupport}
              variant="outline"
              className="flex items-center gap-2"
              aria-label="Contacter le support"
            >
              Contacter le support
              <Mail className="w-4 h-4" />
            </Button>
          </div>
        </motion.section>
      </motion.div>
    </motion.div>
  );
}