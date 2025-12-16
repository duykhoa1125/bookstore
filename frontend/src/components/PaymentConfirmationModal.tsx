import { X, ShoppingBag, MapPin, CreditCard, Package, CheckCircle2, Truck, Shield, Sparkles } from 'lucide-react'

interface PaymentConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  selectedItems: {
    id: string
    book: {
      title: string
      price: number
      imageUrl?: string
    }
    quantity: number
  }[]
  shippingAddress: string
  paymentMethodName: string
  total: number
  isProcessing: boolean
}

export default function PaymentConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  selectedItems,
  shippingAddress,
  paymentMethodName,
  total,
  isProcessing,
}: PaymentConfirmationModalProps) {
  if (!isOpen) return null

  const itemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && !isProcessing && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-300 relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-100/50 to-blue-100/50 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" />
        
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-10 w-20 h-20 border-2 border-white/30 rounded-2xl rotate-12 animate-pulse" />
            <div className="absolute bottom-4 right-20 w-16 h-16 border-2 border-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-1/2 right-10 w-8 h-8 bg-white/20 rounded-lg rotate-45" />
          </div>
          
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2.5 rounded-full hover:bg-white/20 transition-all duration-200 disabled:opacity-50 backdrop-blur-sm"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Confirm Your Order</h2>
              <p className="text-blue-100 text-sm sm:text-base mt-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Review your order details before confirming
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-280px)]">
          {/* Order Items */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                </div>
                Order Items
              </h3>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="space-y-3">
              {selectedItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group flex gap-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                    {item.book.imageUrl ? (
                      <img
                        src={item.book.imageUrl}
                        alt={item.book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <ShoppingBag className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    {/* Quantity badge */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base leading-snug">
                        {item.book.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        ${item.book.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-blue-600">
                      ${(item.book.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Shipping Address */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-blue-900">Shipping To</h3>
              </div>
              <p className="text-sm text-blue-700 leading-relaxed">{shippingAddress}</p>
            </div>

            {/* Payment Method */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <CreditCard className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-sm font-bold text-green-900">Payment Method</h3>
              </div>
              <p className="text-sm font-semibold text-green-700">{paymentMethodName}</p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 py-4 mb-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Truck className="w-4 h-4 text-blue-500" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
              <span>Quality Guaranteed</span>
            </div>
          </div>

          {/* Order Total */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Subtotal</span>
              <span className="font-medium">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Shipping</span>
              <span className="font-medium text-green-400">Free</span>
            </div>
            <div className="h-px bg-gray-700 my-3" />
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total</span>
              <div className="text-right">
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="relative p-6 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Go Back
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 relative overflow-hidden px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <span className="relative flex items-center justify-center gap-2">
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing Order...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Confirm & Place Order
                  </>
                )}
              </span>
            </button>
          </div>
          
          {/* Processing message */}
          {isProcessing && (
            <p className="text-center text-sm text-gray-500 mt-4 animate-pulse">
              Please wait while we process your order...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
