import { useState, useEffect } from 'react';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import TextArea from "../form/input/TextArea";
import Select from "../form/Select";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../lib/services";
import type { FullUserProfile } from "../../lib/types";
import Loader, { ButtonLoader} from "../ui/loader/Loader";
import { toast } from "react-toastify";
import DatePicker from '../form/date-picker';

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    bio: "",
    birthDate: ""
  });

  const [userProfile, setUserProfile] = useState<FullUserProfile | null>(null);

  // Charger les données utilisateur
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        setIsLoading(true);
        try {
          const userProfile = await userService.getProfile(user.id);
          setUserProfile(userProfile);
        } catch (error) {
          console.error("Erreur lors du chargement du profil:", error);
          toast.error("Erreur lors du chargement des informations");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUserData();
  }, [user?.id]);


  // Recharger les données quand le modal s'ouvre pour avoir les dernières infos
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id && isOpen) {
        setIsLoading(true);
        try {
          const userProfile = await userService.getProfile(user.id);
          setFormData({
            firstName: userProfile.personalInfo.firstName || "",
            lastName: userProfile.personalInfo.lastName || "",
            gender: userProfile.personalInfo.gender || "",
            bio: userProfile.personalInfo.bio || "",
            birthDate: userProfile.personalInfo.birthDate || ""
          });
        } catch (error) {
          console.error("Erreur lors du chargement du profil:", error);
          toast.error("Erreur lors du chargement des informations");
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadUserData();
  }, [isOpen, user]);



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
      const updatedPersonalInfo = await userService.updatePersonalInfo(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        bio: formData.bio,
        birthDate: formData.birthDate,
      });

      setUserProfile((prev) => (prev ? { ...prev, personalInfo: { ...prev.personalInfo, ...updatedPersonalInfo } } : prev));

      toast.success("Informations personnelles mises à jour avec succès !");
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
          <Loader size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Informations personnelles
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Prénom
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userProfile?.personalInfo.firstName || "Non renseigné"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Nom
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userProfile?.personalInfo.lastName || "Non renseigné"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.email || "Non renseigné"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Genre
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userProfile?.personalInfo.gender === "MALE" ? "Homme" : 
                 userProfile?.personalInfo.gender === "FEMALE" ? "Femme" : "Non renseigné"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Téléphone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userProfile?.personalInfo.phone || "Non renseigné"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Bio
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userProfile?.personalInfo.bio || "Aucune bio"}
              </p>
            </div>

            {userProfile?.personalInfo.birthDate && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Date de naissance
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {new Date(userProfile?.personalInfo.birthDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Editer
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Editer les informations personnelles
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Mettez à jour vos détails pour garder votre profil à jour.
            </p>
          </div>
          
          <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Informations personnelles
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Prénom *</Label>
                    <Input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Nom *</Label>
                    <Input 
                      type="text" 
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                   <DatePicker
                   id="birthDate"
                   label="Date de naissance"
                   defaultDate={formData.birthDate}
                   onChange={(value) => handleInputChange('birthDate', value[0].toISOString())}
                   />
                  </div>
                  
                  <div className="col-span-2">
                    <Label>Genre *</Label>
                    <Select
                      options={[
                        { value: "", label: "Sélectionnez votre genre" },
                        { value: "MALE", label: "Homme" },
                        { value: "FEMALE", label: "Femme" },
                      ]}
                      defaultValue={formData.gender}
                      onChange={(value) => handleInputChange('gender', value)}
                    />
                  </div> 
                   
                  <div className="col-span-2">
                    <Label>Bio</Label>
                    <TextArea 
                      value={formData.bio}
                      onChange={(value) => handleInputChange('bio', value)}
                      rows={3}
                      placeholder="Décrivez-vous en quelques mots..."
                    />
                  </div>
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
                disabled={isSaving || !formData.firstName || !formData.lastName || !formData.gender}
              >
                {isSaving ? (
                  <>
                    <ButtonLoader />
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