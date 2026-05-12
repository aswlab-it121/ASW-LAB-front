import React from 'react'
import { cn } from '../../lib/utils/classNames'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn('border rounded-md px-3 py-2 bg-white text-sm w-full', className)}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input
