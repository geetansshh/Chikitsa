/**
 * Modal component using Headless UI.
 */

import { Fragment, ReactNode } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${sizes[size]} transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white/80 dark:bg-slate-800/90 backdrop-blur-2xl border border-white/40 dark:border-slate-700 p-4 sm:p-6 shadow-2xl transition-all`}
              >
                {title && (
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                      {title}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                )}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
