import { cn } from '@/shared/lib';

interface LoadingUIProps {
  text?: string;
  isLoading?: boolean;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const spinnerSizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-4',
};

export function LoadingUI({
  isLoading,
  text = 'Loading...',
  fullScreen = false,
  size = 'md',
  className,
}: LoadingUIProps) {
  if (!isLoading) return null;

  const content = (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-3 animate-pulse', className)}
    >
      <div
        className={cn(
          'border-blue-500 border-t-transparent rounded-full animate-spin',
          spinnerSizes[size],
        )}
      />
      {text && <span className="text-sm text-gray-400 font-medium">{text}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
