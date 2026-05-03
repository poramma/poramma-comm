import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AgentTooltipProps {
  name: string;
  role: string;
  visible: boolean; // si le tooltip doit s'afficher
}

const AgentTooltip: React.FC<AgentTooltipProps> = ({ name, role, visible }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.15 }}
          className="absolute -top-14 left-1/2 -translate-x-1/2
                     bg-white dark:bg-gray-800
                     text-gray-900 dark:text-white
                     text-xs px-3 py-2 rounded-lg shadow-lg z-50 whitespace-nowrap"
        >
          <div className="font-semibold">{name}</div>
          <div className="text-gray-600 dark:text-gray-300">{role}</div>

          {/* Flèche */}
          <div
            className="absolute left-1/2 -bottom-1 w-2 h-2 
                       bg-white dark:bg-gray-800 
                       rotate-45 -translate-x-1/2"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgentTooltip;
