import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import { emailError } from "../../lib/email";
import { STAFF_HOME, homePathFor, isCommunityStaff } from "../../lib/communityAccess";
import type { AuthUser } from "../../lib/types";
import { useGoogleClientId } from "../../hooks/useGoogleClientId";
import GoogleButton from "./GoogleButton";


export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string; hint?: boolean }>({});
  // Champ déjà quitté une fois (blur) : au-delà, l'email se revalide à
  // chaque frappe, pas la peine d'attendre la soumission.
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const { clientId: googleClientId } = useGoogleClientId();
  const [googleBusy, setGoogleBusy] = useState(false);

  const validateEmail = (value: string) => emailError(value, true);
  const validatePassword = (value: string) => (!value.trim() ? "Le mot de passe est requis." : value.length < 6 ? "Le mot de passe doit contenir au moins 6 caractères." : null);

  /** Retour là où l'usager voulait aller (ex. un service cliqué depuis l'accueil), sinon son tableau de bord.
   *  Le personnel de la communauté n'a ni dossier ni INUE : il n'est renvoyé que vers /admin/*, sinon /admin. */
  const goAfterLogin = (loggedIn: AuthUser) => {
    const from = (location.state as { from?: string } | null)?.from;
    const wanted = from && from.startsWith("/") ? from : null;
    if (isCommunityStaff(loggedIn)) {
      navigate(wanted && wanted.startsWith("/admin") ? wanted : STAFF_HOME);
    } else {
      navigate(wanted ?? homePathFor(loggedIn));
    }
  };

  const handleGoogle = async (credential: string) => {
    setErrors({});
    try {
      setGoogleBusy(true);
      const { user } = await loginWithGoogle(credential, isChecked);
      goAfterLogin(user);
    } catch (err: any) {
      setErrors({ form: err.response?.data?.message || "La connexion avec Google a échoué. Réessayez." });
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailMsg = validateEmail(email);
    const passwordMsg = validatePassword(password);
    setErrors({ email: emailMsg ?? undefined, password: passwordMsg ?? undefined });
    setEmailTouched(true);
    if (emailMsg || passwordMsg) return;

    try {
      setLoading(true);
      const loggedIn = await login(email.trim(), password, isChecked);
      goAfterLogin(loggedIn);
    } catch (err: any) {
      setErrors({ form: err.response?.data?.message || "Email ou mot de passe incorrect", hint: true });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Se connecter
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Entrer vos identifiants pour accéder à votre compte
            </p>
          </div>
          <div>
            {googleClientId && (
              <>
                <GoogleButton clientId={googleClientId} text="signin_with" onCredential={handleGoogle} busy={googleBusy || loading} />
                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">Ou avec votre email</span>
                  </div>
                </div>
              </>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {errors.form && (
                  <div role="alert" className="text-red-500">
                    <p>{errors.form}</p>
                    {googleClientId && errors.hint && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Inscrit avec Google ? Utilisez le bouton « Se connecter avec Google » ci-dessus.</p>}
                  </div>
                )}
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    required
                    value={email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEmail(value);
                      setErrors((err) => ({ ...err, form: undefined, email: emailTouched ? validateEmail(value) ?? undefined : err.email }));
                    }}
                    onBlur={() => {
                      setEmailTouched(true);
                      setErrors((err) => ({ ...err, email: validateEmail(email) ?? undefined }));
                    }}
                    error={!!errors.email}
                    hint={errors.email}
                  />
                </div>
                <div>
                  <Label>
                    Mot de passe <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Votre mot de passe"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((err) => ({ ...err, form: undefined, password: undefined }));
                      }}
                      error={!!errors.password}
                      hint={errors.password}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Rester connecté
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    mot de passe oublié?
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm" type="submit">
                    {loading ? "Connexion en cours..." : "Se connecter"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                j&apos;ai pas un compte? {""}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Créer un compte
                </Link>
              </p>
              <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center sm:text-start">
                En vous connectant, vous acceptez nos{" "}
                <Link to="/conditions-utilisation" className="underline hover:text-brand-600">
                  conditions d&apos;utilisation
                </Link>{" "}
                et notre{" "}
                <Link to="/politique-confidentialite" className="underline hover:text-brand-600">
                  politique de confidentialité
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
