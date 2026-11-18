import { cn } from '@/shared/lib';
import { type ImgHTMLAttributes, type ReactNode, forwardRef, useState } from 'react';

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  fallback?: ReactNode;
  zoomOnHover?: boolean;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      className,
      containerClassName,
      alt = '',
      fallback,
      zoomOnHover = true,
      loading = 'lazy',
      onError,
      ...props
    },
    ref,
  ) => {
    const [failedSrc, setFailedSrc] = useState<string>();

    if (fallback !== undefined && props.src && failedSrc === props.src) {
      return (
        <div className={cn('overflow-hidden flex-center', containerClassName)}>{fallback}</div>
      );
    }

    return (
      <div className={cn('overflow-hidden', containerClassName)}>
        <img
          ref={ref}
          alt={alt}
          loading={loading}
          sizes={loading === 'lazy' ? 'auto' : undefined}
          className={cn(
            'w-full h-full object-cover transition-transform',
            zoomOnHover && 'hover:scale-105',
            className,
          )}
          onError={(event) => {
            setFailedSrc(props.src);
            onError?.(event);
          }}
          {...props}
        />
      </div>
    );
  },
);
