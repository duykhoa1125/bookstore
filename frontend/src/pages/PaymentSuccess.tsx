import { useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Check, ShoppingBag, ArrowRight, Download } from 'lucide-react'

export default function PaymentSuccess() {
  const { orderId } = useParams<{ orderId: string }>()

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden text-center relative">
          {/* Success Header */}
          <div className="bg-emerald-500 p-12 relative overflow-hidden">
             <div className="absolute inset-0 bg-white/10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 2px, transparent 0)', backgroundSize: '24px 24px', opacity: 0.2 }}></div>
             <div className="relative z-10">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce-slow">
                   <Check className="w-12 h-12 text-emerald-500 stroke-[3]" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
                <p className="text-emerald-50 font-medium">Thank you for your purchase.</p>
             </div>
          </div>

          <div className="p-8">
             <p className="text-gray-500 mb-8 leading-relaxed">
               Your order <span className="font-mono font-bold text-gray-800">#{orderId?.slice(0, 8).toUpperCase()}</span> has been confirmed. 
               We've sent a receipt to your email address.
             </p>

             <div className="space-y-3">
               <Link
                 to="/orders"
                 className="block w-full py-4 text-white bg-gray-900 rounded-2xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
               >
                 <ShoppingBag className="w-5 h-5" />
                 View Order Details
               </Link>
               
               <Link
                 to="/books"
                 className="block w-full py-4 text-gray-600 bg-gray-50 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 group"
               >
                 Continue Shopping
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
