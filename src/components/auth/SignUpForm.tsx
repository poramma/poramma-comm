import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import { EyeClosed, EyeIcon } from "lucide-react";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [errorFirstName, setErrorFirstName] = useState<string | null>(null);
  const [errorLastName, setErrorLastName] = useState<string | null>(null);
  const [errorOtp, setErrorOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailOrPhone: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useAuth();

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorEmail(null);
    setErrorPassword(null);
    setErrorFirstName(null);
    setErrorLastName(null);
    setError(null);

    const data = new FormData(e.currentTarget as HTMLFormElement);
    const email = (data.get("email") as string)?.trim();
    const password = (data.get("password") as string)?.trim();
    const firstName = data.get("firstName") as string;
    const lastName = data.get("lastName") as string;
    const emailOrPhone = data.get("emailOrPhone") as string;

    // ✅ Validation frontend
    if (!firstName || !lastName) {
      if (!firstName)
        setErrorFirstName("Veuillez renseigner votre prénom.");
      if (!lastName)
        setErrorLastName("Veuillez renseigner votre nom.");
      return;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorEmail("Email invalide.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorPassword("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    try {
      setLoading(true);
      await sendOtp(email); // Envoi OTP backend
      setFormData({ email, password, firstName, lastName, emailOrPhone });
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l’envoi de l’OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorOtp(null);

    if (!otp || otp.length !== 6) {
      setErrorOtp("Veuillez entrer un code OTP valide (6 chiffres).");
      return;
    }

    try {
      setLoading(true);
      // verifyOtp crée le compte côté backend (voir AuthContext) — pas
      // d'appel register() séparé, qui créerait un doublon en conflit.
      await verifyOtp({ ...formData, otp });
      alert("Compte créé avec succès 🎉");
      navigate("/signin");
    } catch (err: any) {
      setErrorOtp(err.response?.data?.message || "Code OTP invalide.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full lg:w-1/2">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        {step === "form" && (
          <>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 dark:text-white/90 text-title-md">
                Créer un compte
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Remplissez le formulaire pour créer votre compte
              </p>
            </div>
            <form onSubmit={handleSubmitForm} className="space-y-5">
              <div>
                <Label>Prénom<span className="text-error-500">*</span></Label>
                <Input
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={e => {
                    setFormData({...formData, firstName: e.target.value})
                    setErrorFirstName(null);
                  }} />
                  {errorFirstName && <p className="text-red-500 mt-2">{errorFirstName}</p>}
              </div>
              <div>
                <Label>Nom<span className="text-error-500">*</span></Label>
                <Input
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={e => {
                    setFormData({...formData, lastName: e.target.value})
                    setErrorLastName(null);
                  }} />
                  {errorLastName && <p className="text-red-500 mt-2">{errorLastName}</p>}
              </div>
              
              <div>
                <Label>Email<span className="text-error-500">*</span></Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={e => {
                    setFormData({...formData, email: e.target.value})
                    setErrorEmail(null);
                  }} />
                {errorEmail && <p className="text-red-500 mt-2">{errorEmail}</p>}
              </div>
              <div>
                <Label>Mot de passe<span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={e => {
                      setFormData({...formData, password: e.target.value})
                      setErrorPassword(null);
                    }} />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? <EyeIcon /> : <EyeClosed />}
                  </span>
                </div>
                {errorPassword && <p className="text-red-500 mt-2">{errorPassword}</p>}
              </div>
              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <p className="text-gray-500 dark:text-gray-400">
                  J'accepte les{" "}
                  <Link to="/conditions-utilisation" target="_blank" className="text-gray-800 underline dark:text-white">
                    conditions d'utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link to="/politique-confidentialite" target="_blank" className="text-gray-800 underline dark:text-white">
                    politique de confidentialité
                  </Link>
                </p>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              <Button className="w-full" type="submit" disabled={!isChecked || loading}>{loading ? "Envoi en cours..." : "Envoyer le code OTP"}</Button>

            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="mb-5">
              <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                Vérification OTP
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Un code a été envoyé à <b>{formData.email}</b>. Entrez-le ci-dessous.
              </p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <Label>Code OTP</Label>
                <Input
                  name="otp"
                  value={otp}
                  onChange={e => {
                    setOtp(e.target.value);
                    setErrorOtp(null);
                  }}
                   placeholder="Ex: 123456"
                   type="number"
                   className="w-full"
                   maxLength={6}
                   minLength={6}
                   />
              </div>
              {errorOtp && <p className="text-red-500 mt-2">{errorOtp}</p>}
              <Button className="w-full" type="submit">{loading ? "Vérification en cours..." : "Vérifier et créer mon compte"}</Button>

            </form>
          </>
        )}

        <div className="mt-5 text-sm text-center text-gray-700 dark:text-gray-400">
          J'ai déjà un compte ?{" "}
          <Link to="/signin" className="text-brand-500 hover:text-brand-600">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
