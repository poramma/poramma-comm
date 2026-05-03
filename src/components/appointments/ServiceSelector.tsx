import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ServiceItem } from "../../pages/appointments/BookAppointement";

type Props = {
  services: ServiceItem[];
  selectedId?: string;
  onSelect: (s: ServiceItem) => void;
};

const ServiceSelector: React.FC<Props> = ({ services, selectedId, onSelect }) => {
  return (
    <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        <div
          className="w-8 h-8 flex items-center justify-center rounded-full text-white bg-brand-500"
        >
          1
        </div>
         Choisissez un service</h2>

      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence initial={false}>
          {services.map((srv) => {
            const active = srv.id === selectedId;
            return (
              <motion.button
                key={srv.id}
                layout
                onClick={() => onSelect(srv)}
                className={`group relative text-left rounded-xl border p-4 transition
                  ${active
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                    : "border-gray-200 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-white/[0.03]"}
                `}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start gap-3">
                  <div className={`rounded-md p-2
                    ${active ? "bg-brand-100 text-brand-700" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}
                  `}>
                    {srv.icon ?? <span className="block size-5">🗂️</span>}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${active ? "text-brand-700 dark:text-brand-300" : "text-gray-900 dark:text-white"}`}>
                      {srv.name}
                    </div>
                    <div className={`text-sm mt-0.5 ${active ? "text-brand-600/80 dark:text-brand-300/70" : "text-gray-500 dark:text-gray-400"}`}>
                      {srv.description}
                    </div>
                  </div>
                </div>
                {active && (
                  <motion.span
                    layoutId="active-service-ring"
                    className="absolute inset-0 rounded-xl ring-2 ring-brand-500"
                  />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ServiceSelector;
