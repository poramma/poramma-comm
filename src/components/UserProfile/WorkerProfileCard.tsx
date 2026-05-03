import { useState, useEffect } from 'react';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../api/services/userService";
import { updateWorkerProfileDto } from "../../api/dto/UserDTO";
import Loader from "../ui/loader/Loader";
import { toast } from "react-toastify";

export default function WorkerProfileCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user, updateUserWorkerProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    employer: "",
    profession: "",
    contractType: "",
    familyRelation: "",
    mainApplicantINUE: ""
  });

  const contractTypes = [
    "CDI",
    "CDD", 
    "Stage",
    "Freelance",
    "Interim",
    "Autre"
  ];

  const familyRelations = [
    "Conjoint(e)",
    "Enfant", 
    "Parent",
    "Frère/Sœur",
    "Autre"
  ];

  // Charger les données travailleur dès le montage
  useEffect(() => {
    const loadWorkerData = async () => {
      if (user?.id) {
        setIsLoading(true);
        try {
          const profile = await userService.getUserProfile(user.id);
          setUserProfile(profile);
          setFormData({
            employer: profile.workerProfile?.employer || "",
            profession: profile.workerProfile?.profession || "",
            contractType: profile.workerProfile?.contractType || "",
            familyRelation: profile.workerProfile?.familyRelation || "",
            mainApplicantINUE: profile.workerProfile?.mainApplicantINUE || ""
          });
        } catch (error) {
          console.error("Erreur lors du chargement du profil travailleur:", error);
          toast.error("Erreur lors du chargement des informations professionnelles");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadWorkerData();
  }, [user?.id]);

  // Recharger les données quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && userProfile) {
      setFormData({
        employer: userProfile.workerProfile?.employer || "",
        profession: userProfile.workerProfile?.profession || "",
        contractType: userProfile.workerProfile?.contractType || "",
        familyRelation: userProfile.workerProfile?.familyRelation || "",
        mainApplicantINUE: userProfile.workerProfile?.mainApplicantINUE || ""
      });
    }
  }, [isOpen, userProfile]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const payload: updateWorkerProfileDto = {
        employer: formData.employer,
        profession: formData.profession,
        contractType: formData.contractType,
        ...(formData.familyRelation && {
          familyRelation: formData.familyRelation,
          mainApplicantINUE: formData.mainApplicantINUE
        })
      };

      const updatedProfile = await userService.updateWorkerProfile(payload, user.id);
      
      updateUserWorkerProfile(updatedProfile);
      setUserProfile(updatedProfile);
      
      toast.success("Profil professionnel mis à jour avec succès !");
      closeModal();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-center py-8">
          <Loader size="sm" text="Chargement du profil professionnel..." />
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas travailleur, ne pas afficher le composant
  

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Informations professionnelles
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Employeur
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userProfile?.workerProfile?.employer || "Non renseigné"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Profession
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userProfile?.workerProfile?.profession || "Non renseigné"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Type de contrat
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userProfile?.workerProfile?.contractType || "Non renseigné"}
              </p>
            </div>

            {userProfile?.workerProfile?.familyRelation && (
              <>
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Lien familial
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {userProfile.workerProfile.familyRelation}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    INUE du membre principal
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {userProfile.workerProfile.mainApplicantINUE || "Non renseigné"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill=""/>
          </svg>
          Editer
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Editer le profil professionnel
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Mettez à jour vos informations professionnelles.
            </p>
          </div>
          
          <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Informations professionnelles
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Employeur</Label>
                    <Input 
                      type="text" 
                      value={formData.employer}
                      onChange={(e) => handleInputChange('employer', e.target.value)}
                      placeholder="Nom de votre employeur"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Profession</Label>
                    <Input 
                      type="text" 
                      value={formData.profession}
                      onChange={(e) => handleInputChange('profession', e.target.value)}
                      placeholder="Votre profession"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Type de contrat</Label>
                    <Select
                      options={contractTypes.map(type => ({ value: type, label: type }))}
                      defaultValue={formData.contractType}
                      onChange={(value) => handleInputChange('contractType', value)}
                      placeholder="Sélectionnez votre type de contrat"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Lien familial (optionnel)</Label>
                    <Select
                      options={[{ value: "", label: "Aucun" }, ...familyRelations.map(rel => ({ value: rel, label: rel }))]}
                      defaultValue={formData.familyRelation}
                      onChange={(value) => handleInputChange('familyRelation', value)}
                      placeholder="Si vous êtes un membre de famille"
                    />
                  </div>

                  {formData.familyRelation && (
                    <div className="col-span-2">
                      <Label>INUE du membre principal</Label>
                      <Input 
                        type="text" 
                        value={formData.mainApplicantINUE}
                        onChange={(e) => handleInputChange('mainApplicantINUE', e.target.value)}
                        placeholder="INUE de la personne principale"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={closeModal}
                type="button"
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button 
                size="sm" 
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}