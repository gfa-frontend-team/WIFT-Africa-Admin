import { useState, useEffect } from 'react';

// Simplified useToast hook since we don't have the full shadcn/ui toast system
type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

// Simple event emitter for toast
const listeners: Array<(toast: ToastProps) => void> = [];

export function toast(props: ToastProps) {
  listeners.forEach((listener) => listener(props));
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  useEffect(() => {
    const listener = (toast: ToastProps) => {
      setToasts((prev) => [...prev, toast]);
      // Auto dismiss after 3 seconds for simplicity in this mock
      setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 3000);
    };
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    toast,
    toasts,
  };
}
