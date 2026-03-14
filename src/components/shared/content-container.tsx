import { cn } from "@/lib/utils";

type ContentContainerVariant = "default" | "narrow" | "wide";

type ContentContainerProps = {
  variant?: ContentContainerVariant;
  as?: "div" | "section" | "main";
  className?: string;
  children: React.ReactNode;
};

/** Tailwind's container + mx-auto. Narrow caps width with max-w-3xl. */
const variantClass: Record<ContentContainerVariant, string> = {
  default: "container mx-auto max-w-6xl px-6 md:px-10 lg:px-12",
  narrow: "container mx-auto max-w-3xl px-6 md:px-10",
  wide: "container mx-auto max-w-7xl px-6 md:px-10 lg:px-12",
};

/**
 * Wrapper using Tailwind's container utility. Use only where you need constrained width.
 */
export function ContentContainer({
  variant = "default",
  as: Tag = "div",
  className,
  children,
}: ContentContainerProps) {
  return (
    <Tag className={cn(variantClass[variant], className)}>
      {children}
    </Tag>
  );
}
