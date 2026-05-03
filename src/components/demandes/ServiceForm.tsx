import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import StepIndicator from "./StepIndicator";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Label from "../form/Label";
import Textarea from "../form/input/TextArea";
import DatePicker from "../form/date-picker";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "../form/group-input/PhoneInput";
import { useRequests } from "../../hooks/useRequests";
import { RequestDTO } from "../../api/dto/RequestDTO";
import { DocumentDTO } from "../../api/dto/UserDTO";

interface ServiceFormProps {
  steps: string[];
  onSubmit: (data: any) => void;
  overview: {
    documents: {name: string, required: boolean, type?: string, url?: string, uploadedAt?: string}[];
    isFree: boolean;
    fees: string;
    delay: string;
    extraInfo?: string;
  };
}

interface FormData {
  nom?: string;
  dateNaissance?: string;
  nationalite?: string;
  commentaire?: string;
  paymentMethod?: string;
  cardNumber?: string;
  cardHolder?: string;
  cardExpiry?: string;
  cardCvv?: string;
  mobileNumber?: string;
  [key: string]: any;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function ServiceForm({ steps, onSubmit, overview }: ServiceFormProps) {

  const { createRequest, loading } = useRequests();

  const handleSubmitRequest = async () => {
    try {
      const documents: File[] = overview.documents.map(
        (_, idx) => formData[`doc_${idx}`]
      );

      const documentsDTO: DocumentDTO[] = documents.map((doc) => ({
        name: doc.name,
        type: doc.type,
        required: true,
        status: "SUBMITTED",
        uploadedAt: new Date().toISOString(),
      }));


      const payload: RequestDTO = {
        type: formData.type!,
        applicantId: "",
        id: "",
        status: "SUBMITTED",
        documents:documentsDTO,
        formInfo: {
          nom: formData.nom!,
          dateNaissance: formData.dateNaissance!,
          nationalite: formData.nationalite!,
          commentaire: formData.commentaire!,
          mobileNumber: formData.mobileNumber!,
        },
        payment: {
          paymentMethod: formData.paymentMethod!,
          cardNumber: formData.cardNumber!,
          cardHolder: formData.cardHolder!,
          cardExpiry: formData.cardExpiry!,
          cardCvv: formData.cardCvv!,
          amount: formData.amount!,
        },
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      

      const res = await createRequest(payload);
      toast.success(`Demande soumise avec succès ! ID: ${res.id}`);
    } catch (err: any) {
      toast.error("Erreur lors de la soumission");
    }
  };

  // Appel dans handleNext au lieu de requestService.create directement


  
  const countries = [
    { code: "MA", label: "+212" },
    { code: "ML", label: "+223" },
    { code: "DZ", label: "+213" },
    { code: "TN", label: "+216" },
    { code: "SN", label: "+221" },
    { code: "CI", label: "+225" },
    { code: "BF", label: "+226" },
    { code: "NE", label: "+227" },
    { code: "FR", label: "+33" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateStep = () => {
    const newErrors: Partial<FormData> = {};
    switch (currentStep) {
      case 0: // Informations personnelles
        if (!formData.nom?.trim()) newErrors.nom = "Le nom complet est requis";
        if (!formData.dateNaissance) newErrors.dateNaissance = "La date de naissance est requise";
        if (!formData.nationalite) newErrors.nationalite = "La nationalité est requise";
        break;
      case 1: // Documents
        overview.documents.forEach((doc, idx) => {
          if (!formData[`doc_${idx}`]) newErrors[`doc_${idx}`] = `Le document "${doc.name}" est requis`;
        });
        break;
      case 2: // Confirmation
        break;
      case 3: // Paiement
        if (!formData.paymentMethod) newErrors.paymentMethod = "La méthode de paiement est requise";
        if (formData.paymentMethod === "carte") {
          if (!formData.cardNumber?.match(/^\d{16}$/)) newErrors.cardNumber = "Numéro de carte invalide (16 chiffres)";
          if (!formData.cardHolder?.trim()) newErrors.cardHolder = "Le nom du titulaire est requis";
          if (!formData.cardExpiry?.match(/^(0[1-9]|1[0-2])\/[0-9]{2}$/)) newErrors.cardExpiry = "Date d'expiration invalide (MM/AA)";
          if (!formData.cardCvv?.match(/^\d{3}$/)) newErrors.cardCvv = "CVV invalide (3 chiffres)";
        } else if (formData.paymentMethod === "mobile") {
          if (!formData.mobileNumber?.match(/^\d{8,12}$/)) newErrors.mobileNumber = "Numéro de téléphone invalide";
        }
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) {
      toast.error("Veuillez corriger les erreurs avant de continuer.");
      return;
    }
    
    // Skip payment step if service is free and we're on the confirmation step
    if (overview.isFree && currentStep === 2) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        handleSubmitRequest();
        toast.success("Demande soumise avec succès !");
      }, 1000);
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        handleSubmitRequest();
        toast.success("Paiement effectué et demande soumise avec succès !");
      }, 1500);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Informations personnelles
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            <motion.div variants={itemVariants}>
              <Label>Nom complet</Label>
              <Input
                placeholder="Entrez votre nom complet"
                value={formData.nom || ""}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                error={!!errors.nom}
                hint={errors.nom}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <DatePicker
                id="date-picker"
                label="Date de naissance"
                placeholder="Sélectionnez une date"
                onChange={(dateValue) => setFormData({ ...formData, dateNaissance: Array.isArray(dateValue) ? dateValue[0]?.toISOString().slice(0, 10) : (dateValue ) }) }
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Label>Nationalité</Label>
              <Select
                options={[
                  { value: "mali", label: "Mali" },
                  { value: "autre", label: "Autre" },
                ]}
                defaultValue={formData.nationalite || ""}
                onChange={(value) => setFormData({ ...formData, nationalite: value })}
                error={!!errors.nationalite}
                hint={errors.nationalite}
              />
            </motion.div>
          </motion.div>
        );

      case 1: // Téléversement documents
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            {overview.documents.map((doc, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{doc.name}</label>
                <input
                  id={`doc_${idx}`}
                  name={`doc_${idx}`}
                  title={doc.name} 
                  required={doc.required}
                  type="file"
                  className="mt-1 block w-full text-sm border border-neutral-200 dark:border-neutral-700 rounded-radius-lg p-2 bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 focus:ring-2 focus:ring-brand-500"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [`doc_${idx}`]: e.target.files?.[0] || null,
                    })
                  }
                />
                {errors[`doc_${idx}`] && (
                  <p className="text-sm text-error-500 mt-1">{errors[`doc_${idx}`]}</p>
                )}
              </motion.div>
            ))}
          </motion.div>
        );

      case 2: // Confirmation
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            <p className="text-theme-sm text-neutral-600 dark:text-neutral-300">
              Veuillez vérifier vos informations avant de passer au paiement. Le délai estimé pour ce service est de{" "}
              <strong>{overview.delay}</strong>.
            </p>
            <motion.div variants={itemVariants} className="space-y-2">
              <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">Récapitulatif</h3>
              <ul className="text-theme-sm text-neutral-600 dark:text-neutral-300 space-y-1">
                <li><strong>Nom :</strong> {formData.nom || "Non renseigné"}</li>
                <li><strong>Date de naissance :</strong> {formData.dateNaissance || "Non renseignée"}</li>
                <li><strong>Nationalité :</strong> {formData.nationalite || "Non renseignée"}</li>
                <li>
                  <strong>Documents :</strong>{" "}
                  {overview.documents
                    .map((doc, idx) => formData[`doc_${idx}`]?.name || "Non téléversé")
                    .join(", ")}
                </li>
              </ul>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Label>Commentaires supplémentaires</Label>
              <Textarea
                placeholder="Ajoutez des précisions..."
                value={formData.commentaire || ""}
                onChange={(value) => setFormData({ ...formData, commentaire: value })}
              />
            </motion.div>
          </motion.div>
        );

      case 3: // Paiement
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            <p className="text-theme-sm text-neutral-600 dark:text-neutral-300">
              Frais de traitement : <strong>{overview.fees}</strong>
            </p>
            <motion.div variants={itemVariants}>
              <Label>Méthode de paiement</Label>
              <Select
                options={[
                  { value: "", label: "Sélectionner" },
                  { value: "carte", label: "Carte bancaire" },
                  { value: "mobile", label: "Mobile Money (Orange Money, M-Pesa)" },
                  { value: "espece", label: "Paiement en espèces" },
                ]}
                defaultValue={formData.paymentMethod || ""}
                onChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                error={!!errors.paymentMethod}
                hint={errors.paymentMethod}
              />
            </motion.div>
            {formData.paymentMethod === "carte" && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 grid sm:grid-cols-2 gap-4">
                <motion.div variants={itemVariants}>
                  <Label>Numéro de carte</Label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber || ""}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                    error={!!errors.cardNumber}
                    hint={errors.cardNumber}
                    max="16"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Label>Nom du titulaire</Label>
                  <Input
                    placeholder="Nom sur la carte"
                    value={formData.cardHolder || ""}
                    onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value })}
                    error={!!errors.cardHolder}
                    hint={errors.cardHolder}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Label>Date d'expiration</Label>
                  <Input
                    placeholder="MM/AA"
                    value={formData.cardExpiry || ""}
                    onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                    error={!!errors.cardExpiry}
                    hint={errors.cardExpiry}
                    max="5"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Label>CVV</Label>
                  <Input
                    placeholder="123"
                    value={formData.cardCvv || ""}
                    onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                    error={!!errors.cardCvv}
                    hint={errors.cardCvv}
                    max="3"
                  />
                </motion.div>
              </motion.div>
            )}
            {formData.paymentMethod === "mobile" && (
              <motion.div variants={itemVariants}>
                <Label>Numéro de téléphone</Label>
                <PhoneInput
                selectPosition="start"
                countries={countries}
                placeholder="+212 612 345 678"
                onChange={(phoneNumber) => setFormData({ ...formData, mobileNumber: phoneNumber })}
              />
              </motion.div>
            )}
            {formData.paymentMethod === "espece" && (
              <motion.div variants={itemVariants} className="text-theme-sm text-neutral-600 dark:text-neutral-300">
                <p>Veuillez effectuer le paiement en espèces au guichet le plus proche.</p>
                <p className="mt-2">Montant : <strong>{overview.fees}</strong></p>
              </motion.div>
            )}
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
      className="bg-neutral-50 dark:bg-neutral-800 shadow-theme-md rounded-radius-lg p-4 sm:p-6 space-y-6 font-outfit animate-fade-in"
      aria-labelledby="service-form-title"
    >
      <ToastContainer />
      <h2 id="service-form-title" className="text-title-md font-heading font-bold text-neutral-700 dark:text-neutral-50">
        Formulaire de demande
      </h2>
      <StepIndicator steps={steps} currentStep={currentStep} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <Button
          onClick={handlePrev}
          variant="outline"
          disabled={currentStep === 0}
          className="flex items-center gap-2"
          aria-label="Étape précédente"
        >
          <ArrowLeft className="w-4 h-4" /> Précédent
        </Button>
        <Button
          onClick={handleNext}
          variant="primary"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white"
          disabled={isLoading}
          aria-label={currentStep < steps.length - 1 ? "Étape suivante" : "Soumettre"}
        >
          {isLoading ? (
            <span className="animate-pulse">Traitement...</span>
          ) : (
            <>
              {currentStep < steps.length - 1 ? "Suivant" : overview.isFree ? "Soumettre" : "Payer et soumettre"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
