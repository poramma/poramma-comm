import { useState, useEffect } from 'react';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../lib/services";
import type { FullUserProfile } from "../../lib/types";
import Loader from "../ui/loader/Loader";
import { toast } from "react-toastify";

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    country: "",
    zipCode: ""
  });
  const [userProfile, setUserProfile] = useState<FullUserProfile | null>(null);

// Dans UserAddressCard - même principe
useEffect(() => {
  const loadAddressData = async () => {
    if (user?.id) {
      setIsLoading(true);
      try {
        const profile = await userService.getProfile(user.id);
        setUserProfile(profile);
        setFormData({
          address: profile.address?.address || "",
          city: profile.address?.city || "",
          country: profile.address?.country || "",
          zipCode: profile.address?.zipCode || ""
        });
      } catch (error) {
        console.error("Erreur lors du chargement de l'adresse:", error);
        toast.error("Erreur lors du chargement de l'adresse");
      } finally {
        setIsLoading(false);
      }
    }
  };

  loadAddressData(); // Chargement immédiat
}, [user?.id]);


  // Charger les données d'adresse
  useEffect(() => {
    const loadAddressData = async () => {
      if (user?.id) {
        setIsLoading(true);
        try {
          const profile = await userService.getProfile(user.id);
          setFormData({
            address: profile.address?.address || "",
            city: profile.address?.city || "",
            country: profile.address?.country || "",
            zipCode: profile.address?.zipCode || ""
          });
        } catch (error) {
          console.error("Erreur lors du chargement de l'adresse:", error);
          toast.error("Erreur lors du chargement de l'adresse");
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (isOpen) {
      loadAddressData();
    }
  }, [isOpen, user?.id]);

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
      const updatedAddress = await userService.updateAddress(user.id, {
        address: formData.address,
        city: formData.city,
        country: formData.country,
        zipCode: formData.zipCode,
      });

      setUserProfile((prev) => (prev ? { ...prev, address: { ...prev.address, ...updatedAddress } } : prev));

      toast.success("Adresse mise à jour avec succès !");
      closeModal();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'adresse:", error);
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
            Adresse
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Pays
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userProfile?.address?.country || "Non renseigné"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Ville
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userProfile?.address?.city || "Non renseigné"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Code postal
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userProfile?.address?.zipCode || "Non renseigné"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Adresse complète
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userProfile?.address?.address || "Non renseigné"}
              </p>
            </div>
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
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Editer l'adresse
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Mettez à jour votre adresse pour garder votre profil à jour.
            </p>
          </div>
          
          <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Pays *</Label>
                  <Input 
                    type="text" 
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Ex: Maroc"
                    required
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Ville *</Label>
                  <Input 
                    type="text" 
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Ex: Rabat"
                    required
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Code postal</Label>
                  <Input 
                    type="text" 
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="Ex: 10000"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Adresse complète *</Label>
                  <Input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Ex: 123 Avenue Mohammed V, Quartier Hassan"
                    required
                  />
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
                disabled={isSaving || !formData.country || !formData.city || !formData.address}
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