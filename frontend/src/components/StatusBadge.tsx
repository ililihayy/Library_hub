import { cn } from "@/lib/utils";

type Tone = "available" | "reserved" | "out" | "active" | "overdue" | "pending" | "returned" | "neutral";

const tones: Record<Tone, string> = {
  available: "bg-success/10 text-success border-success/20",
  reserved: "bg-warning/10 text-warning border-warning/20",
  out: "bg-muted text-muted-foreground border-border",
  active: "bg-primary/10 text-primary border-primary/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  returned: "bg-muted text-muted-foreground border-border",
  neutral: "bg-secondary text-secondary-foreground border-border",
};

export const StatusBadge = ({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
      tones[tone],
      className
    )}
  >
    <span className={cn("h-1.5 w-1.5 rounded-full", {
      "bg-success": tone === "available",
      "bg-warning": tone === "reserved" || tone === "pending",
      "bg-muted-foreground": tone === "out" || tone === "returned" || tone === "neutral",
      "bg-primary": tone === "active",
      "bg-destructive": tone === "overdue",
    })} />
    {children}
  </span>
);
