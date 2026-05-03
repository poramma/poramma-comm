import React, { useState } from "react";
import { VerifyAPI } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useAudit } from "../../hooks/useAudit";
import DocUploader from "../../components/verify/DocUploader";
import INUERibbon from "../../components/student/INUERibbon";
import Button from "../../components/ui/button/Button";

export default function VerifyIdentity() {
  const { user, refreshMe } = useAuth();
  const { log } = useAudit();
  const [uploaded, setUploaded] = useState<{ kind: any; fileId: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const requiredDocs = [
    { kind: "ID_MALIENNE" as const, label: "Pièce d’identité malienne (PDF/JPG)", required: true },
    { kind: "CERTIFICAT_SCOLARITE" as const, label: "Certificat de scolarité (PDF)", required: true },
    { kind: "CARTE_CONSULAIRE" as const, label: "Carte consulaire (ou reçu de demande)", required: false, hint: "Si vous ne l’avez pas, joignez la demande" },
    { kind: "DEMANDE_CARTE_CONSULAIRE" as const, label: "Demande de carte consulaire (si pas encore délivrée)", required: false },
  ];

  const onUploaded = (r: { kind: any; fileId: string }[]) => {
    // merge unique by kind
    const map = new Map<string, string>(uploaded.map(x => [x.kind, x.fileId]));
    r.forEach(x => map.set(x.kind, x.fileId));
    setUploaded(Array.from(map, ([kind, fileId]) => ({ kind, fileId })));
  };

  const submit = async () => {
    setBusy(true); setMsg("");
    const r = await VerifyAPI.submit({ documents: uploaded });
    if (r.ok) {
      await refreshMe();
      setMsg("Vos documents ont été soumis. Un agent consulera votre dossier.");
      await log("VERIFY_SUBMIT", "SUCCESS", { count: uploaded.length });
    } else {
      setMsg(r.error || "Une erreur est survenue.");
      await log("VERIFY_SUBMIT", "ERROR", { error: r.error });
    }
    setBusy(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-theme-xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Vérification d’identité</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Phase 2 — Soumettez vos justificatifs pour obtenir votre INUE.
            </p>
          </div>
          <INUERibbon inue={user?.inue} />
        </div>

        <div className="mt-6">
          <DocUploader items={requiredDocs} onUploaded={onUploaded} />
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="outline">Annuler</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Soumission..." : "Soumettre à la validation"}</Button>
        </div>

        {msg && <div className="mt-3 text-sm text-brand-700 dark:text-brand-300">{msg}</div>}
      </div>

      {!user?.inue && (
        <div className="rounded-xl border border-warning-200 dark:border-warning-800 bg-warning-50/60 dark:bg-warning-500/10 p-4 text-sm text-warning-800 dark:text-warning-300">
          <strong>Note :</strong> après validation manuelle par l’ambassade, votre <em>Identifiant Numérique Unique Étudiant (INUE)</em> sera généré et visible ici.
        </div>
      )}
    </div>
  );
}
