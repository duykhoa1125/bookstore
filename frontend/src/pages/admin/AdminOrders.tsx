import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Package, Loader2, Eye, Search, X } from 'lucide-react'
import Pagination from '../../components/Pagination'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function AdminOrders() {
  const queryClient = useQueryClient()
  const [pendingById, setPendingById] = useState<Record<string, boolean>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'>('all')
  const itemsPerPage = 15

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.getAllOrders(),
  })

  const confirmOrderMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' }) =>
      api.confirmOrder(id, status),
    onMutate: async ({ id, status }) => {
      setPendingById((m) => ({ ...m, [id]: true }))
      await queryClient.cancelQueries({ queryKey: ['admin-orders'] })
      const previous = queryClient.getQueryData(['admin-orders']) as any
      // Optimistically update order status in cache
      queryClient.setQueryData(['admin-orders'], (oldData: any) => {
        if (!oldData?.data) return oldData
        const updated = oldData.data.map((o: any) =>
          o.id === id ? { ...o, status } : o
        )
        return { ...oldData, data: updated }
      })
      return { previous, id }
    },
    onError: (error: any, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['admin-orders'], context.previous)
      }
      toast.error(error?.response?.data?.message || 'Failed to update order status')
    },
    onSettled: (_data, _err, variables, context) => {
      if (variables?.id) {
        setPendingById((m) => {
          const { [variables.id]: _removed, ...rest } = m
          return rest
        })
      } else if (context?.id) {
        setPendingById((m) => {
          const { [context.id]: _removed, ...rest } = m
          return rest
        })
      }
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success('Order status updated successfully')
    },
  })

  const orders = ordersData?.data || []

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    return orders.filter((order: any) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = !searchQuery ||
        order.id.toLowerCase().includes(searchLower) ||
        order.user?.fullName?.toLowerCase().includes(searchLower) ||
        order.user?.email?.toLowerCase().includes(searchLower)

      // Status filter
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, statusFilter])

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredOrders.slice(start, start + itemsPerPage)
  }, [filteredOrders, currentPage, itemsPerPage])

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

  const handleStatusChange = (orderId: string, newStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') => {
    confirmOrderMutation.mutate({ id: orderId, status: newStatus })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto p-8 text-slate-800">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">All Orders</h1>
        <p className="text-gray-500 mt-1 font-medium">Manage and track customer order fulfillment.</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        {/* Search Box */}
        <div className="flex-1">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search by order ID, customer name or email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-4 pr-16 h-11 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-300"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {searchQuery && <div className="h-4 w-px bg-gray-200"></div>}
              <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex-shrink-0">
          <div className="bg-white border border-gray-200 p-1 rounded-xl flex items-center h-11 shadow-sm overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'PROCESSING', label: 'Processing' },
              { id: 'SHIPPED', label: 'Shipped' },
              { id: 'DELIVERED', label: 'Delivered' },
              { id: 'CANCELLED', label: 'Cancelled' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => { setStatusFilter(filter.id as typeof statusFilter); setCurrentPage(1); }}
                className={`px-3 h-full rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center whitespace-nowrap ${
                  statusFilter === filter.id
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      {(searchQuery || statusFilter !== 'all') && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Found <span className="font-semibold text-gray-700">{filteredOrders.length}</span> orders
          </p>
          <button 
            onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCurrentPage(1); }}
            className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg shadow-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100/50">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50 bg-white/30">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                    <span className="font-mono text-gray-500">#</span>{order.id.slice(0, 8)}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-bold text-gray-900 mb-0.5">{order.user?.fullName || 'N/A'}</div>
                      <div className="text-xs text-gray-400 font-medium">{order.user?.email}</div>
                      {order.user?.phone && <div className="text-xs text-gray-400 font-medium">{order.user.phone}</div>}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 cursor-pointer shadow-sm transition-all ${getStatusColor(order.status)}`}
                        disabled={!!pendingById[order.id]}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      {pendingById[order.id] && (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 font-medium">
                    <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">{order.items.length} items</span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center justify-center w-9 h-9 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-200 shadow-sm"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Package className="w-16 h-16 text-gray-200 mb-4" />
              <p className="text-lg font-medium text-gray-400">No recent orders</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={orders.length}
            />
          </div>
        )}
      </div>
    </div>
  )
}

