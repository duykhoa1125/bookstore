import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Package, Eye, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function AdminOrders() {
  const queryClient = useQueryClient()
  const [pendingById, setPendingById] = useState<Record<string, boolean>>({})

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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">All Orders</h1>
        <p className="text-gray-600 mt-2">Manage and track all customer orders</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.id.slice(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <div className="font-medium text-gray-900">{order.user?.fullName || 'N/A'}</div>
                    <div className="text-xs text-gray-400">{order.user?.email}</div>
                    {order.user?.phone && <div className="text-xs text-gray-400">{order.user.phone}</div>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.orderDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  ${order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full border-0 ${getStatusColor(order.status)}`}
                    disabled={!!pendingById[order.id]}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                  {pendingById[order.id] && (
                    <Loader2 className="w-4 h-4 text-gray-400 ml-2 inline align-middle animate-spin" aria-label="Updating status" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.items.length} item(s)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/orders/${order.id}`}
                    className="text-blue-600 hover:text-blue-900 p-2"
                    title="View Order Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No orders found</p>
          </div>
        )}
      </div>
    </div>
  )
}

