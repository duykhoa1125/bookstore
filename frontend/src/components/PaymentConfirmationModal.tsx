import { X, ShoppingBag, MapPin, CreditCard, Package } from 'lucide-react'

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 relative">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Confirm Your Order</h2>
              <p className="text-blue-100 text-sm">Please review before placing order</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Items */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Order Items ({selectedItems.length})
            </h3>
            <div className="space-y-3">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                    {item.book.imageUrl ? (
                      <img
                        src={item.book.imageUrl}
                        alt={item.book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 line-clamp-2 text-sm">
                      {item.book.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      ${item.book.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${(item.book.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Shipping Address
            </h3>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <p className="text-gray-700 leading-relaxed">{shippingAddress}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Method
            </h3>
            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
              <p className="font-semibold text-gray-900">{paymentMethodName}</p>
            </div>
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-xl font-bold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              'Confirm Order'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
