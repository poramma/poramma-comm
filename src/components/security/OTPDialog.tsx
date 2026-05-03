import React, { useState } from "react";
import Button from "../ui/button/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  channel?: "sms" | "email";
  title?: string;
};

const OTPDialog: React.FC<Props> = ({ open, onClose, onVerify, channel = "sms", title }) => {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-theme-md border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title ?? "Vérification par code OTP"}
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Saisissez le code à 6 chiffres envoyé par {channel === "sms" ? "SMS" : "email"}.
        </p>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D+/g, "").slice(0, 6))}
          inputMode="numeric"
          placeholder="000000"
          className="mt-4 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-center tracking-[0.4em] text-lg shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/15 dark:border-gray-700 dark:text-white"
        />

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button
            disabled={code.length !== 6 || busy}
            onClick={async () => { setBusy(true); await onVerify(code); setBusy(false); }}
          >
            Valider
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OTPDialog;
