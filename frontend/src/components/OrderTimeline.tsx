import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react'

interface OrderTimelineProps {
  status: string
  orderDate: string | Date
}

const steps = [
  { key: 'PENDING', label: 'Order Placed', icon: Clock },
  { key: 'PROCESSING', label: 'Processing', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
]

export default function OrderTimeline({ status, orderDate }: OrderTimelineProps) {
  const isCancelled = status === 'CANCELLED'
  
  const getStepIndex = () => {
    const index = steps.findIndex(step => step.key === status)
    return index >= 0 ? index : 0
  }
  
  const currentIndex = getStepIndex()

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-red-900">Order Cancelled</h3>
            <p className="text-sm text-red-600">This order has been cancelled.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Order Progress</h2>
        <p className="text-sm text-gray-500 mt-1">
          Placed on {new Date(orderDate).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>
      
      <div className="p-8">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div 
            className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-emerald-500 to-emerald-400 transition-all duration-500"
            style={{ 
              height: `${Math.min((currentIndex / (steps.length - 1)) * 100, 100)}%`
            }}
          />
          
          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => {
              const isCompleted = index <= currentIndex
              const isCurrent = index === currentIndex
              const Icon = step.icon
              
              return (
                <div key={step.key} className="relative flex items-start gap-4">
                  {/* Icon Circle */}
                  <div 
                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' 
                        : 'bg-gray-100 border-2 border-gray-200'
                    } ${isCurrent ? 'ring-4 ring-emerald-500/20 scale-110' : ''}`}
                  >
                    <Icon 
                      className={`w-5 h-5 ${
                        isCompleted ? 'text-white' : 'text-gray-400'
                      }`} 
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="pt-2">
                    <h4 
                      className={`font-semibold ${
                        isCompleted ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Current Status
                      </span>
                    )}
                    {isCompleted && !isCurrent && (
                      <p className="text-sm text-gray-500 mt-0.5">Completed</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
