import React from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  speed?: number; // duration in seconds
  pauseOnHover?: boolean;
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({ 
  children, 
  direction = 'left', 
  speed = 40, 
  pauseOnHover = true,
  className = ''
}) => {
  return (
    <div className={`flex overflow-hidden relative w-full ${className}`}>
      <div 
        className={`flex min-w-full gap-6 py-4 animate-scroll-${direction} ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
        style={{ 
          animationDuration: `${speed}s`,
        }}
      >
        {children}
        {/* Duplicate content for seamless loop */}
        {children}
      </div>
    </div>
  );
};
