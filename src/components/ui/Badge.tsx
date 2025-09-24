type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const baseClasses =
    "inline-flex items-center font-medium rounded-full border";

  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-blue-500 text-white border-blue-500",
    success: "bg-emerald-500 text-white border-emerald-500",
    warning: "bg-amber-500 text-white border-amber-500",
    error: "bg-red-500 text-white border-red-500",
    info: "bg-sky-500 text-white border-sky-500",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return <span className={classes}>{children}</span>;
};
export default Badge;
