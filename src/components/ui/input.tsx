import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-2 text-base text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl outline-none transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-white/25 focus:border-white/40 focus:bg-black/35 focus:ring-4 focus:ring-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
