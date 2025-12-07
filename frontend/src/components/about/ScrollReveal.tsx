import { ReactNode, useEffect, useRef, useState } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  threshold?: number
}

export function ScrollReveal({ children, className = '', threshold = 0.3 }: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      className={`transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-20'
      } ${className}`}
    >
      {children}
    </div>
  )
}
