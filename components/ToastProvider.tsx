"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import Link from "next/link";

interface Toast {
    id: number;
    message: string;
    href?: string;
    linkLabel?: string;
}

interface ToastContextValue {
    showToast: (message: string, options?: { href?: string; linkLabel?: string }) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
    return useContext(ToastContext);
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const counter = useRef(0);

    const showToast = useCallback((message: string, options?: { href?: string; linkLabel?: string }) => {
        const id = ++counter.current;
        setToasts((prev) => [...prev, { id, message, ...options }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    function dismiss(id: number) {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 md:bottom-6">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 shadow-lg"
                    >
                        <span className="text-sm text-zinc-300">{toast.message}</span>
                        {toast.href && toast.linkLabel && (
                            <Link
                                href={toast.href}
                                onClick={() => dismiss(toast.id)}
                                className="shrink-0 text-sm font-medium text-lime-400 hover:text-lime-300"
                            >
                                {toast.linkLabel}
                            </Link>
                        )}
                        <button
                            onClick={() => dismiss(toast.id)}
                            className="shrink-0 text-zinc-600 hover:text-zinc-400"
                            aria-label="Dismiss"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
