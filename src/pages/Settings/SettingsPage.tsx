import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Bell, KeyRound, Link2, LogOut, Moon, ScrollText, Sun, UserRound } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import { useAuth } from "../../context/AuthContext";
import { useRegistration } from "../../context/RegistrationContext";
import { useTheme } from "../../context/ThemeContext";
import { authService, userService } from "../../lib/services";
import { useGoogleClientId } from "../../hooks/useGoogleClientId";
import GoogleButton from "../../components/auth/GoogleButton";

const TYPE_LABELS: Record<string, string> = {
  student: "Étudiant(e)",
  worker: "Travailleur(se)",
  migrant: "Migrant(e)",
  other: "Membre de la communauté",
};

const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  VERIFIED: "Compte vérifié",
  PENDING: "En attente de vérification",
  SUSPENDED: "Suspendu",
};

function passwordProblem(pwd: string): string | null {
  if (pwd.length < 8) return "Le nouveau mot de passe doit contenir au moins 8 caractères.";
  if (!/[A-Za-z]/.test(pwd)) return "Le nouveau mot de passe doit contenir au moins une lettre.";
  if (!/\d/.test(pwd)) return "Le nouveau mot de passe doit contenir au moins un chiffre.";
  return null;
}

const card = "rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6";

function CardTitle({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-white/90">{value || "Non renseigné"}</p>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, loading, logout, refreshUser } = useAuth();
  const { clientId: googleClientId } = useGoogleClientId();
  const [googleBusy, setGoogleBusy] = useState(false);
  const { registration } = useRegistration();
  const { theme, toggleTheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace state={{ from: "/settings" }} />;

  const inue = registration?.inue ?? user.profile?.inue ?? null;
  const phone = user.phone ?? user.profile?.phone ?? "";

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (!currentPassword) return setPasswordError("Saisissez votre mot de passe actuel.");
    const problem = passwordProblem(newPassword);
    if (problem) return setPasswordError(problem);
    if (newPassword !== confirm) return setPasswordError("Les deux nouveaux mots de passe ne correspondent pas.");
    if (newPassword === currentPassword) return setPasswordError("Le nouveau mot de passe doit être différent de l'actuel.");

    setSaving(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      toast.success("Votre mot de passe a été modifié.");
    } catch (err: any) {
      const status = err?.response?.status;
      setPasswordError(status === 401 ? "Le mot de passe actuel est incorrect." : err?.response?.data?.message || "Le mot de passe n'a pas pu être modifié.");
    } finally {
      setSaving(false);
    }
  };

  // Méthodes de connexion : un compte créé avec Google n'a pas de mot de passe tant qu'on n'en définit pas un.
  const hasPassword = user.authMethods?.password ?? true;
  const googleLinked = user.authMethods?.google ?? false;

  const linkGoogle = async (credential: string) => {
    setGoogleBusy(true);
    try {
      await authService.linkGoogle(credential);
      await refreshUser();
      toast.success("Votre compte Google est lié : vous pouvez l'utiliser pour vous connecter.");
    } catch (err: any) {
      toast.error(err?.response?.data?.details?.email?.[0] || err?.response?.data?.message || "Le compte Google n'a pas pu être lié.");
    } finally {
      setGoogleBusy(false);
    }
  };

  const unlinkGoogle = async () => {
    if (!window.confirm("Dissocier votre compte Google ? Vous vous connecterez ensuite uniquement avec votre email et votre mot de passe.")) return;
    setGoogleBusy(true);
    try {
      await authService.unlinkGoogle();
      await refreshUser();
      toast.success("Votre compte Google a été dissocié.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Le compte Google n'a pas pu être dissocié.");
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/signin");
    }
  };

  const eye = (
    <span onClick={() => setShowPasswords(!showPasswords)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
      {showPasswords ? <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" /> : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />}
    </span>
  );

  return (
    <>
      <PageMeta title="Paramètres" description="Paramètres de votre compte Poramma." />
      <ToastContainer />
      <PageBreadcrumb pageTitle="Paramètres" />

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Compte */}
        <section className={card}>
          <CardTitle icon={UserRound} title="Mon compte" text="Les informations qui identifient votre compte Poramma." />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Row label="Adresse email" value={user.email} />
            <Row label="Téléphone" value={phone} />
            <Row label="Situation" value={TYPE_LABELS[user.profile?.userType ?? "other"] ?? TYPE_LABELS.other} />
            <Row label="Numéro INUE" value={inue ?? "Pas encore attribué"} />
            <Row label="État du compte" value={ACCOUNT_STATUS_LABELS[user.status] ?? "Actif"} />
          </div>
          <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
            Pour modifier votre nom, votre adresse ou vos autres informations, rendez-vous sur{" "}
            <Link to="/profile" className="font-medium text-brand-600 hover:underline dark:text-brand-300">
              votre profil
            </Link>
            . L'adresse email ne peut pas être modifiée : contactez le{" "}
            <Link to="/support" className="font-medium text-brand-600 hover:underline dark:text-brand-300">
              support
            </Link>{" "}
            si elle n'est plus valable.
          </p>
        </section>

        {/* Sécurité */}
        <section className={card}>
          <CardTitle icon={KeyRound} title="Mot de passe" text="Choisissez un mot de passe que vous n'utilisez nulle part ailleurs." />
          {!hasPassword ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Vous vous connectez avec Google : ce compte n'a pas encore de mot de passe. Vous pouvez en définir un pour vous connecter aussi avec votre email (un code de vérification est envoyé à {user.email}).
              </p>
              <Link
                to={`/reset-password?email=${encodeURIComponent(user.email)}`}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
              >
                Définir un mot de passe
              </Link>
            </div>
          ) : (
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <Label>Mot de passe actuel</Label>
              <div className="relative">
                <Input type={showPasswords ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                {eye}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Nouveau mot de passe</Label>
                <Input type={showPasswords ? "text" : "password"} placeholder="8 caractères, lettres et chiffres" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div>
                <Label>Confirmer le nouveau mot de passe</Label>
                <Input type={showPasswords ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
            </div>
            {passwordError && <p className="text-sm text-error-600 dark:text-error-400">{passwordError}</p>}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link to="/reset-password" className="text-sm text-gray-500 hover:text-brand-600 dark:text-gray-400">
                J'ai oublié mon mot de passe actuel
              </Link>
              <Button size="sm" type="submit" disabled={saving || !currentPassword || !newPassword || !confirm}>
                {saving ? "Enregistrement..." : "Modifier le mot de passe"}
              </Button>
            </div>
          </form>
          )}
        </section>

        {/* Connexion avec Google */}
        {(googleLinked || googleClientId) && (
          <section className={card}>
            <CardTitle icon={Link2} title="Connexion avec Google" text="Connectez-vous en un clic avec votre compte Google." />
            {googleLinked ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  <span className="mr-2 inline-flex rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-700 dark:bg-success-500/15 dark:text-success-500">Lié</span>
                  Votre compte Google est lié à {user.email}.
                </p>
                {!hasPassword && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pour pouvoir dissocier Google, définissez d'abord un mot de passe (section ci-dessus) : sans lui, vous ne pourriez plus accéder à votre compte.
                  </p>
                )}
                <Button size="sm" variant="outline" onClick={unlinkGoogle} disabled={googleBusy || !hasPassword}>
                  {googleBusy ? "Un instant..." : "Dissocier Google"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Liez le compte Google associé à {user.email} : vous pourrez l'utiliser pour vous connecter, en plus de votre mot de passe.
                </p>
                {googleClientId && <GoogleButton clientId={googleClientId} text="continue_with" onCredential={linkGoogle} busy={googleBusy} />}
              </div>
            )}
          </section>
        )}

        {/* Apparence */}
        <section className={card}>
          <CardTitle icon={theme === "dark" ? Moon : Sun} title="Apparence" text="Le thème est mémorisé sur cet appareil." />
          <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
            {(
              [
                { value: "light", label: "Clair", icon: Sun },
                { value: "dark", label: "Sombre", icon: Moon },
              ] as const
            ).map((option) => {
              const active = theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => !active && toggleTheme()}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
                  }`}
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Notifications */}
        <section className={card}>
          <CardTitle icon={Bell} title="Notifications" text="Comment l'ambassade vous tient informé(e)." />
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Chaque changement d'état d'une de vos demandes ou de votre dossier d'enregistrement.</li>
            <li>• La confirmation, le déplacement ou l'annulation d'un rendez-vous.</li>
            <li>• Les messages et demandes de complément d'information des agents.</li>
          </ul>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Ces alertes arrivent dans l'application et par email à <span className="font-medium text-gray-700 dark:text-gray-300">{user.email}</span>. Elles concernent le suivi de vos démarches : elles ne peuvent pas être désactivées.
          </p>
          <div className="mt-4">
            <Link to="/notifications" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-300">
              Voir mes notifications
            </Link>
          </div>
        </section>

        {/* Informations légales */}
        <section className={card}>
          <CardTitle icon={ScrollText} title="Informations légales" text="Les règles d'utilisation de Poramma et la protection de vos données." />
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/conditions-utilisation" className="font-medium text-brand-600 hover:underline dark:text-brand-300">
                Conditions d'utilisation
              </Link>
              <span className="text-gray-500 dark:text-gray-400"> — ce que vous pouvez faire sur la plateforme et vos engagements.</span>
            </li>
            <li>
              <Link to="/politique-confidentialite" className="font-medium text-brand-600 hover:underline dark:text-brand-300">
                Politique de confidentialité
              </Link>
              <span className="text-gray-500 dark:text-gray-400"> — les données collectées, leur usage, leur durée et vos droits.</span>
            </li>
          </ul>
        </section>

        {/* Session */}
        <section className={card}>
          <CardTitle icon={LogOut} title="Session" text="Terminez votre session sur cet appareil." />
          <Button size="sm" variant="outline" onClick={handleLogout}>
            Se déconnecter
          </Button>
        </section>
      </div>
    </>
  );
}
