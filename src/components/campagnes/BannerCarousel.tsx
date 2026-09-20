import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { campagneMediaUrl } from "../../lib/services";
import type { CampagneAttachment } from "../../lib/types";

/** Durée d'affichage d'une image avant de passer à la suivante. */
const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 40;

interface BannerCarouselProps {
  items: CampagneAttachment[];
  /** Clic sur une image (ouvre la visionneuse plein écran de la page). */
  onImageClick?: (item: CampagneAttachment) => void;
  /** Première lecture d'une vidéo (statistiques). */
  onVideoPlay?: (item: CampagneAttachment) => void;
}

/**
 * Bannière d'une annonce : images et/ou vidéos en carrousel, affichée entre le titre et le contenu.
 * - défilement automatique des images (mis en pause au survol, au focus, hors écran et si l'utilisateur
 *   préfère moins d'animations) ; une vidéo est lue jusqu'au bout avant de passer à la suite ;
 * - flèches, pastilles, glissement au doigt et touches ← → ;
 * - une image de format inhabituel n'est jamais rognée (elle est posée sur un fond flouté de la même image).
 */
export default function BannerCarousel({ items, onImageClick, onVideoPlay }: BannerCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const playedVideos = useRef(new Set<string>());
  const touchStartX = useRef<number | null>(null);
  const count = items.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  // L'index peut sortir des bornes si la liste change.
  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  // Seule la diapositive affichée joue : on met les autres vidéos en pause.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (video && i !== index) video.pause();
    });
  }, [index]);

  // Pas de défilement automatique tant que le carrousel n'est pas visible à l'écran.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const current = items[index];
  const reducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (count < 2 || paused || !visible || reducedMotion || !current || current.type !== "IMAGE") return;
    const timer = window.setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [count, paused, visible, reducedMotion, current, index, go]);

  if (count === 0) return null;

  return (
    <div
      ref={rootRef}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      tabIndex={0}
      role="region"
      aria-roledescription="carrousel"
      aria-label="Images et vidéos de l'annonce"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (count < 2) return;
        if (e.key === "ArrowLeft") go(index - 1);
        else if (e.key === "ArrowRight") go(index + 1);
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null || count < 2) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(delta) > SWIPE_THRESHOLD) go(delta < 0 ? index + 1 : index - 1);
      }}
    >
      <div className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${index * 100}%)` }}>
        {items.map((item, i) => {
          const src = campagneMediaUrl(item.url);
          const active = i === index;
          return (
            <div key={item.id} className="relative h-full w-full shrink-0" aria-hidden={!active} role="group" aria-roledescription="diapositive" aria-label={`${i + 1} sur ${count}`}>
              {item.type === "IMAGE" ? (
                <button type="button" tabIndex={active ? 0 : -1} className="relative block h-full w-full cursor-zoom-in" onClick={() => onImageClick?.(item)} aria-label={item.caption || item.name}>
                  <img src={src} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl" loading={i === 0 ? "eager" : "lazy"} />
                  <img src={src} alt={item.caption || item.name} className="relative h-full w-full object-contain" loading={i === 0 ? "eager" : "lazy"} />
                </button>
              ) : (
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full bg-black object-contain"
                  src={src}
                  onPlay={() => {
                    setPaused(true);
                    if (!playedVideos.current.has(item.id)) {
                      playedVideos.current.add(item.id);
                      onVideoPlay?.(item);
                    }
                  }}
                  onPause={() => setPaused(false)}
                  onEnded={() => count > 1 && go(index + 1)}
                >
                  Votre navigateur ne sait pas lire cette vidéo.
                </video>
              )}
              {item.caption && (
                <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-8 pt-8 text-sm text-white">{item.caption}</p>
              )}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Média précédent"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-100 backdrop-blur transition hover:bg-black/60 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Média suivant"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-100 backdrop-blur transition hover:bg-black/60 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Aller au média ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={`pointer-events-auto h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`}
              />
            ))}
          </div>
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            {index + 1} / {count}
          </span>
        </>
      )}
    </div>
  );
}
