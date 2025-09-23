'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types'
import { ShoppingCart, Star, Check } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState<number | null>(null)
  
  const { addToCart } = useCart()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
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

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1)
    setAddedToCart(product.id)
    
    // Reset the "added" state after 2 seconds
    setTimeout(() => {
      setAddedToCart(null)
    }, 2000)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-xl"></div>
            <div className="p-6 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 group">
          {/* Product Image */}
          <div className="relative h-48 bg-gradient-to-br from-green-50 to-green-100 rounded-t-xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl opacity-20">🍄</div>
            </div>
            <div className="absolute top-3 right-3">
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                {product.category}
              </span>
            </div>
          </div>
          
          {/* Product Info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center space-x-1 text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm text-gray-600">4.8</span>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {product.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-green-600">
                  ${product.price}
                </p>
                <p className="text-xs text-gray-500">
                  {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                </p>
              </div>
              
              <button 
                onClick={() => handleAddToCart(product)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  product.stock_quantity > 0 
                    ? addedToCart === product.id
                      ? 'bg-green-700 text-white'
                      : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={product.stock_quantity === 0}
              >
                {addedToCart === product.id ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span className="hidden sm:inline">Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {product.stock_quantity > 0 ? 'Add to Cart' : 'Sold Out'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}