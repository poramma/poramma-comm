import { useState } from "react";
import type { DayCount } from "../../../lib/adminTypes";
import { formatDayLong, formatDayShort } from "../adminFormat";

/**
 * Histogramme léger en SVG pour une série journalière (14 jours). Aucune
 * dépendance : survol/focus d'une barre = valeur du jour, un résumé textuel
 * est lisible par les lecteurs d'écran.
 */
export default function MiniBarChart({ data, label, unit }: { data: DayCount[]; label: string; unit: string }) {
  const [active, setActive] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">Aucune donnée sur la période.</p>;
  }

  const W = 560;
  const H = 150;
  const PAD_TOP = 8;
  const PAD_BOTTOM = 4;
  const max = Math.max(1, ...data.map((d) => d.n));
  const step = W / data.length;
  const barW = Math.min(28, step * 0.62);
  const total = data.reduce((sum, d) => sum + d.n, 0);
  const shown = active !== null ? data[active] : null;

  return (
    <div>
      <p className="mb-2 min-h-5 text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
        {shown ? (
          <>
            <span className="capitalize">{formatDayLong(shown.day)}</span> : <strong className="text-gray-800 dark:text-white/90">{shown.n.toLocaleString("fr-FR")}</strong> {unit}
          </>
        ) : (
          <>
            {total.toLocaleString("fr-FR")} {unit} sur {data.length} jours
          </>
        )}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${label} : ${total} ${unit} sur ${data.length} jours`}>
        <line x1="0" x2={W} y1={H - PAD_BOTTOM} y2={H - PAD_BOTTOM} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" />
        {data.map((d, i) => {
          const h = d.n === 0 ? 2 : Math.max(3, ((H - PAD_TOP - PAD_BOTTOM) * d.n) / max);
          const x = i * step + (step - barW) / 2;
          const y = H - PAD_BOTTOM - h;
          return (
            <g key={d.day}>
              {/* zone de survol/clic plus large que la barre */}
              <rect
                x={i * step}
                y={0}
                width={step}
                height={H}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${formatDayShort(d.day)} : ${d.n} ${unit}`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="outline-none"
              />
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx="4"
                className={`pointer-events-none transition-colors ${
                  active === i ? "fill-brand-700 dark:fill-brand-300" : d.n === 0 ? "fill-gray-200 dark:fill-gray-700" : "fill-brand-500 dark:fill-brand-500/80"
                }`}
              />
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-gray-400">
        <span>{formatDayShort(data[0].day)}</span>
        <span>{formatDayShort(data[data.length - 1].day)}</span>
      </div>
    </div>
  );
}
