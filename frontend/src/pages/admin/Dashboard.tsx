import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  BookOpen,
  Crown,
  Calendar
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444']
const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  PROCESSING: '#3b82f6',
  SHIPPED: '#22c55e',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444'
}

export default function AdminDashboardOverview() {
  const [timeRange, setTimeRange] = useState<'6M' | '30D' | '7D' | 'Yesterday'>('6M')
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false)

  // Fetch data for statistics
  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.getAllOrders(),
  })

  const { data: booksData } = useQuery({
    queryKey: ['books'],
    queryFn: () => api.getBooks({}),
  })

  const orders = ordersData?.data || []
  const books = booksData?.data || []

  const {
    filteredOrders,
    revenueData,
    ordersStatusData,
    categoryData,
    topCustomersData,
    totalRevenue,
    totalOrders,
    lowStockBooks,
    uniqueCustomers,
    recentOrders,
    topSellingBooks
  } = useMemo(() => {
    const now = new Date()
    const filtered = orders.filter((order: any) => {
      const orderDate = new Date(order.orderDate)
      if (timeRange === '6M') {
        const date = new Date(); date.setMonth(now.getMonth() - 6); date.setDate(1); date.setHours(0,0,0,0)
        return orderDate >= date
      }
      if (timeRange === '30D') {
        const date = new Date(); date.setDate(now.getDate() - 30); date.setHours(0,0,0,0)
        return orderDate >= date
      }
      if (timeRange === '7D') {
        const date = new Date(); date.setDate(now.getDate() - 7); date.setHours(0,0,0,0)
        return orderDate >= date
      }
      if (timeRange === 'Yesterday') {
        const start = new Date(); start.setDate(now.getDate() - 1); start.setHours(0,0,0,0)
        const end = new Date(); end.setDate(now.getDate() - 1); end.setHours(23,59,59,999)
        return orderDate >= start && orderDate <= end
      }
      return true
    })

    // 1. Revenue Data
    const revenueMap = new Map<string, number>()
    
    // Initialize map with empty values to ensure continuity
    if (timeRange === '6M') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(now.getMonth() - i);
        const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        revenueMap.set(key, 0)
      }
    } else if (timeRange === '30D' || timeRange === '7D') {
      const days = timeRange === '30D' ? 30 : 7
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(); d.setDate(now.getDate() - i);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        revenueMap.set(key, 0)
      }
    } else if (timeRange === 'Yesterday') {
      for (let i = 0; i < 24; i++) {
        const key = `${i.toString().padStart(2, '0')}:00`
        revenueMap.set(key, 0)
      }
    }

    filtered.forEach((order: any) => {
      if (order.payment?.status !== 'COMPLETED') return
      const date = new Date(order.orderDate)
      let key = ''
      if (timeRange === '6M') {
        key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      } else if (timeRange === '30D' || timeRange === '7D') {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      } else if (timeRange === 'Yesterday') {
        key = `${date.getHours().toString().padStart(2, '0')}:00`
      }
      
      if (revenueMap.has(key)) {
        revenueMap.set(key, (revenueMap.get(key) || 0) + order.payment.total)
      }
    })

    const revenue = Array.from(revenueMap.entries()).map(([monthDisplay, revenue]) => ({
      monthDisplay,
      revenue
    }))

    // 2. Orders Status
    const statusMap = new Map<string, number>()
    filtered.forEach((order: any) => {
      statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1)
    })
    const statusData = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count
    }))

    // 3. Sales by Category
    const categoryMap = new Map<string, { name: string, totalSales: number }>()
    filtered.forEach((order: any) => {
      if (order.status === 'CANCELLED') return
      order.items?.forEach((item: any) => {
        const book = item.book || books.find((b: any) => b.id === item.bookId)
        if (book?.category) {
          const catName = book.category.name
          const current = categoryMap.get(catName) || { name: catName, totalSales: 0 }
          current.totalSales += (item.price || book.price) * item.quantity
          categoryMap.set(catName, current)
        }
      })
    })
    const catData = Array.from(categoryMap.values())
      .sort((a, b) => b.totalSales - a.totalSales)

    // 4. Top Customers
    const customerMap = new Map<string, { id: string, fullName: string, orderCount: number, totalSpent: number }>()
    filtered.forEach((order: any) => {
      if (order.status === 'CANCELLED' || order.payment?.status !== 'COMPLETED') return
      const userId = order.userId
      if (!userId) return
      
      const current = customerMap.get(userId) || { 
        id: userId, 
        fullName: order.user?.fullName || 'Unknown', 
        orderCount: 0, 
        totalSpent: 0 
      }
      current.orderCount += 1
      current.totalSpent += order.payment.total
      customerMap.set(userId, current)
    })
    const custData = Array.from(customerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)

    // 5. Stats
    const totalRev = filtered.reduce((sum: number, order: any) => {
      const paymentTotal = order?.payment?.status === 'COMPLETED' ? order.payment.total : 0
      return sum + (paymentTotal || 0)
    }, 0)

    const totalOrd = filtered.length
    const lowStock = books.filter((b: any) => b.stock < 10).length // This is global, not time dependent, but okay

    const customerIds = new Set<string>()
    filtered.forEach((o: any) => { if (o.userId) customerIds.add(o.userId) })

    const recent = [...filtered]
      .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 5)

    const salesMap = new Map<string, { quantity: number, book: any }>()
    filtered.forEach((order: any) => {
      if (order.status === 'CANCELLED') return
      order.items?.forEach((item: any) => {
        const current = salesMap.get(item.bookId)
        const bookRef = item.book || books.find((b: any) => b.id === item.bookId)
        if (!bookRef) return
        if (current) {
          current.quantity += item.quantity
        } else {
          salesMap.set(item.bookId, { quantity: item.quantity, book: bookRef })
        }
      })
    })
    const topSelling = Array.from(salesMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4)
      .map(entry => ({ ...entry.book, sold: entry.quantity }))

    return {
      filteredOrders: filtered,
      revenueData: revenue,
      ordersStatusData: statusData,
      categoryData: catData,
      topCustomersData: custData,
      totalRevenue: totalRev,
      totalOrders: totalOrd,
      lowStockBooks: lowStock,
      uniqueCustomers: customerIds.size,
      recentOrders: recent,
      topSellingBooks: topSelling
    }
  }, [orders, books, timeRange])

  const totalStatusOrders = ordersStatusData.reduce((acc: number, curr: any) => acc + (curr.count || 0), 0)

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      change: 'Completed payment revenue',
      trending: 'neutral',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Customers',
      value: uniqueCustomers.toString(),
      change: 'Distinct buyers in system',
      trending: 'neutral',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      change: 'All order statuses',
      trending: 'neutral',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Stock Alerts',
      value: lowStockBooks.toString(),
      change: 'Books with stock < 10',
      trending: 'neutral',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'SHIPPED':
        return 'bg-green-100 text-green-800'
      case 'DELIVERED':
        return 'bg-green-200 text-green-900'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="relative">
          <button 
            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            <Calendar className="w-4 h-4" />
            <span>
              {timeRange === '6M' ? 'Last 6 Months' : 
               timeRange === '30D' ? 'Last Month' : 
               timeRange === '7D' ? 'Last Week' : 'Yesterday'}
            </span>
            <svg className={`w-4 h-4 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isTimeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100">
              <div className="py-1">
                <button
                  onClick={() => { setTimeRange('Yesterday'); setIsTimeDropdownOpen(false) }}
                  className={`block w-full text-left px-4 py-2 text-sm ${timeRange === 'Yesterday' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Yesterday
                </button>
                <button
                  onClick={() => { setTimeRange('7D'); setIsTimeDropdownOpen(false) }}
                  className={`block w-full text-left px-4 py-2 text-sm ${timeRange === '7D' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Last Week
                </button>
                <button
                  onClick={() => { setTimeRange('30D'); setIsTimeDropdownOpen(false) }}
                  className={`block w-full text-left px-4 py-2 text-sm ${timeRange === '30D' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Last Month
                </button>
                <button
                  onClick={() => { setTimeRange('6M'); setIsTimeDropdownOpen(false) }}
                  className={`block w-full text-left px-4 py-2 text-sm ${timeRange === '6M' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Last 6 Months
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center text-sm">
                {stat.trending === 'up' && <TrendingUp className="w-4 h-4 text-green-600 mr-1" />}
                {stat.trending === 'down' && <TrendingDown className="w-4 h-4 text-red-600 mr-1" />}
                <span className={`font-medium ${stat.trending === 'up' ? 'text-green-600' : stat.trending === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row 1: Revenue Trend & Orders by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Revenue Trend
            </h2>
          </div>
          <div className="h-[300px]">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="monthDisplay" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No revenue data available
              </div>
            )}
          </div>
        </div>

        {/* Orders by Status Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
              Orders by Status
            </h2>
          </div>
          <div className="h-[300px]">
            {ordersStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={ordersStatusData}
                    cx="50%"
                    cy="40%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="status"
                  >
                    {ordersStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => [value, name]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry: any) => {
                      const { payload } = entry;
                      const percent = totalStatusOrders > 0 
                        ? ((payload.count / totalStatusOrders) * 100).toFixed(0) 
                        : 0;
                      return <span className="text-xs text-gray-600 ml-1">{value} ({percent}%)</span>;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No order data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Sales by Category & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales by Category Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Sales by Category
            </h2>
          </div>
          <div className="h-[300px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${value}`} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#6b7280" 
                    fontSize={11} 
                    width={120}
                    tick={{ fill: '#374151' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total Sales']}
                  />
                  <Bar dataKey="totalSales" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                    {categoryData.slice(0, 8).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No sales data available
              </div>
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Top Customers
            </h2>
          </div>
          <div className="space-y-4">
            {topCustomersData.length > 0 ? (
              topCustomersData.map((customer, index) => (
                <div key={customer.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{customer.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{customer.orderCount} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">${customer.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-500 py-8">No customer data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.user?.fullName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                        ${order.total.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Books */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Selling Books</h2>
          </div>
          <div className="p-6 space-y-4">
            {topSellingBooks.length > 0 ? (
              topSellingBooks.map((book: any) => (
                <div key={book.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {book.imageUrl ? (
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{book.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      by {book.authors?.map((a: any) => a.author.name).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{book.sold || 0} sold</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-500 py-8">No books available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
