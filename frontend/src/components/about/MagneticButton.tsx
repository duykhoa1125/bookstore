import { ReactNode, useState, useRef, MouseEvent } from 'react'
import { Link } from 'react-router-dom'

interface MagneticButtonProps {
  children: ReactNode
  href: string
  className?: string
  maxDistance?: number
}

export function MagneticButton({ 
  children, 
  href, 
  className = '',
  maxDistance = 15 
}: MagneticButtonProps) {
  const [transform, setTransform] = useState('')
  const buttonRef = useRef<HTMLAnchorElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!buttonRef.current) return
    
    const rect = buttonRef.current.getBoundingClientRect()
    const buttonCenterX = rect.left + rect.width / 2
    const buttonCenterY = rect.top + rect.height / 2
    
    const distanceX = e.clientX - buttonCenterX
    const distanceY = e.clientY - buttonCenterY
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)
    
    // Only apply magnetic effect within 150px radius
    if (distance < 150) {
      const strength = Math.max(0, 1 - distance / 150)
      const translateX = (distanceX / distance) * strength * maxDistance
      const translateY = (distanceY / distance) * strength * maxDistance
      
      setTransform(`translate(${translateX}px, ${translateY}px)`)
    } else {
      setTransform('')
    }
  }

  const handleMouseLeave = () => {
    setTransform('')
  }

  return (
    <div 
      className="inline-block"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        ref={buttonRef}
        to={href}
        className={`inline-block transition-transform duration-200 ease-out ${className}`}
        style={{ transform }}
      >
        {children}
      </Link>
    </div>
  )
}
