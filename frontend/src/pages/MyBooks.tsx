import { Link } from "react-router-dom";
import { BookOpen, Clock, History } from "lucide-react";
import { useLibrary, selectCurrentUser } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { countdown, formatDate } from "@/lib/dates";
import { toast } from "sonner";

const MyBooks = () => {
  const user = useLibrary(selectCurrentUser);
  const loans = useLibrary((s) => s.loans);
  const books = useLibrary((s) => s.books);
  const returnLoan = useLibrary((s) => s.returnLoan);

  if (!user) return null;

  const myLoans = loans.filter((l) => l.userId === user.id);
  const current = myLoans.filter((l) => l.status !== "returned");
  const history = myLoans.filter((l) => l.status === "returned");

  return (
    <AppShell>
      <header className="mb-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Reader profile</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">{user.fullName}</h1>
          <p className="mt-1 text-muted-foreground">{user.email} · Member since {new Date(user.joinedAt).getFullYear()}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Active" value={current.filter(l => l.status !== "pending").length} />
          <Stat label="Reserved" value={current.filter(l => l.status === "pending").length} />
          <Stat label="Returned" value={history.length} />
        </div>
      </header>

      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent" />
          <h2 className="font-display text-2xl font-semibold">My current books</h2>
        </div>
        {current.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No books out right now"
            description="Browse the catalog and reserve a title to get started."
            action={
              <Button asChild>
                <Link to="/catalog">Browse catalog</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {current.map((loan) => {
              const book = books.find((b) => b.id === loan.bookId);
              if (!book) return null;
              const cd = countdown(loan.dueDate);
              return (
                <article key={loan.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <img src={book.coverUrl} alt={book.title} loading="lazy" className="h-32 w-24 flex-shrink-0 rounded-md object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg font-semibold leading-tight">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                      </div>
                      <StatusBadge tone={loan.status as "active" | "overdue" | "pending"}>{loan.status}</StatusBadge>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span
                        className={
                          cd.tone === "late"
                            ? "font-display text-2xl font-semibold text-destructive"
                            : cd.tone === "warn"
                            ? "font-display text-2xl font-semibold text-warning"
                            : "font-display text-2xl font-semibold text-foreground"
                        }
                      >
                        {cd.label}
                      </span>
                      <span className="text-xs text-muted-foreground">due {formatDate(loan.dueDate)}</span>
                    </div>

                    <div className="mt-auto pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          returnLoan(loan.id);
                          toast.success(`Returned "${book.title}". Thanks!`);
                        }}
                      >
                        Return book
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-display text-2xl font-semibold">Reading history</h2>
        </div>
        {history.length === 0 ? (
          <EmptyState icon={History} title="No history yet" description="Your returned books will show up here." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Borrowed</th>
                  <th className="px-4 py-3">Returned</th>
                </tr>
              </thead>
              <tbody>
                {history.map((loan) => {
                  const book = books.find((b) => b.id === loan.bookId);
                  if (!book) return null;
                  return (
                    <tr key={loan.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <div className="font-medium">{book.title}</div>
                        <div className="text-xs text-muted-foreground">{book.author}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(loan.startDate)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{loan.returnedAt ? formatDate(loan.returnedAt) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg border border-border bg-card px-3 py-2 text-center">
    <div className="font-display text-2xl font-semibold">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

export default MyBooks;
