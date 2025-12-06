import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { BookOpen, Users, Star, ShoppingBag, Award, TrendingUp } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

interface CounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '' }: CounterProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isVisible, end, duration])

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

export function StatsMilestones() {
  const { data: booksData } = useQuery({
    queryKey: ['books'],
    queryFn: () => api.getBooks(),
  })

  const { data: authorsData } = useQuery({
    queryKey: ['authors'],
    queryFn: () => api.getAuthors(),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  })

  const books = booksData?.data || []
  const authors = authorsData?.data || []
  const categories = categoriesData?.data || []

  // Calculate stats
  const totalBooks = books.length
  const totalAuthors = authors.length
  const totalCategories = categories.length
  const averageRating = books.length > 0 
    ? books.reduce((sum, b) => sum + (b.averageRating || 0), 0) / books.length 
    : 4.5
  
  // Simulated stats (in real app, these would come from API)
  const simulatedStats = {
    happyCustomers: 10000 + totalBooks * 50,
    booksSold: 50000 + totalBooks * 100,
  }

  const stats = [
    {
      icon: BookOpen,
      value: totalBooks,
      label: 'Books Available',
      suffix: '+',
      gradient: 'from-blue-500 to-cyan-400',
      bgGradient: 'from-blue-500/20 to-cyan-400/20',
    },
    {
      icon: Users,
      value: simulatedStats.happyCustomers,
      label: 'Happy Readers',
      suffix: '+',
      gradient: 'from-purple-500 to-pink-400',
      bgGradient: 'from-purple-500/20 to-pink-400/20',
    },
    {
      icon: Star,
      value: Math.round(averageRating * 10) / 10,
      label: 'Average Rating',
      suffix: '/5',
      gradient: 'from-amber-500 to-orange-400',
      bgGradient: 'from-amber-500/20 to-orange-400/20',
      isDecimal: true,
    },
    {
      icon: ShoppingBag,
      value: simulatedStats.booksSold,
      label: 'Books Sold',
      suffix: '+',
      gradient: 'from-green-500 to-emerald-400',
      bgGradient: 'from-green-500/20 to-emerald-400/20',
    },
    {
      icon: Award,
      value: totalAuthors,
      label: 'Expert Authors',
      suffix: '+',
      gradient: 'from-rose-500 to-red-400',
      bgGradient: 'from-rose-500/20 to-red-400/20',
    },
    {
      icon: TrendingUp,
      value: totalCategories,
      label: 'Book Categories',
      suffix: '',
      gradient: 'from-indigo-500 to-violet-400',
      bgGradient: 'from-indigo-500/20 to-violet-400/20',
    },
  ]

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* Floating decorations */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-100 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-100 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
            Our Achievements
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Numbers That <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Inspire</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Join thousands of book lovers who trust us for their reading journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Icon */}
              <div className={`relative z-10 w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>

              {/* Value */}
              <div className="relative z-10 text-center">
                <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1`}>
                  {stat.isDecimal ? (
                    <span>{stat.value.toFixed(1)}{stat.suffix}</span>
                  ) : (
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  )}
                </div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>

              {/* Decorative dot */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-500 mb-4">Be part of our growing community</p>
          <a 
            href="/books"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all hover:-translate-y-1"
          >
            Start Your Collection
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
