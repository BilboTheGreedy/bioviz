import { ReactNode, ButtonHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  className?: string
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800 focus:ring-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 dark:focus:ring-slate-500',
    outline: 'border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-300 dark:focus:ring-slate-600',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-300 dark:focus:ring-slate-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs rounded',
    md: 'px-4 py-2 rounded-md',
    lg: 'px-6 py-3 text-lg rounded-lg',
  }

  return (
    <button
      className={twMerge(
        'font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  )
}

export default Button