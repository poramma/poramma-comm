import { ReactNode, useId } from "react";
import { Link } from "react-router";
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, Inbox, Loader2, RefreshCw, Search } from "lucide-react";
import type { ComponentType } from "react";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import type { PageMeta } from "../../../lib/adminTypes";

/** Champs natifs (les composants de formulaire du portail ne se recolorent pas en mode sombre). */
export const fieldClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-700";

export const cardClass = "rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`${cardClass} ${className}`}>{children}</section>;
}

export function AdminPageHeader({
  title,
  description,
  backTo,
  backLabel = "Retour",
  actions,
}: {
  title: string;
  description?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6">
      {backTo && (
        <Link to={backTo} className="mb-3 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-700 dark:text-gray-400">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">{title}</h1>
          {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function LoadingBlock({ label = "Chargement…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500 dark:text-gray-400">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <Icon className="h-8 w-8 text-gray-300 dark:text-gray-600" />
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
      {description && <p className="max-w-sm text-xs text-gray-500 dark:text-gray-400">{description}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <AlertTriangle className="h-8 w-8 text-error-500" aria-hidden="true" />
      <p className="max-w-md text-sm text-gray-700 dark:text-gray-300">{message}</p>
      {onRetry && (
        <Button size="xs" variant="outline" onClick={onRetry} startIcon={<RefreshCw className="h-3.5 w-3.5" />}>
          Réessayer
        </Button>
      )}
    </div>
  );
}

export function InlineError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
      {children}
    </p>
  );
}

type Tone = "brand" | "success" | "warning" | "error" | "info" | "gray";

const TONE_ICON: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
  success: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
  warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400",
  error: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
  info: "bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/15 dark:text-blue-light-500",
  gray: "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
  to,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ComponentType<{ className?: string }>;
  tone?: Tone;
  to?: string;
}) {
  const body = (
    <div className="flex items-start gap-3">
      {Icon && (
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONE_ICON[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold text-gray-800 dark:text-white/90">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
      </div>
    </div>
  );
  const className = `${cardClass} block p-4`;
  return to ? (
    <Link to={to} className={`${className} transition-colors hover:border-brand-300 dark:hover:border-brand-700`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  allLabel,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  /** Libellé de l'option "aucun filtre" (valeur vide) ; absent = pas d'option vide. */
  allLabel?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass}>
        {allLabel !== undefined && <option value="">{allLabel}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className = "",
  max,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
  max?: string;
  min?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
      </label>
      <input id={id} type={type} value={value} max={max} min={min} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={fieldClass} />
    </div>
  );
}

export function SearchField({
  label = "Recherche",
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${fieldClass} pl-9`} />
      </div>
    </div>
  );
}

export function Pagination({ meta, onChange, noun = "résultat" }: { meta: PageMeta; onChange: (page: number) => void; noun?: string }) {
  if (meta.total === 0) return null;
  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);
  const plural = meta.total > 1 ? "s" : "";
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 text-sm dark:border-gray-800">
      <p className="text-gray-500 dark:text-gray-400">
        {from}–{to} sur {meta.total.toLocaleString("fr-FR")} {noun}
        {plural}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(meta.page - 1)}
          disabled={!meta.hasPrev}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Précédent
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
          Page {meta.page} / {Math.max(1, meta.totalPages)}
        </span>
        <button
          type="button"
          onClick={() => onChange(meta.page + 1)}
          disabled={!meta.hasNext}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
        >
          Suivant
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

/** Boîte de confirmation (action sensible) — Échap et clic à l'extérieur annulent. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  busy,
  danger,
  onConfirm,
  onCancel,
  confirmDisabled,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  danger?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal isOpen={open} onClose={busy ? () => undefined : onCancel} className="m-4 max-w-lg p-6 sm:p-8">
      <div role="alertdialog" aria-modal="true" aria-label={title}>
        <h3 className="pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">{title}</h3>
        <div className="mt-3 space-y-3 text-sm text-gray-600 dark:text-gray-400">{children}</div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onCancel} disabled={busy}>
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={busy || confirmDisabled}
            className={danger ? "bg-error-500! hover:bg-error-600! disabled:bg-error-300!" : ""}
          >
            {busy ? "Veuillez patienter…" : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** Conteneur d'un tableau : défile horizontalement sur petit écran. */
export function TableScroll({ children }: { children: ReactNode }) {
  return <div className="relative max-w-full overflow-x-auto">{children}</div>;
}

export const thClass = "whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400";
export const tdClass = "px-4 py-3 text-sm text-gray-700 dark:text-gray-300";

export function TextAreaField({
  value,
  onChange,
  rows = 4,
  placeholder,
  label,
  maxLength,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  /** Libellé accessible (masqué à l'écran). */
  label: string;
  maxLength?: number;
  id?: string;
}) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <>
      <label htmlFor={fieldId} className="sr-only">
        {label}
      </label>
      <textarea
        id={fieldId}
        rows={rows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} h-auto min-h-[5rem] resize-y py-2.5`}
      />
    </>
  );
}
