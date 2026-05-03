import React from "react";
import { motion } from "framer-motion";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, disabled }) => {
  if (disabled) return <>{children}</>;

  return (
    <div className="relative group">
      {children}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute z-10 hidden group-hover:block bg-neutral-800 text-white text-theme-xs p-2 rounded-radius-sm max-w-xs -top-10 left-1/2 transform -translate-x-1/2"
      >
        {content}
      </motion.div>
    </div>
  );
};