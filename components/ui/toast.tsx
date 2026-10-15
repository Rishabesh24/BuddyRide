"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback(
    ({ type, title, message, duration = 4000 }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none p-2"
      >
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />,
            error: <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />,
            warning: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />,
            info: <Info className="h-5 w-5 text-mobility-600 flex-shrink-0" />,
          };

          const borderColors = {
            success: "border-emerald-200 bg-white",
            error: "border-red-200 bg-white",
            warning: "border-amber-200 bg-white",
            info: "border-mobility-200 bg-white",
          };

          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex items-start space-x-3 rounded-xl border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-2",
                borderColors[toast.type]
              )}
            >
              {icons[toast.type]}
              <div className="flex-1">
                <p className="text-sm font-semibold text-commuter-900">{toast.title}</p>
                {toast.message && (
                  <p className="mt-0.5 text-xs text-commuter-600">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-commuter-400 hover:text-commuter-600 p-0.5 rounded"
                aria-label="Dismiss toast"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
