import { cn } from '@/shared/lib';
import { FaXmark } from 'react-icons/fa6';
import { IconButton } from '../Buttons/IconButton';
import { type ToastTone, useToastStore } from './toast.store';

const toneStyles: Record<ToastTone, string> = {
  success: 'border-green-500/50',
  info: 'border-blue-500/50',
  error: 'border-red-500/50',
};

/** Рендерится один раз в корне приложения. */
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-20 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 md:bottom-6"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          role="status"
          className={cn(
            'pointer-events-auto flex items-center justify-between gap-3 rounded-xl border bg-neutral-900 px-4 py-3 text-sm text-white shadow-lg',
            toneStyles[item.tone],
          )}
        >
          <span>{item.message}</span>
          <IconButton
            size="sm"
            variant="ghost"
            ariaLabel="Закрыть уведомление"
            icon={<FaXmark />}
            onClick={() => dismiss(item.id)}
          />
        </div>
      ))}
    </div>
  );
}
