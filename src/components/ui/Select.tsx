import React from 'react'
import { cn } from '../../lib/utils/classNames'

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select ref={ref} className={cn('border rounded-md px-3 py-2 bg-white text-sm', className)} {...props}>
        {children}
      </select>
    )
  }
)

Select.displayName = 'Select'

export default Select
