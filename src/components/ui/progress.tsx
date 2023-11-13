"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const indicatorColor = ["bg-accent", "bg-primary", "bg-secondary", "bg-warning", "bg-destructive"];

const Progress = React.forwardRef<
    React.ElementRef<typeof ProgressPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
        fill?: "primary" | "secondary" | "accent" | "warning" | "destructive";
    }
>(({ className, value, fill = "primary", ...props }, ref) => (
    <ProgressPrimitive.Root
        ref={ref}
        className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
        {...props}
    >
        <ProgressPrimitive.Indicator
            className={`h-full w-full flex-1 transition-all bg-${fill}`}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
    </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
