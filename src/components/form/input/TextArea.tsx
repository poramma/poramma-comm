import React from "react";

interface TextareaProps {
  placeholder?: string;
  rows?: number;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  hint?: string;
}

const TextArea: React.FC<TextareaProps> = ({
  placeholder = "Enter your message",
  rows = 3,
  value = "",
  onChange,
  className = "",
  disabled = false,
  error = false,
  success = false,
  hint = "",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  let textareaClasses =
    `w-full rounded-lg border px-4 py-2.5 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 transition-colors duration-300 
     dark:bg-neutral-50 dark:text-neutral-700 dark:placeholder:text-neutral-700 ${className}`;

  if (disabled) {
    textareaClasses += ` text-neutral-500 border-neutral-300 bg-neutral-100 opacity-40 cursor-not-allowed`;
  } else if (error) {
    textareaClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/30`;
  } else if (success) {
    textareaClasses += ` border-success-500 focus:border-success-300 focus:ring-success-500/30`;
  } else {
    textareaClasses += ` border-neutral-300 text-neutral-700 focus:border-brand-300 focus:ring-brand-500/20`;
  }

  return (
    <div className="relative">
      <textarea
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={textareaClasses}
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

export default TextArea;
