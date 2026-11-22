import type { ReactNode } from 'react';

export interface DragPreviewSize {
  width: number;
  height: number;
}

interface DragPreviewProps {
  size: DragPreviewSize;
  children: ReactNode;
}

export function DragPreview({ size, children }: DragPreviewProps) {
  return (
    <div
      style={{
        width: size.width,
        height: size.height,
        boxSizing: 'border-box',
      }}
      className="pointer-events-none overflow-hidden rounded-2xl bg-slate-950 shadow-2xl shadow-black/60 ring-2 ring-blue-500/70"
    >
      {children}
    </div>
  );
}
