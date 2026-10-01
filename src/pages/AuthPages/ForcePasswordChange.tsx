import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../lib/services";

function passwordProblem(pwd: string): string | null {
  if (pwd.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (!/[A-Za-z]/.test(pwd)) return "Le mot de passe doit contenir au moins une lettre.";
  if (!/\d/.test(pwd)) return "Le mot de passe doit contenir au moins un chiffre.";
  return null;
}

/**
 * Étape obligatoire pour un compte enrôlé sur place (mot de passe par
 * défaut) — voir routes/RequireAuth.tsx's RequireOnboarded, qui redirige ici
 * tant que user.mustChangePassword est vrai. Le mot de passe « actuel »
 * demandé ici est justement ce mot de passe par défaut, communiqué à
 * l'étudiant par l'agent et par email.
 */
export default function ForcePasswordChange() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rien à faire ici pour un compte déjà en règle — RequireOnboarded décide de la suite.
  if (user && !user.mustChangePassword) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!currentPassword) return setError("Saisissez le mot de passe par défaut reçu à l'ambassade.");
    const problem = passwordProblem(newPassword);
    if (problem) return setError(problem);
    if (newPassword !== confirm) return setError("Les deux nouveaux mots de passe ne correspondent pas.");
    if (newPassword === currentPassword) return setError("Choisissez un mot de passe différent du mot de passe par défaut.");

    setBusy(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      await refreshUser();
      // RequireOnboarded réévalue depuis /dashboard : email pas encore confirmé → /verifier-email, sinon le tableau de bord.
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const status = err?.response?.status;
      setError(status === 401 ? "Mot de passe par défaut incorrect." : err?.response?.data?.message || "Le mot de passe n'a pas pu être modifié.");
    } finally {
      setBusy(false);
    }
  };

  const eye = (
    <span onClick={() => setShowPasswords(!showPasswords)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
      {showPasswords ? <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" /> : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />}
    </span>
  );

  return (
    <>
      <PageMeta title="Choisissez votre mot de passe" description="Première connexion : remplacez le mot de passe par défaut." />
      <AuthLayout>
        <div className="flex flex-col flex-1">
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Choisissez votre mot de passe
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Votre compte a été créé à l'ambassade avec un mot de passe par défaut. Remplacez-le avant de continuer.
              </p>
            </div>

            {error && (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>
                  Mot de passe par défaut <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  {eye}
                </div>
              </div>
              <div>
                <Label>
                  Nouveau mot de passe <span className="text-error-500">*</span>
                </Label>
                <Input
                  type={showPasswords ? "text" : "password"}
                  placeholder="8 caractères minimum, lettres et chiffres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>
                  Confirmer le nouveau mot de passe <span className="text-error-500">*</span>
                </Label>
                <Input
                  type={showPasswords ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <Button className="w-full" size="sm" type="submit" disabled={busy}>
                {busy ? "Enregistrement..." : "Continuer"}
              </Button>
            </form>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
