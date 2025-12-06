import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Package, Calendar, MapPin, CreditCard, CheckCircle, Clock, XCircle, Truck, ArrowRight, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.getOrder(id!),
    enabled: !!id,
  })

  const processPaymentMutation = useMutation({
    mutationFn: (paymentId: string) => api.processPayment(paymentId, 'COMPLETED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      toast.success('Payment processed successfully!')
      navigate(`/payment-success/${id}`)
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Payment failed')
    },
  })

  const order = orderData?.data

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 border border-blue-200'
      case 'SHIPPED':
        return 'bg-purple-50 text-purple-700 border border-purple-200'
      case 'DELIVERED':
        return 'bg-green-50 text-green-700 border border-green-200'
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
     switch (status) {
       case 'PENDING': return <Clock className="w-4 h-4" />
       case 'PROCESSING': return <Package className="w-4 h-4" />
       case 'SHIPPED': return <Truck className="w-4 h-4" />
       case 'DELIVERED': return <CheckCircle className="w-4 h-4" />
       case 'CANCELLED': return <XCircle className="w-4 h-4" />
       default: return <Package className="w-4 h-4" />
     }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700'
      case 'COMPLETED':
        return 'bg-green-50 text-green-700'
      case 'FAILED':
        return 'bg-red-50 text-red-700'
      case 'REFUNDED':
        return 'bg-gray-50 text-gray-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  const handlePayment = () => {
    if (order?.payment?.id) {
      processPaymentMutation.mutate(order.payment.id)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20 bg-gray-50 rounded-3xl">
          <p className="text-gray-600 text-lg">Order not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="p-3 bg-blue-50 rounded-2xl">
                  <Package className="w-8 h-8 text-blue-600" />
               </div>
               <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Order Details</h1>
            </div>
            <p className="text-gray-500 ml-1">Order ID: <span className="font-mono font-bold text-gray-700 ml-1">#{order.id.slice(0, 8).toUpperCase()}</span></p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-gray-100">
            <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm ${getStatusColor(order.status)}`}>
               {getStatusIcon(order.status)}
               {order.status}
            </span>
            <span className="text-sm text-gray-400 font-medium">
               {new Date(order.orderDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                Items Purchased
                <span className="ml-3 px-3 py-1 bg-gray-200/50 text-gray-600 rounded-full text-xs">
                   {order.items.length}
                </span>
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <Link to={`/books/${item.book.id}`} key={item.id} className="p-8 flex gap-6 hover:bg-gray-50 transition-colors group">
                  <div className="flex-shrink-0 relative overflow-hidden rounded-xl border border-gray-100 shadow-sm w-24 h-32">
                    {item.book.imageUrl ? (
                      <img
                        src={item.book.imageUrl}
                        alt={item.book.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight group-hover:text-blue-600 transition-colors">{item.book.title}</h3>
                      <p className="text-sm text-gray-500">
                         by {item.book.authors?.map(a => a.author.name).join(', ') || 'Unknown Author'}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <span>x{item.quantity}</span>
                        <span className="w-px h-3 bg-gray-300"></span>
                        <span>${item.price.toFixed(2)}</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
              <span className="font-semibold text-gray-500">Subtotal</span>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Info & Payment */}
        <div className="lg:col-span-1 space-y-6">
          {/* Payment Information */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-10">
               <CreditCard className="w-24 h-24 transform rotate-12" />
            </div>
            
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Payment Details
              </h2>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Method</span>
                <span className="font-bold text-gray-900 flex items-center gap-2">
                   {order.payment?.paymentMethod?.name || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Status</span>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${getPaymentStatusColor(order.payment?.status || 'PENDING')}`}>
                    {order.payment?.status === 'COMPLETED' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {order.payment?.status || 'PENDING'}
                  </span>
                </div>
              </div>

              {order.payment?.status === 'PENDING' && order.status !== 'CANCELLED' && (
                <div className="pt-6 mt-2 border-t border-gray-100">
                  <button
                    onClick={handlePayment}
                    disabled={processPaymentMutation.isPending}
                    className="w-full group relative overflow-hidden bg-gray-900 text-white px-6 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                     <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                     <span className="relative z-10 flex items-center justify-center gap-2">
                        {processPaymentMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Pay Now
                            <span className="bg-white/20 px-2 py-0.5 rounded text-sm">${order.total.toFixed(2)}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                     </span>
                  </button>
                  <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400 font-medium">
                     <ShieldCheck className="w-3 h-3" />
                     Secure encrypted payment
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Shipping Details
              </h2>
            </div>
            <div className="p-8">
               <div className="flex items-start gap-4 mb-6">
                  <div className="p-2.5 bg-gray-50 rounded-xl">
                      <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                     <p className="text-sm text-gray-500 font-medium mb-1">Delivery Address</p>
                     <p className="text-gray-900 font-medium leading-relaxed">{order.shippingAddress}</p>
                  </div>
               </div>
               
               <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gray-50 rounded-xl">
                      <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                     <p className="text-sm text-gray-500 font-medium mb-1">Order Date</p>
                     <p className="text-gray-900 font-medium">
                        {new Date(order.orderDate).toLocaleDateString(undefined, { 
                           weekday: 'long', 
                           year: 'numeric', 
                           month: 'long', 
                           day: 'numeric',
                           hour: '2-digit',
                           minute: '2-digit'
                        })}
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
