import { cn } from "../../utils/cn"

export const Card = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn(
        "bg-white border border-gray-100 rounded-2xl shadow-soft p-6",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

export const CardHeader = ({ title, subtitle, action, className }) => {
  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <div>
        <h3 className="text-xl font-bold text-gray-800 tracking-tight">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
