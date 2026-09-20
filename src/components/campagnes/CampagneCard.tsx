import { Link } from "react-router-dom";
import { FileText, Heart, Image as ImageIcon, Megaphone, Video } from "lucide-react";
import Badge from "../ui/badge/Badge";
import { campagneMediaUrl } from "../../lib/services";
import type { Campagne } from "../../lib/types";
import { formatPublished, typeMeta } from "./campagneMeta";

/** Carte d'une annonce dans le fil : couverture (ou aplat de couleur), type, titre, aperçu et compteurs. */
export default function CampagneCard({ campagne }: { campagne: Campagne }) {
  const meta = typeMeta(campagne.type);
  const count = (t: string) => campagne.attachments.filter((a) => a.type === t).length;
  const images = count("IMAGE");
  const videos = count("VIDEO");
  const documents = count("DOCUMENT");
  // Sans couverture, la première image de la bannière illustre la carte.
  const thumb = campagne.cover ?? campagne.attachments.find((a) => a.isBanner && a.type === "IMAGE") ?? null;

  return (
    <Link
      to={`/campagnes/${campagne.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs transition hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {thumb ? (
          <img
            src={campagneMediaUrl(thumb.url)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${meta.tint}`}>
            <Megaphone className="h-10 w-10 text-white/80" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Badge variant="solid" color={meta.color}>{meta.label}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">{formatPublished(campagne.publishedAt)}</p>
        <h3 className="line-clamp-2 text-base font-semibold text-gray-900 dark:text-white">{campagne.title}</h3>
        {campagne.excerpt && <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{campagne.excerpt}</p>}

        <div className="mt-auto flex items-center gap-4 pt-3 text-xs text-gray-500 dark:text-gray-400">
          {images > 0 && (
            <span className="inline-flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" />{images}</span>
          )}
          {videos > 0 && (
            <span className="inline-flex items-center gap-1"><Video className="h-3.5 w-3.5" />{videos}</span>
          )}
          {documents > 0 && (
            <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{documents}</span>
          )}
          <span className={`ml-auto inline-flex items-center gap-1 ${campagne.likedByMe ? "text-error-600" : ""}`}>
            <Heart className={`h-3.5 w-3.5 ${campagne.likedByMe ? "fill-current" : ""}`} />
            {campagne.likes}
          </span>
        </div>
      </div>
    </Link>
  );
}
