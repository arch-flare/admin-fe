import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "bg-red-500 text-white hover:bg-red-600",
                outline:
                    "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
                success:
                    "bg-green-500 text-white hover:bg-green-600",
                warning:
                    "bg-yellow-500 text-white hover:bg-yellow-600",
                info:
                    "bg-blue-500 text-white hover:bg-blue-600",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={badgeVariants({ variant })} {...props} />
    );
}

export { Badge, badgeVariants };