import { Link, useParams } from 'react-router-dom'
import { Check, ShoppingBag, ArrowRight, Mail, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

// Confetti particle component
function ConfettiParticle({ delay, left }: { delay: number; left: number }) {
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  const color = colors[Math.floor(Math.random() * colors.length)]
  const size = 8 + Math.random() * 8
  const duration = 2 + Math.random() * 2

  return (
    <div
      className="absolute animate-confetti"
      style={{
        left: `${left}%`,
        top: '-20px',
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  )
}

export default function PaymentSuccess() {
  const { orderId } = useParams<{ orderId: string }>()
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50/30 px-4 py-12 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiParticle 
              key={i} 
              delay={Math.random() * 2} 
              left={Math.random() * 100} 
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-500/10 overflow-hidden text-center relative">
          {/* Success Header */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-12 relative overflow-hidden">
             <div className="absolute inset-0 bg-white/10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 2px, transparent 0)', backgroundSize: '24px 24px', opacity: 0.15 }}></div>
             
             {/* Sparkle decorations */}
             <Sparkles className="absolute top-6 left-6 w-6 h-6 text-white/30 animate-pulse" />
             <Sparkles className="absolute top-10 right-10 w-4 h-4 text-white/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
             <Sparkles className="absolute bottom-8 left-12 w-5 h-5 text-white/25 animate-pulse" style={{ animationDelay: '1s' }} />
             
             <div className="relative z-10">
                <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-success-bounce">
                   <Check className="w-14 h-14 text-emerald-500 stroke-[3]" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
                <p className="text-emerald-50 font-medium text-lg">Thank you for your purchase 🎉</p>
             </div>
          </div>

          <div className="p-8">
             {/* Order ID Badge */}
             <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-6">
               <span className="text-sm text-gray-500">Order</span>
               <span className="font-mono font-bold text-gray-900">#{orderId?.slice(0, 8).toUpperCase()}</span>
             </div>

             <p className="text-gray-600 mb-6 leading-relaxed">
               Your order has been confirmed and is being processed.
             </p>

             {/* Email Notification */}
             <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8 flex items-start gap-3 text-left">
               <div className="p-2 bg-blue-100 rounded-xl">
                 <Mail className="w-5 h-5 text-blue-600" />
               </div>
               <div>
                 <p className="font-semibold text-blue-900 text-sm">Confirmation Email Sent</p>
                 <p className="text-blue-700 text-sm mt-1">Check your inbox for order details and tracking information.</p>
               </div>
             </div>

             <div className="space-y-3">
               <Link
                 to={`/orders/${orderId}`}
                 className="block w-full py-4 text-white bg-gray-900 rounded-2xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
               >
                 <ShoppingBag className="w-5 h-5" />
                 View Order Details
               </Link>
               
               <Link
                 to="/books"
                 className="block w-full py-4 text-gray-600 bg-gray-100 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 group"
               >
                 Continue Shopping
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
        @keyframes success-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-success-bounce {
          animation: success-bounce 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
