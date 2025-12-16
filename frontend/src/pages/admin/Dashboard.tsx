import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
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

type TimeRange = '6M' | '30D' | '7D' | 'Yesterday'

export default function AdminDashboardOverview() {
  const [timeRange, setTimeRange] = useState<TimeRange>('6M')
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false)

  // Fetch all analytics data from API
  const { data: revenueResponse } = useQuery({
    queryKey: ['analytics-revenue', timeRange],
    queryFn: () => api.getRevenueByTimeRange(timeRange),
  })

  const { data: ordersStatusResponse } = useQuery({
    queryKey: ['analytics-orders-status', timeRange],
    queryFn: () => api.getOrdersByStatus(timeRange),
  })

  const { data: categoryResponse } = useQuery({
    queryKey: ['analytics-category', timeRange],
    queryFn: () => api.getSalesByCategory(timeRange),
  })

  const { data: topCustomersResponse } = useQuery({
    queryKey: ['analytics-top-customers', timeRange],
    queryFn: () => api.getTopCustomers(5, timeRange),
  })

  const { data: statsResponse } = useQuery({
    queryKey: ['analytics-stats', timeRange],
    queryFn: () => api.getDashboardStats(timeRange),
  })

  const { data: recentOrdersResponse } = useQuery({
    queryKey: ['analytics-recent-orders', timeRange],
    queryFn: () => api.getRecentOrders(5, timeRange),
  })

  const { data: topSellingBooksResponse } = useQuery({
    queryKey: ['analytics-top-selling', timeRange],
    queryFn: () => api.getTopSellingBooks(4, timeRange),
  })

  // Extract data from responses
  const revenueData = revenueResponse?.data || []
  const ordersStatusData = ordersStatusResponse?.data || []
  const categoryData = categoryResponse?.data || []
  const topCustomersData = topCustomersResponse?.data || []
  const stats = statsResponse?.data || { totalRevenue: 0, uniqueCustomers: 0, totalOrders: 0, lowStockBooks: 0 }
  const recentOrders = recentOrdersResponse?.data || []
  const topSellingBooks = topSellingBooksResponse?.data || []

  const totalStatusOrders = ordersStatusData.reduce((acc: number, curr: any) => acc + (curr.count || 0), 0)

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      change: 'Completed payment revenue',
      trending: 'neutral',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Customers',
      value: stats.uniqueCustomers.toString(),
      change: 'Distinct buyers in system',
      trending: 'neutral',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      change: 'All order statuses',
      trending: 'neutral',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Stock Alerts',
      value: stats.lowStockBooks.toString(),
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-1">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 font-medium text-sm sm:text-base">Welcome back, here's what's happening today.</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
            className="flex items-center space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 border border-white/50 rounded-xl text-sm font-semibold text-gray-700 bg-white/50 backdrop-blur-md shadow-sm hover:bg-white hover:shadow-md transition-all duration-300 ring-1 ring-gray-900/5"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">
              {timeRange === '6M' ? 'Last 6 Months' : 
               timeRange === '30D' ? 'Last Month' : 
               timeRange === '7D' ? 'Last Week' : 'Yesterday'}
            </span>
            <span className="sm:hidden">
              {timeRange}
            </span>
            <svg className={`w-4 h-4 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isTimeDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl z-50 border border-white/50 ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="py-2">
                {(['Yesterday', '7D', '30D', '6M'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => { setTimeRange(range); setIsTimeDropdownOpen(false) }}
                    className={`block w-full text-left px-5 py-2.5 text-sm font-medium transition-colors ${
                      timeRange === range 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {range === '6M' ? 'Last 6 Months' : range === '30D' ? 'Last Month' : range === '7D' ? 'Last Week' : 'Yesterday'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="group bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-6 border border-white/60 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start justify-between mb-2 sm:mb-4 lg:mb-5">
                <div>
                  <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-500 mb-0.5 sm:mb-1 tracking-wide uppercase">{stat.title}</p>
                  <h3 className="text-lg sm:text-xl lg:text-3xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-2 sm:p-2.5 lg:p-3.5 rounded-xl lg:rounded-2xl shadow-inner group-hover:rotate-12 transition-transform duration-300`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
              </div>
              <div className="hidden sm:flex items-center text-xs lg:text-sm bg-white/50 w-fit px-2 py-1 rounded-lg border border-white/50">
                {stat.trending === 'up' && <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-green-600 mr-1" />}
                {stat.trending === 'down' && <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 text-red-600 mr-1" />}
                <span className={`font-semibold text-[10px] sm:text-xs lg:text-sm ${stat.trending === 'up' ? 'text-green-600' : stat.trending === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row 1: Revenue Trend & Orders by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Revenue Trend Line Chart */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/60 shadow-lg shadow-gray-200/50 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                 <TrendingUp className="w-5 h-5" />
              </div>
              Revenue Trend
            </h2>
          </div>
          <div className="h-[350px]">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="monthDisplay" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={11} 
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                      return `$${value}`;
                    }} 
                    tickLine={false} 
                    axisLine={false} 
                    width={60}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      backdropFilter: 'blur(8px)',
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                      padding: '12px 16px'
                    }}
                    itemStyle={{ color: '#111827', fontWeight: 600 }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 0, fill: '#6366f1' }}
                  />
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <AlertTriangle className="w-10 h-10 mb-2 opacity-50" />
                <span>No revenue data available</span>
              </div>
            )}
          </div>
        </div>

        {/* Orders by Status Pie Chart */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg shadow-gray-200/50 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <ShoppingCart className="w-5 h-5" />
              </div>
              Orders by Status
            </h2>
          </div>
          <div className="h-[350px]">
            {ordersStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersStatusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                    cornerRadius={6}
                  >
                    {ordersStatusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      backdropFilter: 'blur(4px)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number, name: string) => [value, name]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    formatter={(value, entry: any) => {
                      const { payload } = entry;
                      const percent = totalStatusOrders > 0 
                        ? ((payload.count / totalStatusOrders) * 100).toFixed(0) 
                        : 0;
                      return <span className="text-xs font-medium text-gray-600 ml-1">{value} ({percent}%)</span>;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                 <Package className="w-10 h-10 mb-2 opacity-50" />
                 <span>No order data available</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Sales by Category & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales by Category Bar Chart */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg shadow-gray-200/50 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                 <BookOpen className="w-5 h-5" />
              </div>
              Sales by Category
            </h2>
          </div>
          <div className="h-[350px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `$${value}`} tickLine={false} axisLine={false} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#4b5563" 
                    fontSize={12} 
                    fontWeight={500}
                    width={100}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6', opacity: 0.5 }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      backdropFilter: 'blur(4px)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total Sales']}
                  />
                  <Bar dataKey="totalSales" radius={[0, 8, 8, 0]} barSize={24}>
                    {categoryData.slice(0, 8).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <AlertTriangle className="w-10 h-10 mb-2 opacity-50" />
                <span>No sales data available</span>
              </div>
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg shadow-gray-200/50 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <Crown className="w-5 h-5" />
              </div>
              Top Customers
            </h2>
          </div>
          <div className="space-y-4">
            {topCustomersData.length > 0 ? (
              topCustomersData.map((customer: any, index: number) => (
                <div key={customer.id} className="group flex items-center space-x-4 p-4 bg-white/50 rounded-2xl border border-white/50 hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white ${
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : 
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-yellow-800' : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{customer.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{customer.orderCount} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-green-600">${customer.totalSpent.toFixed(2)}</p>
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
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg shadow-gray-200/50 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <Link 
              to="/admin/orders"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50/50 border-b border-gray-100/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50 bg-white/30">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                        #{order.id.substring(0, 8)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0">
                            {order.user?.fullName?.charAt(0) || '?'}
                          </div>
                          <span className="truncate max-w-[100px]">{order.user?.fullName || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-medium hidden sm:table-cell">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold shadow-sm ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                        ${order.total.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Books */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg shadow-gray-200/50 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100/50">
            <h2 className="text-xl font-bold text-gray-900">Top Selling Books</h2>
          </div>
          <div className="p-6 space-y-6">
            {topSellingBooks.length > 0 ? (
              topSellingBooks.map((book: any, index: number) => (
                <div key={book.id} className="flex items-center space-x-4 group">
                  <div className="flex-shrink-0 relative">
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10 border-2 border-white">
                      {index + 1}
                    </div>
                    {book.imageUrl ? (
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-gray-200 rounded-lg flex items-center justify-center shadow-inner">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate leading-snug group-hover:text-blue-600 transition-colors">{book.title}</p>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      by {book.authors?.map((a: any) => a.author.name).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">
                      {book.sold || 0} <span className="text-xs font-medium text-gray-500">sold</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <BookOpen className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">No books available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
