import { Link } from "react-router-dom";
import { ArrowRight, BookMarked, Library, Users as UsersIcon, AlertTriangle } from "lucide-react";
import { useLibrary, selectCurrentUser } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/dates";

const AdminOverview = () => {
  const user = useLibrary(selectCurrentUser);
  const books = useLibrary((s) => s.books);
  const users = useLibrary((s) => s.users);
  const loans = useLibrary((s) => s.loans);

  const totalCopies = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const activeLoans = loans.filter((l) => l.status === "active").length;
  const overdue = loans.filter((l) => l.status === "overdue");
  const readers = users.filter((u) => u.role === "reader");
  const blacklisted = users.filter((u) => u.blacklisted).length;

  const stats = [
    { label: "Books in catalog", value: books.length, sub: `${totalCopies} copies`, icon: BookMarked, to: "/admin/inventory" },
    { label: "Registered readers", value: readers.length, sub: `${blacklisted} blacklisted`, icon: UsersIcon, to: "/admin/users" },
    { label: "Active loans", value: activeLoans, sub: `${loans.filter(l => l.status === "pending").length} pending`, icon: Library, to: "/admin/loans" },
    { label: "Overdue", value: overdue.length, sub: "needs attention", icon: AlertTriangle, to: "/admin/loans" },
  ];

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">Librarian dashboard</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Good day, {user?.fullName.split(" ")[0]}.</h1>
        <p className="mt-1 text-muted-foreground">Here's what's happening at your library.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-book"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
            <div className="font-display text-3xl font-semibold">{s.value}</div>
            <div className="mt-1 text-sm font-medium">{s.label}</div>
            <div className="text-xs text-muted-foreground">{s.sub}</div>
          </Link>
        ))}
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Recent loans</h2>
            <Link to="/admin/loans" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {loans.slice(-5).reverse().map((loan) => {
              const book = books.find((b) => b.id === loan.bookId);
              const reader = users.find((u) => u.id === loan.userId);
              return (
                <div key={loan.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{book?.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{reader?.fullName} · due {formatDate(loan.dueDate)}</div>
                  </div>
                  <StatusBadge tone={loan.status as "active" | "overdue" | "pending" | "returned"}>{loan.status}</StatusBadge>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold">Needs attention</h2>
          {overdue.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No overdue loans. ✨</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {overdue.map((l) => {
                const book = books.find((b) => b.id === l.bookId);
                const reader = users.find((u) => u.id === l.userId);
                return (
                  <li key={l.id} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <div className="text-sm font-medium">{book?.title}</div>
                    <div className="text-xs text-muted-foreground">{reader?.fullName}</div>
                    <div className="mt-1 text-xs text-destructive">Due {formatDate(l.dueDate)}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </AppShell>
  );
};

export default AdminOverview;
