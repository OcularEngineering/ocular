import { cn } from "@/lib/utils"

// Loading animation
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 dark:before:via-gray-800/60 before:to-transparent';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(`${shimmer} rounded-md bg-muted z-0`, className)}
      {...props}
    />
  )
}

export { Skeleton }
