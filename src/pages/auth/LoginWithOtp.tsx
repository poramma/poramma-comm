// src/pages/auth/LoginWithOtp.tsx
import React, { useState } from "react";
import { AuthAPI } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useAudit } from "../../hooks/useAudit";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import OTPDialog from "../../components/security/OTPDialog";
import { Link, useNavigate } from "react-router-dom";

export default function LoginWithOtp() {
  const { setSession } = useAuth();
  const { log } = useAudit();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [openOtp, setOpenOtp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [otpChannel, setOtpChannel] = useState<"sms" | "email">("email");
  const [resendBusy, setResendBusy] = useState(false);

  // token temporaire ou flag pour garder le contexte entre login & verify
  const [pendingLoginContext, setPendingLoginContext] = useState<{ email: string } | null>(null);

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);

    try {
      const r = await AuthAPI.login({ email: form.email.trim(), password: form.password });
      if (r.ok && r.data) {
        if (r.data.needsOtp) {
          // Demander l'OTP via le canal choisi (ici email par défaut)
          await AuthAPI.requestOtp({ channel: otpChannel, reason: "LOGIN" });
          await log("LOGIN_REQUEST_OTP", "SUCCESS", { email: form.email });
          setPendingLoginContext({ email: form.email });
          setOpenOtp(true);
        } else if (r.data.token) {
          // Auth completed without OTP
          setSession(r.data.token);
          await log("LOGIN_REQUEST_OTP", "SUCCESS", { email: form.email, otp: false });
          navigate("/dashboard"); // redirection après login
        } else {
          setErr("Réponse inattendue du serveur.");
          await log("LOGIN_REQUEST_OTP", "ERROR", { email: form.email, reason: "no_token" });
        }
      } else {
        setErr(r.error || "Identifiants incorrects.");
        await log("LOGIN_REQUEST_OTP", "ERROR", { email: form.email, error: r.error });
      }
    } catch (error: any) {
      setErr(error?.message || "Erreur réseau.");
      await log("LOGIN_REQUEST_OTP", "ERROR", { email: form.email, exception: String(error) });
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (code: string) => {
    setErr(null);
    try {
      const r = await AuthAPI.verifyOtp({ code, reason: "LOGIN" });
      if (r.ok && r.data) {
        // r.data.token attendu
        if (r.data.token) {
          setSession(r.data.token);
          await log("LOGIN_VERIFY_OTP", "SUCCESS", { email: pendingLoginContext?.email });
          setOpenOtp(false);
          setPendingLoginContext(null);
          navigate("/dashboard");
        } else {
          setErr("Réponse inattendue du serveur lors de la vérification OTP.");
          await log("LOGIN_VERIFY_OTP", "ERROR", { email: pendingLoginContext?.email, reason: "no_token" });
        }
      } else {
        setErr(r.error || "Code OTP invalide.");
        await log("LOGIN_VERIFY_OTP", "ERROR", { email: pendingLoginContext?.email, error: r.error });
        throw new Error(r.error || "OTP invalide");
      }
    } catch (err: any) {
      // laisse OTPDialog gérer l'affichage d'erreur si nécessaire
      throw err;
    }
  };

  const handleResend = async () => {
    if (!pendingLoginContext && !form.email) {
      setErr("Entrez d'abord votre email pour renvoyer le code.");
      return;
    }
    setResendBusy(true);
    setErr(null);
    try {
      const email = pendingLoginContext?.email ?? form.email;
      await AuthAPI.requestOtp({ channel: otpChannel, reason: "LOGIN" });
      await log("LOGIN_REQUEST_OTP", "SUCCESS", { email, resend: true });
    } catch (e: any) {
      setErr(e?.message || "Impossible de renvoyer le code.");
      await log("LOGIN_REQUEST_OTP", "ERROR", { email: pendingLoginContext?.email ?? form.email, exception: String(e) });
    } finally {
      setResendBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-theme-xs">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Se connecter</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Connectez-vous avec votre adresse email et mot de passe. Un code OTP peut être requis.
      </p>

      <form onSubmit={submitLogin} className="mt-6 space-y-4">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="moi@exemple.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div>
          <Label>Mot de passe</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Le mot de passe doit être renouvelé périodiquement pour des raisons de sécurité.
          </div>
        </div>

        {err && <div className="text-sm text-error-600 dark:text-error-400">{err}</div>}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Canal OTP</label>
            <select
              id="otpChannel"
              name="otpChannel"
              aria-label="Canal OTP"
              value={otpChannel}
              onChange={(e) => setOtpChannel(e.target.value as "sms" | "email")}
              className="h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-2 text-sm text-gray-800 dark:text-white"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <div className="text-sm">
            <Link to="/auth/forgot" className="text-brand-600 hover:underline dark:text-brand-300">
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Connexion..." : "Se connecter"}
          </Button>
        </div>
      </form>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Pas encore de compte ?{" "}
        <Link to="/auth/register" className="text-brand-600 dark:text-brand-300 hover:underline">
          Créer un compte
        </Link>
      </div>

      {/* OTP Dialog */}
      <OTPDialog
        open={openOtp}
        onClose={() => {
          setOpenOtp(false);
          setPendingLoginContext(null);
        }}
        channel={otpChannel}
        title="Saisissez le code reçu"
        onVerify={async (code: string) => {
          // OTPDialog attend que la promesse reje tte si erreur
          try {
            await verifyOtp(code);
            // si verifyOtp résout, OTPDialog se fermera via setSession/navigation
          } catch (e) {
            // propager l'erreur pour que OTPDialog affiche (ou laisser remonter)
            throw e;
          }
        }}
      />

      {/* actions liées à OTP */}
      {openOtp && (
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Vous n'avez pas reçu le code ? Vérifiez vos spams ou renvoyez.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleResend} disabled={resendBusy}>
              Renvoyer le code
            </Button>
            <Button size="sm" onClick={() => { setOpenOtp(false); setPendingLoginContext(null); }}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
