import { ReactNode, useState, useRef, MouseEvent } from 'react'

interface TiltCardProps {
  children: ReactNode
  className?: string
  maxTilt?: number
}

export function TiltCard({ children, className = '', maxTilt = 10 }: TiltCardProps) {
  const [transform, setTransform] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    const rotateX = (-y / rect.height) * maxTilt
    const rotateY = (x / rect.width) * maxTilt
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`)
  }

  const handleMouseLeave = () => {
    setTransform('')
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{ 
        transform,
        transformStyle: 'preserve-3d'
      }}
    >
      {children}
    </div>
  )
}
