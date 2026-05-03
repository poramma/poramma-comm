import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  shadow?: boolean;
  hoverEffect?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  shadow = true,
  hoverEffect = false,
}) => {
  return (
    <div
      className={`rounded-xl bg-white dark:bg-neutral-50 border border-neutral-200 dark:border-neutral-700 
        ${shadow ? "shadow-md" : ""} 
        ${hoverEffect ? "transition-transform duration-300 hover:scale-[1.02]" : ""}
        p-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
