import Link from 'next/link'
import { ShoppingCart, Leaf, Search, User } from 'lucide-react'

export default function Header() {
   return (
    <header className="bg-gray-500 shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-green-800 hover:text-green-600 transition-colors">
            <Leaf className="h-8 w-8" />
            <span>MCloud Castle</span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-white hover:text-green-600 font-medium transition-colors">
              Products
            </Link>
            <Link href="/about" className=" text-white hover:text-green-600 font-medium transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-white hover:text-green-600 font-medium transition-colors">
              Contact
            </Link>
          </nav>
          
          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button className="p-2 text-white hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            {/* User Account */}
            <Link href="/account" className="p-2 text-white hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <User className="h-5 w-5" />
            </Link>
            
            {/* Cart with item count */}
            <button className="relative p-2 text-white hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {/* Cart count badge */}
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                3
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}