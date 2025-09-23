import Link from 'next/link'
import { Leaf, Users, Award, Heart, MapPin, Clock } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Growing Quality Since Day One
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We&apos;re passionate mushroom farmers dedicated to bringing you the freshest, 
              highest-quality gourmet mushrooms straight from our farm to your table.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  What started as a small passion project in 2020 has grown into a thriving 
                  mushroom farm that serves customers across the country. Our journey began 
                  when our founder discovered the incredible world of gourmet mushrooms and 
                  their amazing flavors and health benefits.
                </p>
                <p>
                  Today, we cultivate over 15 varieties of premium mushrooms using sustainable, 
                  organic growing methods. Every mushroom is hand-picked at peak freshness and 
                  delivered within 24-48 hours of harvest to ensure maximum quality and flavor.
                </p>
                <p>
                  We believe that great food starts with great ingredients, and our mushrooms 
                  are no exception. From delicate oyster mushrooms to robust shiitakes, each 
                  variety is grown with care and attention to detail.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8 h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Leaf className="mx-auto h-16 w-16 mb-4" />
                <p className="text-lg font-medium">Farm Photo Coming Soon</p>
                <p className="text-sm">Our beautiful mushroom growing facility</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything we do is guided by our commitment to quality, sustainability, and community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sustainable</h3>
              <p className="text-gray-600 text-sm">
                We use eco-friendly growing methods and sustainable packaging to minimize our environmental impact.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600 text-sm">
                Every mushroom is carefully inspected and hand-picked to ensure you receive only the best.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-gray-600 text-sm">
                We&apos;re proud to support local communities and share our passion for gourmet mushrooms.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Passion</h3>
              <p className="text-gray-600 text-sm">
                Our love for mushrooms drives everything we do, from cultivation to customer service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Process</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From spore to plate, we control every step to ensure exceptional quality.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cultivation</h3>
              <p className="text-gray-600">
                We grow our mushrooms in climate-controlled environments using organic substrates 
                and pure water systems.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Harvesting</h3>
              <p className="text-gray-600">
                Each mushroom is hand-picked at peak ripeness by our experienced team to ensure 
                optimal flavor and texture.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Delivery</h3>
              <p className="text-gray-600">
                Your mushrooms are carefully packaged and shipped within 24 hours of harvest 
                for maximum freshness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit Our Farm</h2>
            <p className="text-xl text-gray-600">
              We offer farm tours and workshops! Come see where the magic happens.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm border">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Location</h3>
              </div>
              <div className="text-gray-600 space-y-2">
                <p>123 Mushroom Farm Road</p>
                <p>Green Valley, CA 90210</p>
                <p>United States</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-sm border">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Farm Tours</h3>
              </div>
              <div className="text-gray-600 space-y-2">
                <p><span className="font-medium">Saturdays:</span> 10:00 AM - 4:00 PM</p>
                <p><span className="font-medium">Sundays:</span> 12:00 PM - 3:00 PM</p>
                <p className="text-sm text-green-600 font-medium">Reservation required</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Taste the Difference?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Experience the incredible flavors and freshness of our premium mushrooms. 
            Order today and taste what makes us special.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/contact"
              className="bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}