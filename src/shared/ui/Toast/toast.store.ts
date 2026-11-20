import { create } from 'zustand';

export type ToastTone = 'success' | 'info' | 'error';

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: ToastItem[];
  push: (message: string, tone: ToastTone, duration?: number) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (message, tone, duration = 3000) => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts.slice(-2), { id, message, tone }] }));
    setTimeout(() => get().dismiss(id), duration);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}));

/** Вызывается из любого места: toast.success('+10 XP') */
export const toast = {
  success: (message: string) => useToastStore.getState().push(message, 'success'),
  info: (message: string) => useToastStore.getState().push(message, 'info'),
  error: (message: string) => useToastStore.getState().push(message, 'error', 5000),
};
