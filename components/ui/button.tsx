import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98] transition-transform",
  {
    variants: {
      variant: {
        default:
          "bg-brasa-orange text-black hover:bg-brasa-orangeHover shadow-glow",
        secondary:
          "bg-brasa-surface text-brasa-cream hover:bg-brasa-surfaceHover border border-brasa-border",
        outline:
          "border border-brasa-border bg-transparent text-brasa-cream hover:bg-brasa-surface",
        ghost: "hover:bg-brasa-surface text-brasa-cream",
        danger:
          "bg-brasa-red text-white hover:bg-brasa-redHover",
        link: "text-brasa-orange underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-13 rounded-lg px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

