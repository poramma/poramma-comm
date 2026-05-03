import React from "react";
import { FileText, Clock, DollarSign, Info, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Badge from "../../components/ui/badge/Badge";
import { Tooltip } from "../../components/ui/tooltip/Tooltip";
import { Modal } from "../../components/ui/modal";
import { useState } from "react";


interface ServiceOverviewProps {
  documents: {name: string, required: boolean}[];
  fees: string;
  delay: string;
  extraInfo?: string;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};
export default function ServiceOverview({ documents, fees, delay, extraInfo }: ServiceOverviewProps) {
  const isFree = parseFloat(fees) === 0 || fees.toLowerCase().includes("gratuit");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 bg-neutral-50 dark:bg-neutral-800 shadow-theme-md rounded-radius-lg p-4 sm:p-6 font-outfit animate-fade-in"
      aria-labelledby="service-overview-title"
    >
  
      <h2
        id="service-overview-title"
        className="text-title-md font-heading font-bold text-neutral-700 dark:text-neutral-50"
      >
        Aperçu de la démarche
      </h2>

      <motion.section variants={itemVariants} aria-describedby="documents-section">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-2">
          <FileText className="w-5 h-5 text-brand-500" /> Documents à fournir
        </h3>
        <ul className="grid sm:grid-cols-2 gap-2 list-none text-theme-sm text-neutral-600 dark:text-neutral-300">
          <AnimatePresence>
            {documents.map((doc, idx) => (
              <motion.li
                key={idx}
                variants={itemVariants}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                className="flex items-center gap-2 pl-4 relative before:content-['•'] before:text-brand-500 before:absolute before:left-0"
              >
                {doc.name}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </motion.section>

      <motion.section variants={itemVariants} aria-describedby="fees-section">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-2">
          <DollarSign className="w-5 h-5 text-brand-500" /> Frais de traitement
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-theme-sm text-neutral-600 dark:text-neutral-300">{fees}</p>
          <Badge variant={isFree ? "solid" : "outline"} color={isFree ? "success" : "brand"}>
            {isFree ? "Gratuit" : "Payant"}
          </Badge>
        </div>
      </motion.section>

      <motion.section variants={itemVariants} aria-describedby="delay-section">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-2">
          <Clock className="w-5 h-5 text-brand-500" /> Délais estimés
        </h3>
        <p className="text-theme-sm text-neutral-600 dark:text-neutral-300">{delay}</p>
      </motion.section>

      {extraInfo && (
        <motion.section variants={itemVariants} aria-describedby="extra-info-section">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-2">
            <Info className="w-5 h-5 text-brand-500" /> Informations utiles
          </h3>
          <Tooltip content={extraInfo} disabled={extraInfo.length <= 100}>
            <p className="text-theme-sm text-neutral-600 dark:text-neutral-300 line-clamp-3">
              {extraInfo}
            {extraInfo.length > 100 && (
            <>
              <button
                className="mt-2 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center gap-1"
                onClick={() => setModalOpen(true)}
                aria-label="Voir plus d'informations utiles"
              >
                <HelpCircle className="w-4 h-4" /> En savoir plus
              </button>
              <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                className="max-w-2xl w-full"
                showCloseButton={true}>
                <div className="text-theme-sm text-neutral-600 dark:text-neutral-300">
                  {extraInfo}
                </div>
              </Modal>
            </>
          )}
            </p>
          </Tooltip>
        </motion.section>
      )}

    </motion.div>
  );
}
