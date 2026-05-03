import { ReactNode } from "react";

interface ButtonProps {
  type?: "button" | "submit";
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "xs";
  variant?: "primary" | "outline" | "ghost" | "link";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  type = "button",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
}) => {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
    xs: "px-3 py-1.5 text-xs",
  };

  const variantClasses = {
    primary:
      "bg-brand-500 text-white shadow-sm hover:bg-brand-700 disabled:bg-brand-300",
    outline:
      "bg-white text-neutral-700 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-100 dark:bg-neutral-50 dark:text-neutral-700 dark:ring-neutral-700",
    ghost:
      "bg-transparent text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-700/20",
    link: "bg-transparent text-brand-500 underline-offset-4 hover:underline",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-colors duration-300 ${sizeClasses[size]} ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${className}`}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
