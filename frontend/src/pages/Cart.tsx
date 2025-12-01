import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex gap-4">
                {item.book.imageUrl ? (
                  <img
                    src={item.book.imageUrl}
                    alt={item.book.title}
                    className="w-24 h-24 object-cover rounded"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-grow">
                  <Link
                    to={`/books/${item.book.id}`}
                    className="text-lg font-semibold hover:text-blue-600 transition"
                  >
                    {item.book.title}
                  </Link>
                  <p className="text-gray-600 text-sm mt-1">
                    ${item.book.price.toFixed(2)} each
                  </p>
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="flex items-center space-x-2 border border-gray-300 rounded">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.book.stock}
                        className="p-1 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-lg font-semibold">
                      ${(item.book.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={removeItemMutation.isPending}
                      className="ml-auto text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
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

            <form onSubmit={handleCheckout} className="space-y-6">
              <div>
                <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Address
                </label>
                <textarea
                  id="shippingAddress"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                  minLength={10}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-shadow"
                  placeholder="Enter your shipping address (minimum 10 characters)"
                />
                {shippingAddress.length > 0 && shippingAddress.length < 10 && (
                  <p className="text-xs text-red-600 mt-1">
                    Address must be at least 10 characters ({shippingAddress.length}/10)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                {paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPaymentMethod === method.id
                            ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethod === method.id}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-3 block text-sm font-medium text-gray-900">
                          {method.name}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-red-500">No payment methods available.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={createOrderMutation.isPending || pendingUpdates > 0 || !shippingAddress.trim() || !selectedPaymentMethod}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {pendingUpdates > 0
                  ? 'Applying updates...'
                  : createOrderMutation.isPending
                  ? 'Processing Order...'
                  : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

