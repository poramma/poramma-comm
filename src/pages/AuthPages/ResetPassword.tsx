import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import { authService } from "../../lib/services";

const RESEND_DELAY_SECONDS = 60;

function passwordProblem(pwd: string): string | null {
  if (pwd.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (!/[A-Za-z]/.test(pwd)) return "Le mot de passe doit contenir au moins une lettre.";
  if (!/\d/.test(pwd)) return "Le mot de passe doit contenir au moins un chiffre.";
  return null;
}

/**
 * « Mot de passe oublié » en deux étapes :
 *  1. l'email → un code à 6 chiffres est envoyé (réponse identique que le compte existe ou non) ;
 *  2. le code + le nouveau mot de passe → toutes les sessions sont fermées, retour à la connexion.
 */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "code" | "done">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const requestCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setInfo(null);
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }
    setBusy(true);
    try {
      await authService.forgotPassword(email.trim());
      setStep("code");
      setCooldown(RESEND_DELAY_SECONDS);
      setInfo("Si un compte correspond à cette adresse, un code à 6 chiffres vient de lui être envoyé. Il est valable 15 minutes.");
    } catch (err: any) {
      setError(err.response?.data?.message || "La demande n'a pas pu être envoyée. Réessayez.");
    } finally {
      setBusy(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!/^\d{6}$/.test(otp.trim())) return setError("Saisissez le code à 6 chiffres reçu par email.");
    const problem = passwordProblem(password);
    if (problem) return setError(problem);
    if (password !== confirm) return setError("Les deux mots de passe ne correspondent pas.");

    setBusy(true);
    try {
      await authService.resetPassword({ email: email.trim(), otp: otp.trim(), newPassword: password });
      setStep("done");
    } catch (err: any) {
      setError(err.response?.data?.message || "Code invalide ou expiré.");
    } finally {
      setBusy(false);
    }
  };

  const eye = (
    <span onClick={() => setShowPassword(!showPassword)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
      {showPassword ? <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" /> : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />}
    </span>
  );

  return (
    <>
      <PageMeta title="Mot de passe oublié" description="Réinitialisation du mot de passe" />
      <AuthLayout>
        <div className="flex flex-col flex-1">
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Mot de passe oublié</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {step === "email" && "Saisissez votre adresse email : nous vous envoyons un code de vérification."}
                {step === "code" && "Saisissez le code reçu par email puis choisissez un nouveau mot de passe."}
                {step === "done" && "Votre mot de passe a été modifié."}
              </p>
            </div>

            {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">{error}</p>}
            {info && !error && <p className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300">{info}</p>}

            {step === "email" && (
              <form onSubmit={requestCode} className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input type="email" placeholder="info@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button className="w-full" size="sm" type="submit" disabled={busy}>
                  {busy ? "Envoi en cours..." : "Recevoir le code"}
                </Button>
              </form>
            )}

            {step === "code" && (
              <form onSubmit={submitReset} className="space-y-6">
                <div>
                  <Label>
                    Code à 6 chiffres <span className="text-error-500">*</span>
                  </Label>
                  <Input placeholder="123456" value={otp} maxLength={6} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} required />
                </div>
                <div>
                  <Label>
                    Nouveau mot de passe <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} placeholder="8 caractères minimum, lettres et chiffres" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    {eye}
                  </div>
                </div>
                <div>
                  <Label>
                    Confirmer le mot de passe <span className="text-error-500">*</span>
                  </Label>
                  <Input type={showPassword ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                </div>
                <Button className="w-full" size="sm" type="submit" disabled={busy}>
                  {busy ? "Enregistrement..." : "Réinitialiser le mot de passe"}
                </Button>
                <button
                  type="button"
                  onClick={() => requestCode()}
                  disabled={busy || cooldown > 0}
                  className="w-full text-sm text-brand-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  {cooldown > 0 ? `Renvoyer le code dans ${cooldown} s` : "Renvoyer le code"}
                </button>
              </form>
            )}

            {step === "done" && (
              <div className="space-y-4">
                <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300">
                  Pour votre sécurité, vous avez été déconnecté de tous vos appareils. Connectez-vous avec votre nouveau mot de passe.
                </p>
                <Button className="w-full" size="sm" onClick={() => navigate("/signin")}>
                  Se connecter
                </Button>
              </div>
            )}

            {step !== "done" && (
              <div className="mt-5">
                <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                  <Link to="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                    Retour à la connexion
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
