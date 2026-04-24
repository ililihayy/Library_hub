import { useMemo, useState } from "react";
import { BookOpen, Search, BookmarkPlus } from "lucide-react";
import { useLibrary, selectCurrentUser, getBookAvailability } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import type { Book } from "@/lib/types";

const Catalog = () => {
  const books = useLibrary((s) => s.books);
  const loans = useLibrary((s) => s.loans);
  const reserveBook = useLibrary((s) => s.reserveBook);
  const user = useLibrary(selectCurrentUser);

  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string>("all");
  const [availability, setAvailability] = useState<string>("all");

  const genres = useMemo(() => Array.from(new Set(books.map((b) => b.genre))).sort(), [books]);

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const matchesQuery =
        !query ||
        b.title.toLowerCase().includes(query.toLowerCase()) ||
        b.author.toLowerCase().includes(query.toLowerCase());
      const matchesGenre = genre === "all" || b.genre === genre;
      const { available } = getBookAvailability(b.id, books, loans);
      const matchesAvail =
        availability === "all" ||
        (availability === "available" && available > 0) ||
        (availability === "out" && available === 0);
      return matchesQuery && matchesGenre && matchesAvail;
    });
  }, [books, loans, query, genre, availability]);

  const handleReserve = (book: Book) => {
    if (!user) return;
    if (user.blacklisted) {
      toast.error("Your account is blacklisted and cannot reserve books.");
      return;
    }
    reserveBook(book.id, user.id);
    toast.success(`Reserved "${book.title}" for 1 week`);
  };

  return (
    <AppShell>
      <header className="mb-8">
        <h1 className="font-display text-4xl font-semibold tracking-tight">The Catalog</h1>
        <p className="mt-1 text-muted-foreground">
          {books.length} titles waiting to be discovered.
        </p>
      </header>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-soft md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title or author"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={genre} onValueChange={setGenre}>
          <SelectTrigger className="md:w-[180px]">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All genres</SelectItem>
            {genres.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={availability} onValueChange={setAvailability}>
          <SelectTrigger className="md:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any availability</SelectItem>
            <SelectItem value="available">Available now</SelectItem>
            <SelectItem value="out">Out of stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No books match your search"
          description="Try adjusting your filters or searching for a different title."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((book) => {
            const { available, reserved, loaned } = getBookAvailability(book.id, books, loans);
            const tone = available > 0 ? "available" : reserved + loaned > book.totalCopies - 1 ? "out" : "reserved";
            const statusLabel = available > 0 ? "Available" : reserved > 0 && loaned === 0 ? "Reserved" : "Out of stock";

            return (
              <article
                key={book.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-book transition-all hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                  <img
                    src={book.coverUrl}
                    alt={`${book.title} cover`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3">
                    <StatusBadge tone={tone}>{statusLabel}</StatusBadge>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {book.genre}
                  </div>
                  <h3 className="font-display text-lg font-semibold leading-tight">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{book.description}</p>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{available}/{book.totalCopies} available</span>
                    <span>{reserved} reserved</span>
                  </div>

                  <Button
                    className="mt-4"
                    disabled={available === 0 || user?.blacklisted}
                    onClick={() => handleReserve(book)}
                  >
                    <BookmarkPlus className="mr-2 h-4 w-4" />
                    Reserve for 1 week
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
};

export default Catalog;
