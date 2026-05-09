import { cn } from "../../utils/cn"

export const Button = ({ className, variant = "primary", size = "md", isLoading, children, ...props }) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
    secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
    success: "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  )
}
