import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg";
}

export function Spinner({ className, size = "md", ...props }: SpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4 border-2",
        md: "h-8 w-8 border-4",
        lg: "h-12 w-12 border-4",
    };

    return (
        <div
            role="status"
            aria-label="Loading"
            className={cn(
                "animate-spin rounded-full border-indigo-600 border-t-transparent",
                sizeClasses[size],
                className
            )}
            {...props}
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}
