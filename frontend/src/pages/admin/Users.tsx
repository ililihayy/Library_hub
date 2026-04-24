import { useMemo, useState } from "react";
import { Ban, Mail, MapPin, Phone, Search, ShieldCheck, Users as UsersIcon } from "lucide-react";
import { useLibrary } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Users = () => {
  const users = useLibrary((s) => s.users);
  const loans = useLibrary((s) => s.loans);
  const toggle = useLibrary((s) => s.toggleBlacklist);
  const [query, setQuery] = useState("");

  const readers = useMemo(
    () =>
      users
        .filter((u) => u.role === "reader")
        .filter(
          (u) =>
            !query ||
            u.fullName.toLowerCase().includes(query.toLowerCase()) ||
            u.email.toLowerCase().includes(query.toLowerCase())
        ),
    [users, query]
  );

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">Readers</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Reader management</h1>
        <p className="mt-1 text-muted-foreground">Review profiles, contact details and account standing.</p>
      </header>

      <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-soft">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {readers.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No readers yet" description="When people sign up they'll appear here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {readers.map((u) => {
            const activeCount = loans.filter((l) => l.userId === u.id && l.status !== "returned").length;
            return (
              <article
                key={u.id}
                className={cn(
                  "rounded-2xl border bg-card p-5 shadow-soft transition-all",
                  u.blacklisted ? "border-destructive/40 bg-destructive/5" : "border-border"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full font-display text-lg font-semibold",
                      u.blacklisted ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"
                    )}>
                      {u.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{u.fullName}</div>
                      <div className="text-xs text-muted-foreground">Joined {new Date(u.joinedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {u.blacklisted ? (
                    <StatusBadge tone="overdue">Blacklisted</StatusBadge>
                  ) : (
                    <StatusBadge tone="available">Active</StatusBadge>
                  )}
                </div>

                <div className="mt-4 space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{u.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-2">{u.address}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{activeCount}</span> active loans
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {u.blacklisted ? <Ban className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                      Blacklist
                    </span>
                    <Switch
                      checked={u.blacklisted}
                      onCheckedChange={() => {
                        toggle(u.id);
                        toast.success(u.blacklisted ? `${u.fullName} restored` : `${u.fullName} blacklisted`);
                      }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
};

export default Users;
