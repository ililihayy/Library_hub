import { useMemo, useState } from "react";
import { CheckCircle2, Library as LibraryIcon, Mail, PlayCircle } from "lucide-react";
import { useLibrary } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { formatDate, countdown } from "@/lib/dates";
import { toast } from "sonner";
import type { LoanStatus } from "@/lib/types";

const filters: { value: LoanStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "overdue", label: "Overdue" },
  { value: "returned", label: "Returned" },
];

const Loans = () => {
  const loans = useLibrary((s) => s.loans);
  const books = useLibrary((s) => s.books);
  const users = useLibrary((s) => s.users);
  const returnLoan = useLibrary((s) => s.returnLoan);
  const markActive = useLibrary((s) => s.markActive);

  const [filter, setFilter] = useState<LoanStatus | "all">("all");

  const visible = useMemo(() => {
    const list = filter === "all" ? loans : loans.filter((l) => l.status === filter);
    return [...list].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [loans, filter]);

  const sendReminder = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    const book = books.find((b) => b.id === loan?.bookId);
    const user = users.find((u) => u.id === loan?.userId);
    toast.success(`Reminder email sent to ${user?.fullName}`, {
      description: `Re: "${book?.title}" — please return at your earliest convenience.`,
    });
  };

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">Loans</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Loan tracking</h1>
        <p className="mt-1 text-muted-foreground">Confirm pickups, monitor overdue items, and nudge readers.</p>
      </header>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as LoanStatus | "all")} className="mb-6">
        <TabsList>
          {filters.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
              <span className="ml-2 text-xs text-muted-foreground">
                {f.value === "all" ? loans.length : loans.filter((l) => l.status === f.value).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        <EmptyState icon={LibraryIcon} title="No loans here" description="Try a different filter." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Book</th>
                  <th className="px-4 py-3">Reader</th>
                  <th className="px-4 py-3">Borrowed</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((loan) => {
                  const book = books.find((b) => b.id === loan.bookId);
                  const reader = users.find((u) => u.id === loan.userId);
                  const cd = loan.status !== "returned" ? countdown(loan.dueDate) : null;
                  return (
                    <tr key={loan.id} className="border-t border-border hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={book?.coverUrl} alt="" loading="lazy" className="h-10 w-7 rounded object-cover" />
                          <div className="min-w-0">
                            <div className="truncate font-medium">{book?.title}</div>
                            <div className="truncate text-xs text-muted-foreground">{book?.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{reader?.fullName}</div>
                        <div className="text-xs text-muted-foreground">{reader?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(loan.startDate)}</td>
                      <td className="px-4 py-3">
                        <div>{formatDate(loan.dueDate)}</div>
                        {cd && (
                          <div className={
                            cd.tone === "late"
                              ? "text-xs text-destructive"
                              : cd.tone === "warn"
                              ? "text-xs text-warning"
                              : "text-xs text-muted-foreground"
                          }>
                            {cd.label}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={loan.status as "active" | "overdue" | "pending" | "returned"}>{loan.status}</StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {loan.status === "pending" && (
                            <Button size="sm" variant="outline" onClick={() => { markActive(loan.id); toast.success("Loan marked active"); }}>
                              <PlayCircle className="mr-1 h-3.5 w-3.5" />
                              Activate
                            </Button>
                          )}
                          {loan.status === "overdue" && (
                            <Button size="sm" variant="outline" onClick={() => sendReminder(loan.id)}>
                              <Mail className="mr-1 h-3.5 w-3.5" />
                              Send reminder
                            </Button>
                          )}
                          {loan.status !== "returned" && (
                            <Button size="sm" onClick={() => { returnLoan(loan.id); toast.success("Marked as returned"); }}>
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              Return
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Loans;
