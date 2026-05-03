import React, { useState } from "react";
import type { DocumentKind, IdentityDocUpload } from "../../lib/types";
import { FilesAPI } from "../../lib/api";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";

type Item = {
  kind: DocumentKind;
  label: string;
  hint?: string;
  required?: boolean;
};

type Props = {
  items: Item[];
  onUploaded: (result: { kind: DocumentKind; fileId: string }[]) => void;
};

const DocUploader: React.FC<Props> = ({ items, onUploaded }) => {
  const [files, setFiles] = useState<Record<DocumentKind, File | null>>({} as any);
  const [results, setResults] = useState<Record<DocumentKind, string | null>>({} as any);
  const [busy, setBusy] = useState(false);

  const handleSelect = (kind: DocumentKind, file: File | null) => {
    setFiles((prev) => ({ ...prev, [kind]: file }));
  };

  const handleUpload = async () => {
    setBusy(true);
    const out: { kind: DocumentKind; fileId: string }[] = [];
    for (const it of items) {
      const f = files[it.kind];
      if (!f && it.required) continue;
      if (f) {
        const r = await FilesAPI.upload({ kind: it.kind, file: f } as IdentityDocUpload);
        if (r.ok && r.data) {
          out.push({ kind: it.kind, fileId: r.data.fileId });
          setResults((prev) => ({ ...prev, [it.kind]: r.data!.fileId }));
        }
      }
    }
    onUploaded(out);
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      {items.map((it) => (
        <div key={it.kind} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{it.label}</div>
              {it.hint && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{it.hint}</div>}
            </div>
            {results[it.kind] ? (
              <Badge variant="solid">Téléversé</Badge>
            ) : it.required ? (
              <Badge variant="outline">Obligatoire</Badge>
            ) : null}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <input
              id={it.kind}
              aria-label={it.label}
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleSelect(it.kind, e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-500 file:px-3 file:py-2 file:text-white hover:file:bg-brand-600 dark:file:bg-brand-600 dark:hover:file:bg-brand-700"
            />
            <Button size="sm" variant="outline" onClick={handleUpload} disabled={busy}>
              Charger
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocUploader;
