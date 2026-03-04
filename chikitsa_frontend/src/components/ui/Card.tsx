/**
 * Reusable Card component.
 */

import { ReactNode, HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface CardProps {
  variant?: 'default' | 'hover' | 'bordered' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children?: ReactNode
  className?: string
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className,
}: CardProps) {
  const variants = {
    default: 'bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-900/50',
    hover: 'bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-900/50 hover:shadow-lg transition-shadow',
    bordered: 'bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700',
    glass: 'glass-card',
  }
  
  const paddings = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(variants[variant], paddings[padding], className)}
    >
      {children}
    </motion.div>
  )
}

// Card subcomponents
export function CardHeader({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('border-b border-gray-100 dark:border-slate-700 pb-4 mb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={clsx('text-lg font-semibold text-gray-900 dark:text-white', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('text-gray-600 dark:text-gray-300', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('border-t border-gray-100 dark:border-slate-700 pt-4 mt-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}
