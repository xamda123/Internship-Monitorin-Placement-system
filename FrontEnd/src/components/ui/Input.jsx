import { cn } from "../../utils/cn"

export const Input = ({ label, error, className, icon: Icon, ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-sm font-medium text-gray-700 ml-1">{label}</label>}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          className={cn(
            "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none transition-all duration-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-gray-700 placeholder:text-gray-400",
            Icon && "pl-11",
            error && "border-red-500 focus:ring-red-500/10 focus:border-red-500",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 ml-1 mt-1">{error}</p>}
    </div>
  )
}
