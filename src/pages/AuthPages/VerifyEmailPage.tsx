import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../lib/services";

const RESEND_DELAY_SECONDS = 60;

/**
 * Étape obligatoire pour un compte enrôlé sur place — voir
 * routes/RequireAuth.tsx's RequireOnboarded, qui redirige ici tant que
 * user.emailVerified est faux. Le code a été envoyé à l'enrôlement ; « Renvoyer
 * le code » en génère un nouveau (l'ancien est alors invalidé côté serveur).
 */
export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(
    "Un code à 6 chiffres vous a été envoyé par email lors de la création de votre compte."
  );
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Rien à faire ici pour un compte déjà en règle — RequireOnboarded décide de la suite.
  if (user && user.emailVerified) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) return;
    if (!/^\d{6}$/.test(otp.trim())) return setError("Saisissez le code à 6 chiffres reçu par email.");

    setBusy(true);
    try {
      await userService.verifyEmail(user.id, otp.trim());
      await refreshUser();
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error || "Code invalide ou expiré.");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!user || cooldown > 0) return;
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      await userService.resendVerification(user.id);
      setCooldown(RESEND_DELAY_SECONDS);
      setInfo("Un nouveau code vient de vous être envoyé.");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Le code n'a pas pu être renvoyé.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/signin");
    }
  };

  return (
    <>
      <PageMeta title="Confirmez votre email" description="Saisissez le code reçu par email pour activer votre compte." />
      <AuthLayout>
        <div className="flex flex-col flex-1">
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Confirmez votre email
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email ? <>Code envoyé à <strong>{user.email}</strong>.</> : "Saisissez le code reçu par email."}
              </p>
            </div>

            {error && (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </p>
            )}
            {info && !error && (
              <p className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300">
                {info}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>
                  Code à 6 chiffres <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="123456"
                  value={otp}
                  maxLength={6}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                />
              </div>
              <Button className="w-full" size="sm" type="submit" disabled={busy}>
                {busy ? "Vérification..." : "Confirmer"}
              </Button>
              <button
                type="button"
                onClick={resend}
                disabled={busy || cooldown > 0}
                className="w-full text-sm text-brand-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                {cooldown > 0 ? `Renvoyer le code dans ${cooldown} s` : "Renvoyer le code"}
              </button>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                <button type="button" onClick={handleLogout} className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                  Se déconnecter
                </button>
              </p>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
