/**
 * Reusable Input component.
 */

import { forwardRef, InputHTMLAttributes, useState } from 'react'
import { clsx } from 'clsx'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className,
      type,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    
    const inputId = props.id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    const errorId = inputId ? `${inputId}-error` : undefined
    const helperId = inputId ? `${inputId}-helper` : undefined

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? 'text' : type}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={clsx(
              'w-full px-4 py-3 border rounded-lg transition-all duration-200',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'bg-white dark:bg-slate-700 dark:text-white',
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-slate-600',
              className
            )}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          )}
          
          {rightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-500 dark:text-red-400" role="alert">{error}</p>
        )}
        
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
