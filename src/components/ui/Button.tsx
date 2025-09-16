import React from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    outline:
      "bg-transparent text-orange-600 border border-orange-500 hover:bg-orange-50",
    ghost: "text-gray-700 hover:text-orange-500",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "px-3 py-2 text-sm rounded-md",
    md: "px-5 py-2.5 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-lg",
  };

  return (
    <button
      className={`inline-flex space-x-2 items-center justify-center font-medium transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
