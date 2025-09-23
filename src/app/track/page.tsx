'use client'

import { useState } from 'react'
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Mail } from 'lucide-react'
import Link from 'next/link'

interface TrackingOrder {
  id: string
  customerEmail: string
  customerName?: string
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  items: Array<{
    product: {
      name: string
      price: number
    }
    quantity: number
  }>
  shippingAddress: {
    name: string
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}

export default function OrderTrackingPage() {
  const [orderIdInput, setOrderIdInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [order, setOrder] = useState<TrackingOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const trackOrder = async () => {
    if (!orderIdInput.trim() || !emailInput.trim()) {
      setError('Please enter both Order ID and Email')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: orderIdInput.trim(),
          email: emailInput.trim().toLowerCase()
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setOrder(data.order)
      } else {
        setError(data.error || 'Order not found')
        setOrder(null)
      }
    } catch (error) {
      console.error('Error tracking order:', error)
      setError('Failed to track order. Please try again.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-6 w-6" />,
          color: 'text-yellow-600 bg-yellow-50',
          title: 'Order Pending',
          description: 'We have received your order and will process it soon.'
        }
      case 'processing':
        return {
          icon: <Package className="h-6 w-6" />,
          color: 'text-blue-600 bg-blue-50',
          title: 'Processing Order',
          description: 'Your fresh mushrooms are being carefully prepared for shipment.'
        }
      case 'shipped':
        return {
          icon: <Truck className="h-6 w-6" />,
          color: 'text-purple-600 bg-purple-50',
          title: 'Order Shipped',
          description: 'Your order is on its way! Expected delivery in 3-5 business days.'
        }
      case 'delivered':
        return {
          icon: <CheckCircle className="h-6 w-6" />,
          color: 'text-green-600 bg-green-50',
          title: 'Order Delivered',
          description: 'Your order has been delivered! Enjoy your fresh mushrooms.'
        }
      case 'cancelled':
        return {
          icon: <Package className="h-6 w-6" />,
          color: 'text-red-600 bg-red-50',
          title: 'Order Cancelled',
          description: 'This order has been cancelled.'
        }
      default:
        return {
          icon: <Clock className="h-6 w-6" />,
          color: 'text-gray-600 bg-gray-50',
          title: 'Unknown Status',
          description: 'Please contact support for more information.'
        }
    }
  }

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending': return 25
      case 'processing': return 50
      case 'shipped': return 75
      case 'delivered': return 100
      case 'cancelled': return 0
      default: return 0
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
              <p className="text-gray-600">Enter your order details to track your mushroom delivery</p>
            </div>
            <Link
              href="/"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Back to Shop
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Tracking Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID
              </label>
              <input
                type="text"
                placeholder="e.g. ABC12345"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={trackOrder}
                disabled={loading}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Track Order
                  </>
                )}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order #{String(order.id).padStart(8, '0').slice(-8).toUpperCase()}
                  </h2>
                  <p className="text-gray-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getStatusInfo(order.status).color}`}>
                  {getStatusInfo(order.status).icon}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Order Progress</span>
                  <span>{getProgressPercentage(order.status)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(order.status)}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Status */}
              <div className={`p-4 rounded-lg ${getStatusInfo(order.status).color}`}>
                <h3 className="font-semibold mb-1">{getStatusInfo(order.status).title}</h3>
                <p className="text-sm">{getStatusInfo(order.status).description}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        ${item.product.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-green-600">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
              </div>
              <div className="text-gray-700">
                <p>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal_code}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <Mail className="mx-auto h-8 w-8 text-blue-600 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                Questions about your order? We&apos;re here to help!
              </p>
              <a
                href="mailto:support@yourdomain.com"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </a>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!order && !loading && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How to track your order</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">1</span>
                <p>Find your Order ID in the confirmation email we sent you</p>
              </div>
              <div className="flex items-start">
                <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">2</span>
                <p>Enter your Order ID and the email address you used to place the order</p>
              </div>
              <div className="flex items-start">
                <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">3</span>
                <p>Click &quot;Track Order&quot; to see your delivery status and estimated arrival time</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}