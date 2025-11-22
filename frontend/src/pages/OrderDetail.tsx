import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Package, Calendar, MapPin, CreditCard, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
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
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Payment failed')
    },
  })

  const order = orderData?.data

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg">Order not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-500 mt-1">Order ID: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{order.id}</span></p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Status:</span>
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide ${getStatusColor(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                Items ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 flex gap-6 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    {item.book.imageUrl ? (
                      <img
                        src={item.book.imageUrl}
                        alt={item.book.title}
                        className="w-24 h-32 object-cover rounded-md shadow-sm"
                      />
                    ) : (
                      <div className="w-24 h-32 bg-gray-200 rounded-md flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.book.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {item.book.category?.name} • {item.book.publisher?.name}
                    </p>
                    <div className="flex justify-between items-end">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Quantity:</span> {item.quantity} × ${item.price.toFixed(2)}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <span className="font-medium text-gray-600">Subtotal</span>
              <span className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Info & Payment */}
        <div className="lg:col-span-1 space-y-6">
          {/* Payment Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                Payment Info
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                <p className="font-medium text-gray-900 flex items-center">
                  {order.payment?.paymentMethod?.name || 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPaymentStatusColor(order.payment?.status || 'PENDING')}`}>
                    {order.payment?.status || 'PENDING'}
                  </span>
                  {order.payment?.status === 'COMPLETED' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>

              {order.payment?.status === 'PENDING' && order.status !== 'CANCELLED' && (
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={handlePayment}
                    disabled={processPaymentMutation.isPending}
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {processPaymentMutation.isPending ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </span>
                    ) : (
                      <>
                        Pay Now (${order.total.toFixed(2)})
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Secure payment processing
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Shipping Details
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Address</p>
                <p className="text-gray-900">{order.shippingAddress}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Date</p>
                <p className="text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {new Date(order.orderDate).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Order Confirmation Info (if confirmed) */}
          {order.confirmedBy && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                  Confirmation
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {order.confirmedBy.fullName.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Confirmed by {order.confirmedBy.fullName}</p>
                    <p className="text-xs text-gray-500">{order.confirmedBy.email}</p>
                    {order.confirmedBy.position && (
                      <p className="text-xs text-blue-600 mt-1">{order.confirmedBy.position}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
