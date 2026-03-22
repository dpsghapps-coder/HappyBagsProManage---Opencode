import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-accent-600 to-accent-700 text-white shadow-sm hover:from-accent-500 hover:to-accent-600 hover:shadow-lg hover:shadow-accent-500/25",
        glass: "bg-white/20 backdrop-blur-lg border border-white/30 text-gray-800 hover:bg-white/30 hover:border-white/40 shadow-sm",
        "glass-accent": "bg-accent-500/20 backdrop-blur-lg border border-accent-500/30 text-accent-700 hover:bg-accent-500/30 hover:border-accent-500/40 shadow-sm",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:from-red-400 hover:to-red-500 hover:shadow-lg hover:shadow-red-500/25",
        outline: "border-2 border-accent-500/50 bg-transparent text-accent-600 hover:bg-accent-50",
        secondary: "bg-gradient-to-r from-accent-400 to-accent-500 text-white shadow-sm hover:from-accent-300 hover:to-accent-400 hover:shadow-lg hover:shadow-accent-400/25",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        link: "text-accent-600 underline-offset-4 hover:underline",
        success: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm hover:from-emerald-400 hover:to-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25",
        warning: "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm hover:from-amber-400 hover:to-amber-500 hover:shadow-lg hover:shadow-amber-500/25",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 px-3",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
