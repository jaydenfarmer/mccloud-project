'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { Product } from '@/types'
import Link from 'next/link'
import Image from 'next/image'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
      } else {
        setError('Failed to load products')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault() // Prevent navigation to product page
    e.stopPropagation()
    
    addToCart(product, 1)
    alert(`Added ${product.name} to cart!`)
  }

  const getCategoryDisplay = (category: string) => {
    const categories = {
      'fresh': 'Fresh Mushrooms',
      'kits': 'Growing Kits', 
      'supplements': 'Supplements',
      'dried': 'Dried Mushrooms'
    }
    return categories[category as keyof typeof categories] || category
  }

  const getStockStatus = (stockQuantity: number) => {
    if (stockQuantity === 0) {
      return { text: 'Out of Stock', color: 'text-red-600', available: false }
    } else if (stockQuantity <= 5) {
      return { text: `Only ${stockQuantity} left!`, color: 'text-orange-600', available: true }
    } else {
      return { text: 'In Stock', color: 'text-green-600', available: true }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Products</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button 
            onClick={fetchProducts}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Products</h1>
          <p className="text-gray-600">
            Discover our premium selection of fresh mushrooms, growing kits, and supplements
          </p>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {products?.length || 0} products
          </p>
        </div>

        {/* Products Grid */}
        {!products || products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products available</h3>
            <p className="text-gray-600 mb-4">
              Check back soon for new products!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock_quantity)
              
              return (
                <Link 
                  key={product.id} 
                  href={`/products/${product.id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-shadow overflow-hidden">
                    {/* Product Image */}
                    <div className="aspect-square bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <Image
                          src={product.image_urls[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl">🍄</span>
                        </div>
                      )}
                      
                      {/* Stock Badge */}
                      {!stockStatus.available && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-medium px-2 py-1 rounded">
                          Out of Stock
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-2 right-2 bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                        {getCategoryDisplay(product.category)}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                        {product.name}
                      </h3>
                      
                      {product.strain && (
                        <p className="text-sm text-gray-500 mb-2">{product.strain}</p>
                      )}
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-gray-900">
                            ${product.price}
                          </span>
                          <p className={`text-xs ${stockStatus.color}`}>
                            {stockStatus.text}
                          </p>
                        </div>
                        
                        {stockStatus.available && (
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                            title="Add to cart"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}