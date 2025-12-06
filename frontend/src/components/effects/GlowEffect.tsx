import React, { useEffect, useRef } from 'react';

export const GlowEffect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      container.style.setProperty('--mouse-x', `${x}px`);
      container.style.setProperty('--mouse-y', `${y}px`);
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-white"
    >
      <div 
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `
            radial-gradient(
              800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
              rgba(29, 78, 216, 0.07),
              transparent 40%
            ),
            radial-gradient(
              600px circle at calc(var(--mouse-x, 50%) + 100px) calc(var(--mouse-y, 50%) + 100px), 
              rgba(147, 51, 234, 0.05),
              transparent 40%
            )
          `
        }}
      />
      
      {/* Aurora-like ambient background */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-400/20 blur-[100px] animate-blob" />
        <div className="absolute top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-purple-400/20 blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-[20%] left-[20%] w-[70%] h-[70%] rounded-full bg-indigo-400/20 blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
