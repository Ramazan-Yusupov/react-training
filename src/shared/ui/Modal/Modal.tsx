import { cn } from '@/shared/lib';
import { type ReactNode, useEffect, useRef } from 'react';
import { FaXmark } from 'react-icons/fa6';
import { IconButton } from '../Buttons/IconButton';
import { Typography } from '../Typography/Typography';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdrop?: boolean;
  className?: string;
}

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Нативный <dialog>: фокус, Escape и затемнение фона обрабатывает браузер
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
      className={cn(
        'm-auto w-[calc(100%-2rem)] rounded-2xl border border-white/10 bg-neutral-900 p-0 text-white',
        'backdrop:bg-black/70 backdrop:backdrop-blur-sm',
        sizes[size],
        className,
      )}
    >
      <div className="flex flex-col gap-4 p-5">
        <div className="flex-between gap-3">
          {title ? <Typography as="h5" align="start" text={title} /> : <span />}
          <IconButton
            size="sm"
            variant="ghost"
            ariaLabel="Закрыть"
            icon={<FaXmark />}
            onClick={onClose}
          />
        </div>
        <div className="flex flex-col gap-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </dialog>
  );
}
