import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Library, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-warm" aria-hidden />
        <div className="container relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Library management, reimagined
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Where every book finds <span className="italic text-accent">its reader.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Athenaeum is the modern way to run a library — manage inventory, track loans,
              and let readers reserve titles with a single tap.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <Link to="/login?signup=1">
                  Open your library
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <Link to="/login">I have an account</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Try the demo — sign in as a librarian or reader from the login screen.
            </p>
          </div>

          {/* Floating preview cards */}
          <div className="relative mx-auto mt-16 grid max-w-5xl gap-4 md:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Beautiful catalog",
                body: "Browse covers, filter by genre and reserve titles in a single click.",
              },
              {
                icon: Library,
                title: "Loan tracking",
                body: "Active, pending, overdue — everything you need at a glance.",
              },
              {
                icon: ShieldCheck,
                title: "Reader management",
                body: "Profiles, contact details and a blacklist for problem accounts.",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-book animate-scale-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / footer */}
      <section className="border-t border-border bg-card/50">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { stat: "12k+", label: "Books catalogued" },
              { stat: "3.4k", label: "Active readers" },
              { stat: "98%", label: "On-time returns" },
              { stat: "<1s", label: "Search latency" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-4xl font-semibold text-primary">{s.stat}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Built for libraries that care about their readers.</span>
          </div>
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} Athenaeum</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
