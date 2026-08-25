import { Icon } from "@/components/dashboard/icon";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type AdminButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconFilled?: boolean;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
};

/**
 * Reusable button component for admin panel.
 * Soft Brutalist design with hard shadows and brand colors.
 */
export function AdminButton({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconFilled = false,
  href,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: AdminButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 border-2 border-black font-headline font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50";

  const variantStyles = {
    primary:
      "bg-brand text-white shadow-hard hover:-translate-y-0.5 hover:shadow-hard-primary disabled:hover:translate-y-0 disabled:hover:shadow-hard",
    secondary:
      "bg-white text-black shadow-hard hover:-translate-y-0.5 hover:bg-brand-fixed disabled:hover:translate-y-0 disabled:hover:shadow-hard",
    danger:
      "bg-danger text-white shadow-hard hover:-translate-y-0.5 hover:bg-red-700 disabled:hover:translate-y-0 disabled:hover:shadow-hard",
    ghost:
      "bg-white text-black hover:bg-surface-container hover:translate-x-0.5",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  const content = (
    <>
      {icon && <Icon name={icon} filled={iconFilled} />}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedStyles}
    >
      {content}
    </button>
  );
}
