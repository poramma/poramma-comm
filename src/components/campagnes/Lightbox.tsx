import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface LightboxImage {
  src: string;
  caption?: string | null;
  name: string;
}

/** Visionneuse plein écran : flèches ← → pour naviguer, Échap pour fermer. */
export default function Lightbox({
  images,
  index,
  onChange,
  onClose,
}: {
  images: LightboxImage[];
  index: number;
  onChange: (next: number) => void;
  onClose: () => void;
}) {
  const current = images[index];
  const prev = () => onChange((index - 1 + images.length) % images.length);
  const next = () => onChange((index + 1) % images.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && images.length > 1) onChange((index - 1 + images.length) % images.length);
      else if (e.key === "ArrowRight" && images.length > 1) onChange((index + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length, onChange, onClose]);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
        <X className="h-6 w-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Image précédente"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            type="button"
            aria-label="Image suivante"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </>
      )}

      <figure className="flex max-h-full max-w-5xl flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <img src={current.src} alt={current.caption || current.name} className="max-h-[80vh] max-w-full rounded-lg object-contain" />
        <figcaption className="text-center text-sm text-white/90">
          {current.caption || current.name}
          {images.length > 1 && <span className="ml-2 text-white/60">({index + 1}/{images.length})</span>}
        </figcaption>
      </figure>
    </div>
  );
}
