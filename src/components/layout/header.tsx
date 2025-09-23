// Update your header.tsx
'use client'

import Link from 'next/link'
import { ShoppingCart, Leaf, Search, User, LogOut } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'

export default function Header() {
  const { totalItems } = useCart()
  const { user, logout } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-green-800 hover:text-green-600 transition-colors">
            <Leaf className="h-8 w-8" />
            <span>McCloud Mycology</span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
              Products
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
              Contact
            </Link>
          </nav>
          
          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            {/* User Account - Show different options based on login status */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link href="/account" className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                  <User className="h-5 w-5" />
                </Link>
                <span className="text-sm text-gray-600 hidden sm:inline">
                  Hi, {user.firstName}
                </span>
                <button 
                  onClick={logout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                  Login
                </Link>
                <Link href="/register" className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
            
            {/* Cart with dynamic item count */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}