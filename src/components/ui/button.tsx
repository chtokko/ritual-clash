import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border border-white/25 bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/[0.16]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-white/15 bg-black/20 text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.09] hover:text-white",
        secondary: "border border-white/15 bg-white/[0.07] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl hover:border-white/30 hover:bg-white/[0.12]",
        ghost: "text-slate-400 hover:bg-white/[0.055] hover:text-white",
        link: "text-white underline-offset-4 hover:underline",
        arena: "border border-white/30 bg-white/[0.1] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-xl font-heading text-base tracking-wide hover:-translate-y-0.5 hover:bg-white/[0.16]",
        wallet: "border border-white/35 bg-white/40 text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_14px_42px_-20px_rgba(255,255,255,0.72)] backdrop-blur-2xl hover:-translate-y-0.5 hover:border-white/55 hover:bg-white/55 hover:shadow-[0_18px_55px_-22px_rgba(255,255,255,0.8)] font-heading tracking-wide",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 px-7",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button };
