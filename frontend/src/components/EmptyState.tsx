import { Inbox } from "lucide-react";

export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="font-display text-xl font-semibold">{title}</h3>
    {description && (
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
