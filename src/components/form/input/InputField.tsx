import type React from "react";
import type { FC } from "react";

interface InputProps {
  type?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  minLength?: number;
  maxLength?: number;
  step?: number;
  disabled?: boolean;
  required?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
}

const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  onFocus,
  onKeyPress,
  className = "",
  min,
  max,
  minLength,
  maxLength,
  step,
  disabled = false,
  required = false,
  success = false,
  error = false,
  hint,
}) => {
  let inputClasses =
    `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm placeholder:text-neutral-500 
     focus:outline-none focus:ring-2 transition-colors duration-300 
     dark:bg-neutral-50 dark:text-neutral-700 dark:placeholder:text-neutral-700 
     ${className}`;

  if (disabled) {
    inputClasses += ` text-neutral-500 border-neutral-300 bg-neutral-100 opacity-40 cursor-not-allowed`;
  } else if (error) {
    inputClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/30`;
  } else if (success) {
    inputClasses += ` border-success-500 focus:border-success-300 focus:ring-success-500/30`;
  } else {
    inputClasses += ` border-neutral-300 text-neutral-700 focus:border-brand-300 focus:ring-brand-500/20`;
  }

  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onKeyPress={onKeyPress}
        min={min}
        max={max}
        minLength={minLength}
        maxLength={maxLength}
        step={step}
        disabled={disabled}
        required={required}
        className={inputClasses}
      />
      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
              ? "text-success-500"
              : "text-neutral-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
