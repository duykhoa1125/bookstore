import { ReactNode } from 'react'

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
}

export function AnimatedText({ text, className = '', delay = 0 }: AnimatedTextProps) {
  const words = text.split(' ')
  
  return (
    <span className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-2 md:mr-4">
          {word.split('').map((char, charIndex) => {
            const totalDelay = delay + wordIndex * 100 + charIndex * 50
            const delayClass = totalDelay <= 100 ? 'animation-delay-100' :
                              totalDelay <= 200 ? 'animation-delay-200' :
                              totalDelay <= 300 ? 'animation-delay-300' :
                              totalDelay <= 400 ? 'animation-delay-400' : 'animation-delay-500'
            
            return (
              <span
                key={charIndex}
                className={`inline-block animate-slideInUp opacity-0 ${delayClass}`}
                style={{ animationFillMode: 'forwards' }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            )
          })}
        </span>
      ))}
    </span>
  )
}
