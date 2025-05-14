
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";

export function useToast() {
  return {
    toast: sonnerToast,
    toaster: SonnerToaster,
  };
}

// Re-export toast for convenience
export const toast = sonnerToast;
