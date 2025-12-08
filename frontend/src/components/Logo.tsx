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
    <Link 
      to="/" 
      className={`flex items-center gap-3 group shrink-0 ${isAuth ? 'gap-4' : 'gap-3'} ${className}`}
      aria-label="Inkwell Home"
    >
      <div className={`relative overflow-hidden transition-transform duration-300 group-hover:scale-105 ${getIconSize()}`}>
        <img 
          src="/logo.png" 
          alt="Inkwell" 
          className="w-full h-full object-cover" 
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
  );
}
