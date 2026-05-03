import React, { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  name?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  hint?: string;
}

const Select: React.FC<SelectProps> = ({
  name,
  options,
  placeholder = "Selectionner une option",
  onChange,
  className = "",
  defaultValue = "",
  disabled = false,
  error = false,
  success = false,
  hint = "",
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
    onChange(value);
  };

  let selectClasses =
    `h-11 w-full rounded-lg border px-4 py-2.5 text-sm appearance-none shadow-sm 
     placeholder:text-neutral-500 focus:outline-none focus:ring-2 transition-colors duration-300
     dark:bg-neutral-50 dark:text-neutral-700 dark:placeholder:text-neutral-700
     ${selectedValue ? "text-neutral-700 dark:text-neutral-700" : "text-neutral-500"} ${className}`;

  if (disabled) {
    selectClasses += ` text-neutral-500 border-neutral-300 bg-neutral-100 opacity-40 cursor-not-allowed`;
  } else if (error) {
    selectClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/30`;
  } else if (success) {
    selectClasses += ` border-success-500 focus:border-success-300 focus:ring-success-500/30`;
  } else {
    selectClasses += ` border-neutral-300 focus:border-brand-300 focus:ring-brand-500/20`;
  }

  return (
    <div className="relative">
      <select
        aria-label={placeholder}
        name={name}
        value={selectedValue}
        onChange={handleChange}
        disabled={disabled}
        className={selectClasses}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-neutral-700 dark:text-neutral-700">
            {option.label}
          </option>
        ))}
      </select>
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

export default Select;
