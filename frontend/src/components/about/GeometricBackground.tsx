import { useEffect, useRef, useState } from 'react'

interface GeometricBackgroundProps {
  className?: string
}

export function GeometricBackground({ className = '' }: GeometricBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const animationFrameId = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Geometric shapes
    const shapes: Array<{
      x: number
      y: number
      size: number
      rotation: number
      rotationSpeed: number
      type: 'circle' | 'square' | 'triangle' | 'hexagon'
      color: string
      opacity: number
      vx: number
      vy: number
    }> = []

    // Initialize shapes
    for (let i = 0; i < 20; i++) {
      shapes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 60 + 20,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        type: ['circle', 'square', 'triangle', 'hexagon'][Math.floor(Math.random() * 4)] as any,
        color: ['#60a5fa', '#a78bfa', '#ec4899', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)],
        opacity: Math.random() * 0.3 + 0.1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      })
    }

    // Draw shapes
    const drawShape = (shape: typeof shapes[0]) => {
      ctx.save()
      ctx.translate(shape.x, shape.y)
      ctx.rotate(shape.rotation)
      ctx.strokeStyle = shape.color
      ctx.lineWidth = 2
      ctx.globalAlpha = shape.opacity

      switch (shape.type) {
        case 'circle':
          ctx.beginPath()
          ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2)
          ctx.stroke()
          break
        case 'square':
          ctx.strokeRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size)
          break
        case 'triangle':
          ctx.beginPath()
          ctx.moveTo(0, -shape.size / 2)
          ctx.lineTo(shape.size / 2, shape.size / 2)
          ctx.lineTo(-shape.size / 2, shape.size / 2)
          ctx.closePath()
          ctx.stroke()
          break
        case 'hexagon':
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i
            const x = (shape.size / 2) * Math.cos(angle)
            const y = (shape.size / 2) * Math.sin(angle)
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.stroke()
          break
      }

      ctx.restore()
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      shapes.forEach((shape) => {
        // Update position
        shape.x += shape.vx
        shape.y += shape.vy

        // Mouse interaction - shapes move away from cursor
        const dx = shape.x - mousePosition.x
        const dy = shape.y - mousePosition.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 150) {
          const force = (150 - distance) / 150
          shape.x += (dx / distance) * force * 2
          shape.y += (dy / distance) * force * 2
        }

        // Wrap around edges
        if (shape.x < -shape.size) shape.x = canvas.width + shape.size
        if (shape.x > canvas.width + shape.size) shape.x = -shape.size
        if (shape.y < -shape.size) shape.y = canvas.height + shape.size
        if (shape.y > canvas.height + shape.size) shape.y = -shape.size

        // Update rotation
        shape.rotation += shape.rotationSpeed

        // Draw
        drawShape(shape)
      })

      animationFrameId.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [mousePosition])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      className={`${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
