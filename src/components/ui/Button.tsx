import React from 'react'
import { cn } from '../../lib/utils/classNames'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, children, ...rest }) => {
  return (
    <button
      className={cn(
        'px-3 py-1.5 rounded-md font-medium focus:outline-none focus:ring-2',
        variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-transparent text-gray-700',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
