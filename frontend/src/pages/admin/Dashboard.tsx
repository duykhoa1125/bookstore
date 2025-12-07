import { useMemo, useState } from 'react'
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
    <div className="p-8 max-w-[1600px] mx-auto relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 font-medium">Welcome back, here's what's happening today.</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
            className="flex items-center space-x-2 px-5 py-2.5 border border-white/50 rounded-xl text-sm font-semibold text-gray-700 bg-white/50 backdrop-blur-md shadow-sm hover:bg-white hover:shadow-md transition-all duration-300 ring-1 ring-gray-900/5"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>
              {timeRange === '6M' ? 'Last 6 Months' : 
               timeRange === '30D' ? 'Last Month' : 
               timeRange === '7D' ? 'Last Week' : 'Yesterday'}
            </span>
            <svg className={`w-4 h-4 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isTimeDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl z-50 border border-white/50 ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="py-2">
                {['Yesterday', '7D', '30D', '6M'].map((range) => (
                  <button
                    key={range}
                    onClick={() => { setTimeRange(range as any); setIsTimeDropdownOpen(false) }}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="group bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1 tracking-wide uppercase">{stat.title}</p>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3.5 rounded-2xl shadow-inner group-hover:rotate-12 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center text-sm bg-white/50 w-fit px-2 py-1 rounded-lg border border-white/50">
                {stat.trending === 'up' && <TrendingUp className="w-4 h-4 text-green-600 mr-1.5" />}
                {stat.trending === 'down' && <TrendingDown className="w-4 h-4 text-red-600 mr-1.5" />}
                <span className={`font-semibold ${stat.trending === 'up' ? 'text-green-600' : stat.trending === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
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
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg shadow-gray-200/50 p-8">
          <div className="flex items-center justify-between mb-8">
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
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="monthDisplay" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `$${value}`} tickLine={false} axisLine={false} dx={-10} />
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
                    type="natural" 
                    dataKey="revenue" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    dot={false}
                    activeDot={{ r: 8, stroke: '#4f46e5', strokeWidth: 0, fill: '#6366f1' }}
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
                    {ordersStatusData.map((entry, index) => (
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
                    {categoryData.slice(0, 8).map((_, index) => (
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
              topCustomersData.map((customer, index) => (
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
          <div className="px-8 py-6 border-b border-gray-100/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <Link 
              to="/admin/orders"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-100/50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50 bg-white/30">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        #{order.id.substring(0, 8)}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                            {order.user?.fullName?.charAt(0) || '?'}
                          </div>
                          {order.user?.fullName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
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
