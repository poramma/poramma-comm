import React from "react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex justify-between items-center">
      {steps.map((step, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full text-white 
            ${index <= currentStep ? "bg-brand-500" : "bg-slate-300"}`}
          >
            {index + 1}
          </div>
          <span className="mt-1 text-xs text-center">{step}</span>
          {index < steps.length && (
            <div className={`h-1 w-full ${index <= currentStep ? "bg-brand-500" : "bg-slate-300"}`}></div>
          )}
        </div>
      ))}
    </div>
  );
}
