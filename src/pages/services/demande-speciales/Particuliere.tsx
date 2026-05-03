import React, { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Textarea from "../../../components/form/input/TextArea";
import StepIndicator from "../../../components/demandes/StepIndicator";

export default function DemandeParticuliere() {
  const steps = [
    "Informations personnelles",
    "Description de la demande",
    "Téléversement documents",
    "Confirmation et soumission"
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handlePrev = () => setCurrentStep((prev) => prev - 1);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <Input
              placeholder="Nom complet"
              value={formData.nom || ""}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            />
            <Input
              placeholder="Email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Décrivez en détail votre demande"
              value={formData.description || ""}
              onChange={(value) => setFormData({ ...formData, description: value })}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <label className="text-sm font-medium">Joindre des documents (optionnel)</label>
            <input
              id="documents"
              title="documents"
              type="file"
              multiple
              className="mt-1 block w-full text-sm border rounded-md p-2"
              onChange={(e) =>
                setFormData({ ...formData, fichiers: e.target.files })
              }
            />
          </div>
        );

      case 3:
        return (
          <p className="text-sm">
            Merci de vérifier vos informations avant soumission.
          </p>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <PageMeta
        title="Demande Particulière"
        description="Formulez librement votre demande personnalisée."
      />
      <PageBreadcrumb pageTitle="Demande Particulière" />

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6 space-y-4">
        <StepIndicator steps={steps} currentStep={currentStep} />
        <div>{renderStepContent()}</div>

        <div className="flex justify-between mt-6">
          <Button onClick={handlePrev} variant="outline" disabled={currentStep === 0}>
            Précédent
          </Button>
          <Button onClick={handleNext}>
            {currentStep < steps.length  - 1 ? "Suivant" : "Soumettre"}
          </Button>
        </div>
      </div>
    </>
  );
}
