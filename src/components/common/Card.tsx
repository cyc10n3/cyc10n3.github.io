import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  image?: string;
  imageAlt?: string;
  children: React.ReactNode;
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, image, imageAlt, children, hover = false, onClick, ...props }, ref) => {
    return (
      <div
        className={cn(
          'card',
          hover && 'card-hover cursor-pointer',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        ref={ref}
        {...props}
      >
        {image && (
          <div className="relative overflow-hidden rounded-t-xl">
            <img
              src={image}
              alt={imageAlt || title || 'Card image'}
              className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-6">
          {title && (
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
          )}
          {children}
        </div>
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;