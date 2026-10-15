import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold uppercase tracking-wider text-commuter-700"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          className={cn(
            "flex h-11 w-full rounded-lg border border-commuter-200 bg-white px-3.5 py-2 text-sm text-commuter-900 placeholder:text-commuter-400 transition-colors focus-visible:outline-none focus-visible:border-mobility-600 focus-visible:ring-2 focus-visible:ring-mobility-100 disabled:cursor-not-allowed disabled:bg-commuter-50 disabled:opacity-50",
            error && "border-red-500 focus-visible:border-red-600 focus-visible:ring-red-100",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
