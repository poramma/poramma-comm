import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  text = 'Chargement...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        rotate: {
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }
      }
    }
  };

  return (
    <motion.div
      className={`flex flex-col items-center justify-center ${className}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Spinner avec dégradé */}
      <motion.div
        className={`relative ${sizeClasses[size]}`}
        variants={spinnerVariants}
        animate="animate"
      >
        {/* Cercle de fond */}
        <div className="absolute inset-0 rounded-full border-2 border-neutral-200 dark:border-neutral-700"></div>
        
        {/* Arc animé avec dégradé */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-green-500 border-r-yellow-400 border-b-red-500 animate-spin"></div>
        
        {/* Points animés supplémentaires pour plus de style */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
        <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
      </motion.div>

      {/* Texte de chargement */}
      {text && (
        <motion.p
          className={`mt-3 text-neutral-600 dark:text-neutral-400 font-medium ${textSizes[size]}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {text}
        </motion.p>
      )}

      {/* Points animés supplémentaires */}
      <motion.div 
        className="flex space-x-1 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 rounded-full bg-gradient-to-r from-green-500 to-red-500"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

// Variante de loader pour les boutons
export const ButtonLoader: React.FC = () => (
  <div className="flex items-center justify-center">
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Variante de loader pour les pages complètes
export const PageLoader: React.FC = () => (
  <div className="fixed inset-0 bg-white dark:bg-neutral-900 flex items-center justify-center z-50">
    <div className="text-center">
      <Loader size="lg" text="Chargement de la plateforme..." />
      
      {/* Logo avec animation */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-600 via-yellow-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-4">
          MA
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 font-semibold">
          MaliServices
        </p>
      </motion.div>
    </div>
  </div>
);

// Variante de loader pour les tableaux
export const TableLoader: React.FC = () => (
  <div className="py-12 flex items-center justify-center">
    <Loader size="md" text="Chargement des données..." />
  </div>
);

// Variante de loader pour les cartes
export const CardLoader: React.FC = () => (
  <div className="p-8 flex items-center justify-center">
    <Loader size="sm" text="Chargement..." />
  </div>
);

export default Loader;