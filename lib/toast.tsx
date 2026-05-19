"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "./utils";

export type ToastTone = "success" | "info" | "warn" | "danger";

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastApi {
  toast: (message: string, tone?: ToastTone) => void;
  success: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  danger: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const ICON: Record<ToastTone, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
  warn: <AlertTriangle className="h-4 w-4" />,
  danger: <AlertTriangle className="h-4 w-4" />,
};

const TONE_STYLES: Record<ToastTone, string> = {
  success: "bg-accent-600 text-white",
  info: "bg-brand-700 text-white",
  warn: "bg-warn-500 text-white",
  danger: "bg-danger-500 text-white",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = ++idRef.current;
      setItems((prev) => [...prev, { id, tone, message }].slice(-4));
      // 3.5 saniye sonra otomatik kapan.
      setTimeout(() => remove(id), 3500);
    },
    [remove],
  );

  const api = useMemo<ToastApi>(
    () => ({
      toast: push,
      success: (m) => push(m, "success"),
      info: (m) => push(m, "info"),
      warn: (m) => push(m, "warn"),
      danger: (m) => push(m, "danger"),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster items={items} onClose={remove} />
    </ToastContext.Provider>
  );
}

function Toaster({
  items,
  onClose,
}: {
  items: ToastItem[];
  onClose: (id: number) => void;
}) {
  // Bottom nav ile çakışmasın: mobilde alt navigasyonun üstünde otur.
  return (
    <div className="fixed inset-x-0 bottom-20 md:bottom-6 md:right-6 md:inset-auto md:left-auto z-50 flex flex-col items-center md:items-end gap-2 px-4 pointer-events-none safe-bottom">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto w-full md:w-auto md:max-w-sm rounded-2xl shadow-pop px-4 py-3 flex items-start gap-2.5 text-sm",
            TONE_STYLES[t.tone],
          )}
          role="status"
        >
          <div className="mt-0.5">{ICON[t.tone]}</div>
          <p className="flex-1 leading-snug">{t.message}</p>
          <button
            type="button"
            onClick={() => onClose(t.id)}
            aria-label="Bildirimi kapat"
            className="opacity-80 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
