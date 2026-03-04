/**
 * Reusable Button component with variants.
 */

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      type = 'button',
      onClick,
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary:
        'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 btn-3d btn-3d-primary',
      secondary:
        'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600 focus:ring-gray-500 btn-3d',
      outline:
        'border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 focus:ring-primary-500 btn-3d',
      ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 focus:ring-gray-500',
      danger:
        'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 btn-3d',
    }
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    }
    
    return (
      <motion.button
        ref={ref}
        type={type}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97, y: 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        onClick={onClick}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export default Button
