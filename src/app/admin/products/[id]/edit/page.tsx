'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, X, Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ProductForm {
  name: string
  description: string
  price: string
  category: string
  strain: string
  stock_quantity: string
  image_urls: string[]
  is_active: boolean
}

export default function EditProductPage() {
  const [product, setProduct] = useState<ProductForm>({
    name: '',
    description: '',
    price: '',
    category: 'fresh',
    strain: '',
    stock_quantity: '',
    image_urls: [],
    is_active: true
  })
  const [newImageUrl, setNewImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    // Fetch existing product data
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (data.success) {
          const productData = data.product
          setProduct({
            name: productData.name,
            description: productData.description,
            price: productData.price.toString(),
            category: productData.category,
            strain: productData.strain || '',
            stock_quantity: productData.stock_quantity.toString(),
            image_urls: productData.image_urls || [],
            is_active: productData.is_active
          })
        } else {
          alert(`Failed to load product: ${data.error}`)
          router.push('/admin/products')
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        alert('Failed to load product. Please try again.')
        router.push('/admin/products')
      } finally {
        setLoadingProduct(false)
      }
    }
    
    fetchProduct()
  }, [router, productId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!product.name.trim()) {
      newErrors.name = 'Product name is required'
    }

    if (!product.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!product.price || parseFloat(product.price) <= 0) {
      newErrors.price = 'Valid price is required'
    }

    if (!product.stock_quantity || parseInt(product.stock_quantity) < 0) {
      newErrors.stock_quantity = 'Valid stock quantity is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: product.name.trim(),
          description: product.description.trim(),
          price: parseFloat(product.price),
          category: product.category,
          strain: product.strain.trim() || null,
          stock_quantity: parseInt(product.stock_quantity),
          image_urls: product.image_urls,
          is_active: product.is_active
        })
      })

      const data = await response.json()

      if (data.success) {
        router.push('/admin/products')
      } else {
        alert(`Failed to update product: ${data.error}`)
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addImageUrl = () => {
    if (newImageUrl.trim() && !product.image_urls.includes(newImageUrl.trim())) {
      setProduct(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, newImageUrl.trim()]
      }))
      setNewImageUrl('')
    }
  }

  const removeImageUrl = (index: number) => {
    setProduct(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }))
  }

  const categories = [
    { value: 'fresh', label: 'Fresh Mushrooms' },
    { value: 'kits', label: 'Growing Kits' },
    { value: 'supplements', label: 'Supplements' },
    { value: 'dried', label: 'Dried Mushrooms' }
  ]

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
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
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/products"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-gray-600">Update product information</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Product Information</h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={product.name}
                  onChange={(e) => setProduct(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Organic Shiitake Mushrooms"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={product.description}
                  onChange={(e) => setProduct(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe your product, its benefits, and how to use it..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    value={product.price}
                    onChange={(e) => setProduct(prev => ({ ...prev, price: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>

                <div>
                  <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    id="stock_quantity"
                    min="0"
                    value={product.stock_quantity}
                    onChange={(e) => setProduct(prev => ({ ...prev, stock_quantity: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.stock_quantity ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.stock_quantity && <p className="mt-1 text-sm text-red-600">{errors.stock_quantity}</p>}
                </div>
              </div>

              {/* Category and Strain */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={product.category}
                    onChange={(e) => setProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="strain" className="block text-sm font-medium text-gray-700 mb-2">
                    Strain/Variety
                  </label>
                  <input
                    type="text"
                    id="strain"
                    value={product.strain}
                    onChange={(e) => setProduct(prev => ({ ...prev, strain: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Blue Oyster, King Oyster"
                  />
                </div>
              </div>

              {/* Product Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images
                </label>
                
                {/* Add Image URL */}
                <div className="flex space-x-2 mb-4">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter image URL"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Current Images */}
                {product.image_urls.length > 0 && (
                  <div className="space-y-2">
                    {product.image_urls.map((url, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                        <Image
                          src={url}
                          alt={`Product image ${index + 1}`}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="%23f3f4f6"/><text x="24" y="28" text-anchor="middle" font-family="Arial" font-size="20">🍄</text></svg>'
                          }}
                        />
                        <span className="flex-1 text-sm text-gray-600 truncate">{url}</span>
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={product.is_active}
                  onChange={(e) => setProduct(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Product is active and available for purchase
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/products"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Updating...' : 'Update Product'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}