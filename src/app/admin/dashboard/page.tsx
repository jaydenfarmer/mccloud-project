'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react'

interface DashboardStats {
  revenue: {
    current: number
    change: number
  }
  orders: {
    current: number
    change: number
  }
  products: number
  pendingOrders: number
  recentOrders: Array<{
    id: string
    customerEmail: string
    customerName?: string
    totalAmount: number
    status: string
    createdAt: string
  }>
  lowStockProducts: Array<{
    id: number
    name: string
    stock: number
    category: string
  }>
  categorySales: Array<{
    category: string
    orders: number
    revenue: number
  }>
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 animate-pulse">
      <div className="space-y-1">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="text-right space-y-1">
        <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
        <div className="h-5 bg-gray-200 rounded-full w-20 ml-auto"></div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetchStats()
  }, [router])

  const fetchStats = async () => {
    try {
      setError(null)
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      } else {
        setError(data.error || 'Failed to load dashboard')
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setError('Network error - please check your connection')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchStats()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Loading your mushroom farm overview...</p>
              </div>
              <div className="flex space-x-4">
                <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Loading Dashboard */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          {/* Tables Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="p-6 space-y-4">
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="p-6 space-y-4">
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center max-w-md">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex space-x-4">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
            >
              {refreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </button>
            <Link
              href="/admin/products"
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-center"
            >
              Go to Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Failed to load dashboard</h2>
          <button 
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here&apos;s your mushroom farm overview.</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin/products"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Manage Products
              </Link>
              <Link
                href="/admin/orders"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Orders
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.revenue.current.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stats.revenue.change >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ml-1 ${
                stats.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(stats.revenue.change).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-600 ml-1">vs last month</span>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.orders.current}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stats.orders.change >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ml-1 ${
                stats.orders.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(stats.orders.change).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-600 ml-1">vs last month</span>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.products}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/admin/products" 
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Manage products →
              </Link>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/admin/orders" 
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
              >
                View orders →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customerName || order.customerEmail}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link
                  href="/admin/orders"
                  className="w-full bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All Orders
                </Link>
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Low Stock Alert</h3>
            </div>
            <div className="p-6">
              {stats.lowStockProducts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  All products are well stocked! 🎉
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.stock === 0 
                            ? 'bg-red-100 text-red-800' 
                            : product.stock < 5 
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.stock} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6">
                <Link
                  href="/admin/inventory"
                  className="w-full bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Manage Inventory
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Category Sales */}
        {stats.categorySales.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Sales by Category (Last 30 Days)</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.categorySales.map((category) => (
                  <div key={category.category} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 capitalize mb-2">
                      {category.category}
                    </h4>
                    <p className="text-lg font-bold text-green-600">
                      ${category.revenue.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {category.orders} orders
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}