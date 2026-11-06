import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  title?: string
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  title,
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-accent text-white hover:bg-accent-light focus:ring-accent',
    secondary: 'bg-bg-elevated text-text-primary hover:bg-bg-hover focus:ring-accent',
    danger: 'bg-error text-white hover:opacity-90 focus:ring-error',
  }

  const sizeClasses = {
    sm: 'px-3 py-1 text-small',
    md: 'px-4 py-2 text-body',
    lg: 'px-6 py-3 text-body',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-md font-medium
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  )
}
