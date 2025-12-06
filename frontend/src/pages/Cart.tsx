import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, MapPin, Truck, ArrowRight, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'

export default function Cart() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [shippingAddress, setShippingAddress] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [pendingUpdates, setPendingUpdates] = useState(0)

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.getCart(),
  })

  const { data: paymentMethodsData } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => api.getPaymentMethods(),
  })

  // Pre-select the first payment method when data loads
  useEffect(() => {
    if (paymentMethodsData?.data && paymentMethodsData.data.length > 0 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(paymentMethodsData.data[0].id)
    }
  }, [paymentMethodsData, selectedPaymentMethod])

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      api.updateCartItem(itemId, { quantity }),
    // Optimistic update for snappy UX
    onMutate: async ({ itemId, quantity }) => {
      setPendingUpdates((c) => c + 1)
      await queryClient.cancelQueries({ queryKey: ['cart'] })
      const previous = queryClient.getQueryData(['cart']) as any

      // Optimistically update cache
      queryClient.setQueryData(['cart'], (oldData: any) => {
        if (!oldData?.data) return oldData
        const cart = { ...oldData.data }
        const items = cart.items.map((it: any) =>
          it.id === itemId ? { ...it, quantity } : it
        )
        const total = items.reduce(
          (sum: number, it: any) => sum + it.book.price * it.quantity,
          0
        )
        return { ...oldData, data: { ...cart, items, total } }
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      // Rollback
      if (context?.previous) {
        queryClient.setQueryData(['cart'], context.previous)
      }
      toast.error('Failed to update quantity')
    },
    onSettled: () => {
      setPendingUpdates((c) => Math.max(0, c - 1))
      // Refetch to sync
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => api.removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Item removed from cart')
    },
  })

  const createOrderMutation = useMutation({
    mutationFn: (data: { shippingAddress: string; paymentMethodId: string }) =>
      api.createOrder(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order placed successfully!')
      if (response.data) {
        navigate(`/orders/${response.data.id}`)
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to create order'
      const errorDetails = error.response?.data?.errors
      
      if (errorDetails) {
        // Show specific validation errors
        const errorMessages = Object.values(errorDetails).flat()
        errorMessages.forEach((msg: any) => toast.error(msg))
      } else {
        toast.error(errorMessage)
      }
    },
  })

  const cart = cartData?.data
  const paymentMethods = paymentMethodsData?.data || []

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
          <Link
            to="/books"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Browse Books
          </Link>
        </div>
      </div>
    )
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateItemMutation.mutate({ itemId, quantity: newQuantity })
  }

  const handleRemoveItem = (itemId: string) => {
    if (confirm('Are you sure you want to remove this item?')) {
      removeItemMutation.mutate(itemId)
    }
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pendingUpdates > 0) {
      toast('Please wait for cart updates to finish')
      return
    }
    if (!shippingAddress.trim()) {
      toast.error('Please enter shipping address')
      return
    }
    if (shippingAddress.trim().length < 10) {
      toast.error('Shipping address must be at least 10 characters')
      return
    }
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method')
      return
    }
    // Ensure server-side cart is up to date before creating the order
    await queryClient.invalidateQueries({ queryKey: ['cart'] })
    await queryClient.refetchQueries({ queryKey: ['cart'] })

    createOrderMutation.mutate({
      shippingAddress: shippingAddress.trim(),
      paymentMethodId: selectedPaymentMethod,
    })
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-10">
         <div className="p-3 bg-blue-50 rounded-2xl">
            <ShoppingBag className="w-8 h-8 text-blue-600" />
         </div>
         <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Your Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.items.map((item) => (
            <div key={item.id} className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="flex gap-6 items-start">
                <div className="relative w-32 aspect-[2/3] rounded-xl overflow-hidden shadow-md flex-shrink-0">
                  {item.book.imageUrl ? (
                    <img
                      src={item.book.imageUrl}
                      alt={item.book.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                
                <div className="flex-grow flex flex-col justify-between min-h-[140px]">
                  <div>
                     <div className="flex justify-between items-start">
                        <Link
                          to={`/books/${item.book.id}`}
                          className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {item.book.title}
                        </Link>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removeItemMutation.isPending}
                          className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                     </div>
                     <p className="text-gray-500 mt-1 font-medium">
                       ${item.book.price.toFixed(2)}
                     </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1 border border-gray-200">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:hover:text-gray-600 transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.book.stock}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:hover:text-gray-600 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                       <p className="text-sm text-gray-500">Total</p>
                       <p className="text-xl font-bold text-blue-600">
                         ${(item.book.price * item.quantity).toFixed(2)}
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-24">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-8">
              {/* Shipping Address */}
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3>Shipping Information</h3>
                 </div>
                 <div className="relative group">
                    <div className="absolute top-3.5 left-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                       <Truck className="w-5 h-5" />
                    </div>
                    <textarea
                      id="shippingAddress"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                      minLength={10}
                      rows={3}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all resize-none text-sm leading-relaxed placeholder:text-gray-400 outline-none"
                      placeholder="Enter your full delivery address..."
                    />
                 </div>
                 {shippingAddress.length > 0 && shippingAddress.length < 10 && (
                   <p className="text-xs text-red-500 pl-1 font-medium flex items-center gap-1">
                     Address is too short ({shippingAddress.length}/10)
                   </p>
                 )}
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                   <CreditCard className="w-5 h-5 text-blue-600" />
                   <h3>Payment Method</h3>
                </div>
                
                {paymentMethods.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`group relative flex items-center p-4 border rounded-2xl cursor-pointer transition-all duration-300 ${
                          selectedPaymentMethod === method.id
                            ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600/20'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethod === method.id}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                          className="sr-only"
                        />
                        
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors mr-3.5 ${
                           selectedPaymentMethod === method.id 
                           ? 'border-blue-600' 
                           : 'border-gray-300 group-hover:border-blue-400'
                        }`}>
                           {selectedPaymentMethod === method.id && (
                             <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                           )}
                        </div>
                        
                        <span className={`font-semibold text-sm ${selectedPaymentMethod === method.id ? 'text-blue-900' : 'text-gray-700'}`}>
                          {method.name}
                        </span>
                        
                        {/* Right Icon */}
                        <div className="ml-auto opacity-50 group-hover:opacity-100 transition-opacity">
                           {method.name.toLowerCase().includes('cash') || method.name.toLowerCase().includes('cod') ? (
                              <ShieldCheck className="w-5 h-5 text-green-600" />
                           ) : (
                              <CreditCard className="w-5 h-5 text-blue-600" />
                           )}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center">
                    No payment methods available.
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={createOrderMutation.isPending || pendingUpdates > 0 || !shippingAddress.trim() || !selectedPaymentMethod}
                className="w-full group relative overflow-hidden bg-gray-900 text-white px-6 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_30px_-5px_rgba(0,0,0,0.4)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {pendingUpdates > 0 ? (
                    'Updating Cart...'
                  ) : createOrderMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Place Order
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

