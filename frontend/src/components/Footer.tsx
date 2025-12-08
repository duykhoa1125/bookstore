import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Github, Mail, Phone, MapPin } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-20 pb-10 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-20 left-10 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Logo variant="footer" className="w-fit" />
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              Your premier destination for literary adventures. Discover, learn, and grow with our curated collection of books from around the globe.
            </p>
            <div className="flex items-center gap-4">
              {[Facebook, Twitter, Instagram, Github].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 group"
                  aria-label="Social Link"
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6 relative inline-block">
              Explore
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-600 rounded-full"></span>
            </h4>
            <ul className="space-y-4">
              {['Best Sellers', 'New Arrivals', 'Coming Soon', 'Staff Picks', 'Categories'].map((item) => (
                <li key={item}>
                  <Link to="/books" className="text-sm hover:text-blue-400 transition-colors flex items-center gap-2 group w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-300"></span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6 relative inline-block">
              Contact Us
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-600 rounded-full"></span>
            </h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 group">
                <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-blue-600/20 group-hover:text-blue-500 transition-colors shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-sm leading-relaxed group-hover:text-gray-200 transition-colors">
                  123 Book Street, Literary District,<br />Knowledge City, 10000
                </span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-blue-600/20 group-hover:text-blue-500 transition-colors shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-sm group-hover:text-gray-200 transition-colors">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-blue-600/20 group-hover:text-blue-500 transition-colors shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-sm group-hover:text-gray-200 transition-colors">hello@inkwell.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6 relative inline-block">
              Newsletter
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-600 rounded-full"></span>
            </h4>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
              <p className="text-sm text-gray-400 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
              <form className="relative space-y-3" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full pl-4 pr-12 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder:text-gray-500"
                />
                <button 
                  type="submit" 
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2024 Inkwell Inc. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
