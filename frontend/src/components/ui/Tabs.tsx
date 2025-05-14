import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

interface TabsProps {
  value: string
  onChange: (value: string) => void
  children: ReactNode
  variant?: 'default' | 'pills'
  className?: string
}

export const Tabs = ({
  value,
  onChange,
  children,
  variant = 'default',
  className,
}: TabsProps) => {
  return (
    <div
      className={twMerge(
        'flex overflow-x-auto',
        variant === 'default' ? 'border-b border-slate-200 dark:border-slate-700' : '',
        className
      )}
    >
      {children instanceof Array
        ? children.map((child) => {
            if (child.type === Tab) {
              return {
                ...child,
                props: {
                  ...child.props,
                  isActive: child.props.value === value,
                  onClick: () => onChange(child.props.value),
                  variant,
                },
              }
            }
            return child
          })
        : children}
    </div>
  )
}

interface TabProps {
  value: string
  children: ReactNode
  isActive?: boolean
  onClick?: () => void
  variant?: 'default' | 'pills'
  className?: string
}

export const Tab = ({
  children,
  isActive,
  onClick,
  variant = 'default',
  className,
}: TabProps) => {
  return (
    <button
      className={twMerge(
        'px-4 py-2 font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
        variant === 'default'
          ? `border-b-2 ${
              isActive
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
            }`
          : variant === 'pills'
          ? `rounded-full ${
              isActive
                ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`
          : '',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}