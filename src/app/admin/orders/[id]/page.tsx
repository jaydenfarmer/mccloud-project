'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, User, MapPin, Calendar, Truck } from 'lucide-react'
import Link from 'next/link'
import { Order } from '@/types'

interface OrderPageProps {
  params: Promise<{ id: string }>
}

export default function OrderPage({ params }: OrderPageProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()
  const [orderId, setOrderId] = useState<string>('')

  useEffect(() => {
    params.then(({ id }) => {
      setOrderId(id)
      
      // Check if admin is logged in
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      fetchOrder(id)
    })
  }, [router])

  const fetchOrder = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        const foundOrder = data.orders.find((o: Order) => o.id === id)
        if (foundOrder) {
          setOrder(foundOrder)
        } else {
          console.error('Order not found')
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return

    setUpdating(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()
      if (data.success) {
        setOrder({ ...order, status: newStatus as Order['status'] })
        
        // Show success message
        const successDiv = document.createElement('div')
        successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50'
        successDiv.textContent = `Order status updated to ${newStatus}`
        document.body.appendChild(successDiv)
        
        setTimeout(() => successDiv.remove(), 3000)
      } else {
        alert(`Failed to update order status: ${data.error}`)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/admin/orders"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/orders"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{order.id.slice(-8).toUpperCase()}
                </h1>
                <p className="text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Order Status Update */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Update Order Status</h2>
          <div className="flex flex-wrap gap-3">
            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => updateOrderStatus(status)}
                disabled={updating || order.status === status}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  order.status === status
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {updating ? 'Updating...' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{order.customerName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{order.customerEmail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Order Date</label>
                <p className="text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
            </div>
            <div className="text-gray-900 space-y-1">
              <p>{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal_code}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          <div className="flex items-center mb-4">
            <Package className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
          </div>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    ${item.product.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Total */}
          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-green-600">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}