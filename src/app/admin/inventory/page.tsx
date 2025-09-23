'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, Plus, Minus, Save, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Product } from '@/types'

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [pendingUpdates, setPendingUpdates] = useState<{[key: number]: number}>({})
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetchProducts()
  }, [router])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStock = (productId: number, change: number) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    const currentPending = pendingUpdates[productId] ?? product.stock_quantity
    const newStock = Math.max(0, currentPending + change)
    
    setPendingUpdates(prev => ({
      ...prev,
      [productId]: newStock
    }))
  }

  const saveStockUpdate = async (productId: number) => {
    const newStock = pendingUpdates[productId]
    if (newStock === undefined) return

    setUpdating(productId)
    try {
      const token = localStorage.getItem('adminToken')
      const product = products.find(p => p.id === productId)
      
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...product,
          stock_quantity: newStock
        })
      })

      const data = await response.json()
      if (data.success) {
        // Update local state
        setProducts(prev => prev.map(p => 
          p.id === productId 
            ? { ...p, stock_quantity: newStock }
            : p
        ))
        
        // Remove from pending updates
        setPendingUpdates(prev => {
          const newPending = { ...prev }
          delete newPending[productId]
          return newPending
        })
      } else {
        alert(`Failed to update stock: ${data.error}`)
      }
    } catch (error) {
      console.error('Error updating stock:', error)
      alert('Failed to update stock')
    } finally {
      setUpdating(null)
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-800', text: 'Out of Stock' }
    if (stock < 5) return { color: 'bg-orange-100 text-orange-800', text: 'Very Low' }
    if (stock < 10) return { color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' }
    return { color: 'bg-green-100 text-green-800', text: 'In Stock' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                <p className="text-gray-600">Manage product stock levels</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adjust Stock
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const currentStock = pendingUpdates[product.id] ?? product.stock_quantity
                  const hasChanges = pendingUpdates[product.id] !== undefined
                  const stockStatus = getStockStatus(currentStock)
                  
                  return (
                    <tr key={product.id} className={hasChanges ? "bg-blue-50" : "hover:bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">${product.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900">{currentStock}</div>
                        {hasChanges && (
                          <div className="text-xs text-blue-600">
                            Changed from {product.stock_quantity}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateStock(product.id, -1)}
                            className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            disabled={currentStock === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateStock(product.id, -5)}
                            className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200"
                            disabled={currentStock < 5}
                          >
                            -5
                          </button>
                          <button
                            onClick={() => updateStock(product.id, 5)}
                            className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded hover:bg-green-200"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => updateStock(product.id, 1)}
                            className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {hasChanges && (
                          <button
                            onClick={() => saveStockUpdate(product.id)}
                            disabled={updating === product.id}
                            className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {updating === product.id ? (
                              <>
                                <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-1"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {products.filter(p => p.stock_quantity === 0).length}
              </div>
              <div className="text-sm text-red-800">Out of Stock</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {products.filter(p => p.stock_quantity > 0 && p.stock_quantity < 10).length}
              </div>
              <div className="text-sm text-yellow-800">Low Stock</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {products.filter(p => p.stock_quantity >= 10).length}
              </div>
              <div className="text-sm text-green-800">Well Stocked</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {products.reduce((sum, p) => sum + p.stock_quantity, 0)}
              </div>
              <div className="text-sm text-blue-800">Total Units</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}