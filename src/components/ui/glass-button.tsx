import * as React from "react";
import { cn } from "@/lib/utils";

type GlassButtonSize = "sm" | "default" | "lg" | "icon";

const sizeClasses: Record<GlassButtonSize, string> = {
  sm: "h-9 rounded-lg px-3 text-xs",
  default: "h-11 rounded-xl px-4 text-sm",
  lg: "h-12 rounded-xl px-7 text-sm",
  icon: "h-11 w-11 rounded-xl",
};

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: GlassButtonSize;
  contentClassName?: string;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(({
  className,
  contentClassName,
  size = "default",
  children,
  type = "button",
  ...props
}, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      "group relative isolate inline-flex items-center justify-center overflow-hidden border border-white/30 bg-white/35 font-heading font-semibold text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_14px_38px_-18px_rgba(255,255,255,0.65)] backdrop-blur-2xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-40",
      sizeClasses[size],
      className,
    )}
    {...props}
  >
    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"/>
    <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-white/20 via-transparent to-black/10"/>
    <span className={cn("relative z-10 inline-flex items-center justify-center", size === "icon" ? "" : "gap-2", contentClassName)}>
      {children}
    </span>
  </button>
));

GlassButton.displayName = "GlassButton";

export { GlassButton };
