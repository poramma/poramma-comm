import React from "react";

const INUERibbon: React.FC<{ inue?: string }> = ({ inue }) => {
  if (!inue) return null;
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 px-3 py-1 text-xs">
      <span className="inline-block h-2 w-2 rounded-full bg-brand-500 dark:bg-brand-400" />
      INUE&nbsp;:&nbsp;<span className="font-semibold tracking-wide">{inue}</span>
    </div>
  );
};

export default INUERibbon;
