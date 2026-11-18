import { cn } from '@/shared/lib';

/** Общий вид полей ввода (Input, Textarea, Select). */
export function getFieldClass(hasError: boolean) {
  return cn(
    'w-full bg-transparent text-white placeholder:text-gray-500 outline-none transition-all',
    'border-2 rounded-xl px-4 py-2.5',
    'focus:border-slate-500 focus:ring-2 focus:ring-blue-500/20',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    hasError ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10',
  );
}
