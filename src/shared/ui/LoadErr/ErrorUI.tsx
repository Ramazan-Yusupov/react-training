import { Button } from '../Buttons/Button';

interface ErrorProps {
  text?: string;
  isError?: string | boolean;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorUI({
  isError,
  text = 'Ошибка',
  onRetry,
  retryText = 'Повторить',
}: ErrorProps) {
  return isError ? (
    <div role="alert" className="flex flex-col items-center gap-2">
      <div className="border-2 border-red-800 text-red-700 p-1 rounded-full text-center max-w-full px-4 whitespace-nowrap">
        {text}
      </div>
      {onRetry && <Button size="sm" variant="ghost" title={retryText} onClick={onRetry} />}
    </div>
  ) : null;
}
