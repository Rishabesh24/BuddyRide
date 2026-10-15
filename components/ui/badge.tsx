import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-commuter-900 text-white",
        secondary:
          "bg-commuter-100 text-commuter-800 border border-commuter-200",
        mobility:
          "bg-mobility-50 text-mobility-800 border border-mobility-200 font-medium",
        success:
          "bg-emerald-50 text-emerald-800 border border-emerald-200",
        warning:
          "bg-amber-50 text-amber-800 border border-amber-200",
        danger:
          "bg-red-50 text-red-800 border border-red-200",
        outline:
          "text-commuter-700 border border-commuter-300 bg-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
