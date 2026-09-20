import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarCheck, Download, ExternalLink, FileText, Heart } from "lucide-react";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import Lightbox from "../../components/campagnes/Lightbox";
import BannerCarousel from "../../components/campagnes/BannerCarousel";
import { formatBytes, formatPublished, typeMeta } from "../../components/campagnes/campagneMeta";
import { campagneMediaUrl, campagneService } from "../../lib/services";
import { sanitizeHtml } from "../../lib/sanitizeHtml";
import type { Campagne } from "../../lib/types";

/** Mise en forme du HTML de l'annonce (les balises sont nettoyées par sanitizeHtml avant affichage). */
const CONTENT_CLASSES =
  "text-[15px] leading-relaxed text-gray-800 dark:text-gray-200 " +
  "[&_p]:mb-3 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold " +
  "[&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 " +
  "[&_a]:text-brand-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic " +
  "[&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg [&_table]:my-3 [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:px-2 [&_th]:py-1";

export default function CampagneDetailPage() {
  const { id } = useParams();
  const [campagne, setCampagne] = useState<Campagne | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [busy, setBusy] = useState<"LIKE" | "PARTICIPATE" | null>(null);
  const playedVideos = useRef(new Set<string>()); // un clic « lecture » par vidéo et par visite

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    campagneService
      .getById(id)
      .then((c) => {
        setCampagne(c);
        // Statistique d'ouverture : silencieuse, ne bloque jamais l'affichage.
        campagneService.recordView(id).catch(() => undefined);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Bannière : images et vidéos affichées en carrousel entre le titre et le contenu ; le reste garde sa galerie sous le texte.
  const banner = useMemo(() => campagne?.attachments.filter((a) => a.isBanner && a.type !== "DOCUMENT") ?? [], [campagne]);
  const gallery = useMemo(() => campagne?.attachments.filter((a) => !banner.includes(a)) ?? [], [campagne, banner]);
  const images = useMemo(() => gallery.filter((a) => a.type === "IMAGE"), [gallery]);
  const videos = useMemo(() => gallery.filter((a) => a.type === "VIDEO"), [gallery]);
  const documents = useMemo(() => gallery.filter((a) => a.type === "DOCUMENT"), [gallery]);
  // La visionneuse plein écran parcourt les images de la bannière puis celles de la galerie.
  const bannerImages = useMemo(() => banner.filter((a) => a.type === "IMAGE"), [banner]);
  const lightboxImages = useMemo(() => [...bannerImages, ...images], [bannerImages, images]);
  const safeContent = useMemo(() => (campagne ? sanitizeHtml(campagne.content) : ""), [campagne]);

  const trackClick = (targetId: string) => {
    if (id) campagneService.recordClick(id, targetId).catch(() => undefined);
  };

  const react = async (type: "LIKE" | "PARTICIPATE") => {
    if (!id || !campagne || busy) return;
    setBusy(type);
    try {
      const { active, count } = await campagneService.react(id, type);
      setCampagne(
        type === "LIKE"
          ? { ...campagne, likedByMe: active, likes: count }
          : { ...campagne, participatingByMe: active, participants: count }
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Action impossible pour le moment.");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-brand-500" />
      </div>
    );
  }

  if (notFound || !campagne) {
    return (
      <div className="space-y-4 p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Annonce introuvable</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Cette annonce n'existe pas ou ne vous est pas destinée.</p>
        <Link to="/campagnes" className="text-brand-600 underline">Retour aux annonces</Link>
      </div>
    );
  }

  const meta = typeMeta(campagne.type);
  const coverUrl = campagne.cover ? campagneMediaUrl(campagne.cover.url) : null;

  return (
    <>
      <PageMeta title={campagne.title} description={campagne.excerpt} />
      <PageBreadcrumb pageTitle="Annonce" />

      <article className="mx-auto max-w-3xl space-y-6 p-2 md:p-4">
        <Link to="/campagnes" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-brand-600 dark:text-gray-400">
          <ArrowLeft className="h-4 w-4" /> Toutes les annonces
        </Link>

        {/* La couverture ne s'affiche en tête que sans bannière (sinon la bannière la remplace, sous le titre). */}
        {coverUrl && banner.length === 0 && (
          <img src={coverUrl} alt="" className="max-h-[420px] w-full rounded-2xl object-cover" />
        )}

        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant="solid" color={meta.color}>{meta.label}</Badge>
            <span className="text-sm text-gray-500 dark:text-gray-400">{formatPublished(campagne.publishedAt)}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">{campagne.title}</h1>
        </header>

        {banner.length > 0 && (
          <BannerCarousel
            items={banner}
            onImageClick={(item) => {
              const i = lightboxImages.findIndex((x) => x.id === item.id);
              if (i >= 0) setLightbox(i);
              trackClick(item.id);
            }}
            onVideoPlay={(item) => trackClick(item.id)}
          />
        )}

        <div
          className={CONTENT_CLASSES}
          // Le HTML est reconstruit à partir d'une liste blanche (lib/sanitizeHtml.ts).
          dangerouslySetInnerHTML={{ __html: safeContent }}
          onClick={(e) => {
            const link = (e.target as HTMLElement).closest("a");
            const href = link?.getAttribute("href");
            if (href) trackClick(`link:${href.slice(0, 170)}`);
          }}
        />

        {images.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Photos</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  className="group overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
                  onClick={() => {
                    setLightbox(bannerImages.length + i);
                    trackClick(img.id);
                  }}
                >
                  <img
                    src={campagneMediaUrl(img.url)}
                    alt={img.caption || img.name}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {videos.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vidéos</h2>
            {videos.map((v) => (
              <figure key={v.id} className="space-y-2">
                <video
                  controls
                  preload="metadata"
                  className="w-full rounded-xl bg-black"
                  src={campagneMediaUrl(v.url)}
                  onPlay={() => {
                    if (!playedVideos.current.has(v.id)) {
                      playedVideos.current.add(v.id);
                      trackClick(v.id);
                    }
                  }}
                >
                  Votre navigateur ne sait pas lire cette vidéo.
                </video>
                {v.caption && <figcaption className="text-sm text-gray-600 dark:text-gray-400">{v.caption}</figcaption>}
              </figure>
            ))}
          </section>
        )}

        {documents.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Documents</h2>
            <ul className="space-y-2">
              {documents.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800">
                  <FileText className="h-6 w-6 shrink-0 text-brand-600" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{d.caption || d.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{d.name} · {formatBytes(d.size)}</p>
                  </div>
                  <a
                    href={campagneMediaUrl(d.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick(d.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <ExternalLink className="h-4 w-4" /> Ouvrir
                  </a>
                  <a
                    href={campagneMediaUrl(d.url, { download: true })}
                    onClick={() => trackClick(d.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-sm text-white hover:bg-brand-600"
                  >
                    <Download className="h-4 w-4" /> Télécharger
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
          <Button variant={campagne.likedByMe ? "primary" : "outline"} onClick={() => react("LIKE")} disabled={busy === "LIKE"}>
            <Heart className={`mr-2 h-4 w-4 ${campagne.likedByMe ? "fill-current" : ""}`} />
            {campagne.likedByMe ? "Vous aimez" : "J'aime"} · {campagne.likes}
          </Button>
          {campagne.type === "EVENT" && (
            <Button variant={campagne.participatingByMe ? "primary" : "outline"} onClick={() => react("PARTICIPATE")} disabled={busy === "PARTICIPATE"}>
              <CalendarCheck className="mr-2 h-4 w-4" />
              {campagne.participatingByMe ? "Vous participez" : "Je participe"} · {campagne.participants}
            </Button>
          )}
        </footer>
      </article>

      {lightbox !== null && (
        <Lightbox
          images={lightboxImages.map((i) => ({ src: campagneMediaUrl(i.url), caption: i.caption, name: i.name }))}
          index={lightbox}
          onChange={setLightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
