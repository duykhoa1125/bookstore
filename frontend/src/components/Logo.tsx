import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  variant?: 'header' | 'footer' | 'mobile' | 'auth';
  showText?: boolean;
}

export default function Logo({ className = '', variant = 'header', showText = true }: LogoProps) {
  const isFooter = variant === 'footer';
  const isMobile = variant === 'mobile';
  const isAuth = variant === 'auth';

  const getIconSize = () => {
    if (isMobile) return 'w-8 h-8 rounded-lg';
    if (isAuth) return 'w-16 h-16 rounded-2xl shadow-lg shadow-black/20';
    return 'w-10 h-10 sm:w-12 sm:h-12 rounded-xl';
  };

  const getTextStyle = () => {
    if (isAuth) return 'text-3xl text-white group-hover:text-blue-300';
    if (isFooter) return 'text-2xl text-white group-hover:text-blue-400';
    return 'text-xl sm:text-2xl text-gray-900 group-hover:text-blue-600';
  };

  return (
    <>
      {/* Cart running animation styles */}
      <style>{`
        @keyframes cartRun {
          0% { transform: translateX(0) rotate(0deg); }
          15% { transform: translateX(3px) rotate(-2deg); }
          30% { transform: translateX(6px) rotate(1deg); }
          45% { transform: translateX(8px) rotate(-1deg); }
          60% { transform: translateX(6px) rotate(0.5deg); }
          75% { transform: translateX(4px) rotate(-0.5deg); }
          100% { transform: translateX(0) rotate(0deg); }
        }
        
        @keyframes cartWobble {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-2px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-1px); }
        }
        
        @keyframes wheelSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes cartGlow {
          0%, 100% { filter: drop-shadow(0 0 0 transparent); }
          50% { filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.4)); }
        }
        
        .logo-container {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .group:hover .logo-container {
          animation: cartRun 0.6s ease-in-out, cartGlow 0.6s ease-in-out;
        }
        
        .logo-image {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .group:hover .logo-image {
          animation: cartWobble 0.3s ease-in-out 2;
        }
      `}</style>
      
      <Link 
        to="/" 
        className={`flex items-center gap-3 group shrink-0 ${isAuth ? 'gap-4' : 'gap-3'} ${className}`}
        aria-label="Inkwell Home"
      >
        <div className={`logo-container relative overflow-visible ${getIconSize()}`}>
          <img 
            src="/logo.png" 
            alt="Inkwell" 
            className="logo-image w-full h-full object-cover rounded-xl" 
          />
        </div>
      
      {showText && !isMobile && (
        <span 
          className={`tracking-tight transition-colors duration-300 ${getTextStyle()}`} 
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic' }}
        >
          Inkwell
        </span>
      )}
      {showText && isMobile && (
        <span className="text-xl text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic' }}>Inkwell</span>
      )}
      </Link>
    </>
  );
}
