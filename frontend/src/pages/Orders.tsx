import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Link } from 'react-router-dom'
import { Package, Calendar, ChevronRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'

export default function Orders() {
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.getOrders(),
  })

  const orders = ordersData?.data || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'SHIPPED':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'DELIVERED':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
     switch (status) {
       case 'PENDING': return <Clock className="w-3.5 h-3.5" />
       case 'PROCESSING': return <Package className="w-3.5 h-3.5" />
       case 'SHIPPED': return <Truck className="w-3.5 h-3.5" />
       case 'DELIVERED': return <CheckCircle className="w-3.5 h-3.5" />
       case 'CANCELLED': return <XCircle className="w-3.5 h-3.5" />
       default: return <Package className="w-3.5 h-3.5" />
     }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-10">
             <div className="p-3 bg-indigo-50 rounded-2xl">
                <Package className="w-8 h-8 text-indigo-600" />
             </div>
             <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Order History</h1>
                <p className="text-gray-500 mt-1">Track and manage your recent purchases</p>
             </div>
          </div>
    
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't placed any orders yet. Start exploring our collection to find your next favorite book.</p>
              <Link
                to="/books"
                className="inline-flex items-center px-8 py-3.5 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="group block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-blue-100 active:scale-[0.99]"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                         <h3 className="text-lg font-bold text-gray-900 font-mono">#{order.id.slice(0, 8).toUpperCase()}</h3>
                         <span
                           className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                             order.status
                           )}`}
                         >
                           {getStatusIcon(order.status)}
                           {order.status}
                         </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 gap-4">
                        <div className="flex items-center gap-1.5">
                           <Calendar className="w-4 h-4" />
                           {new Date(order.orderDate).toLocaleDateString(undefined, {
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric'
                           })}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                        <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                      <div>
                         <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                         <p className="text-2xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                         <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
    </div>
  )
}
