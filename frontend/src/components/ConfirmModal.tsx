import Modal from './Modal'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  isLoading?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <p className="text-gray-600 leading-relaxed">
          {message}
        </p>

        <div className="flex space-x-3 pt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-5 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-5 py-2.5 text-sm font-bold rounded-xl text-white transition-all shadow-lg shadow-gray-900/20 disabled:opacity-50 ${
              isDangerous 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' 
                : 'bg-gray-900 hover:bg-black'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
