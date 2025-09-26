import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "category" | "tag" | "person" | "product"
  onRemove?: () => void
}

const variantColors = {
  category: "fill-blue-500 dark:fill-blue-400",
  tag: "fill-green-500 dark:fill-green-400",
  person: "fill-violet-500 dark:fill-violet-400",
  product: "fill-amber-500 dark:fill-amber-400",
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "tag", children, onRemove, ...props }, ref) => {
    const dotColor = variantColors[variant]

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium",
          "text-gray-900 dark:text-white",
          "inset-ring inset-ring-gray-200 dark:inset-ring-white/10",
          className
        )}
        {...props}
      >
        <svg
          viewBox="0 0 6 6"
          aria-hidden="true"
          className={cn("size-1.5", dotColor)}
        >
          <circle r="3" cx="3" cy="3" />
        </svg>
        {children}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="ml-1 -mr-0.5 inline-flex hover:opacity-70 transition-opacity"
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </span>
    )
  }
)

Badge.displayName = "Badge"

export { Badge }