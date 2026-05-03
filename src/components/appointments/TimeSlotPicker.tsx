import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

type Props = {
  agenda: Record<string, string[]>; // YYYY-MM-DD -> ["09:00", ...]
  selectedDate: string | null;
  selectedTime: string | null;
  onPickDate: (date: string) => void;
  onPickTime: (time: string) => void;
};

const TimeSlotPicker: React.FC<Props> = ({
  agenda,
  selectedDate,
  selectedTime,
  onPickDate,
  onPickTime,
}) => {
  const days = useMemo(() => Object.keys(agenda).sort(), [agenda]);

  return (
    <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        <div
          className="w-8 h-8 flex items-center justify-center rounded-full text-white bg-brand-500"
        >
          3
        </div>
         Sélectionnez un créneau</h2>

      <div className="mt-4 grid lg:grid-cols-2 gap-6">
        {/* Col gauche: jours */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {days.map((d) => {
              const active = d === selectedDate;
              const slots = agenda[d] || [];
              const disabled = slots.length === 0;
              return (
                <button
                  key={d}
                  onClick={() => !disabled && onPickDate(d)}
                  className={`rounded-lg border px-3 py-2 text-left transition
                    ${active ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-white/[0.03]"}
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  title={disabled ? "Aucun créneau" : ""}
                >
                  <div className={`text-sm ${active ? "text-brand-700 dark:text-brand-300" : "text-gray-700 dark:text-gray-300"}`}>
                    {format(parseISO(d), "EEE d MMM", { locale: fr })}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{slots.length} créneau(x)</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Col droit: horaires du jour */}
        <div>
          {selectedDate ? (
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {format(parseISO(selectedDate), "'Créneaux le' EEEE d MMMM yyyy", { locale: fr })}
              </div>

              <div className="flex flex-wrap gap-2">
                {(agenda[selectedDate] || []).map((t) => {
                  const active = t === selectedTime;
                  return (
                    <button
                      key={t}
                      onClick={() => onPickTime(t)}
                      className={`rounded-lg px-3 py-2 text-sm border transition
                        ${active ? "bg-brand-500 text-white border-brand-500" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50/60 dark:hover:bg-white/[0.03] text-gray-800 dark:text-gray-200"}
                      `}
                    >
                      {t}
                    </button>
                  );
                })}
                {(agenda[selectedDate] || []).length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">Aucun créneau disponible ce jour.</div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">Choisissez d’abord un jour pour voir les horaires.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TimeSlotPicker;
