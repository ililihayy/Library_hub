import { useMemo, useState } from "react";
import { BookMarked, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useLibrary, getBookAvailability } from "@/lib/store";
import type { Book } from "@/lib/types";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";

const empty: Omit<Book, "id"> = {
  title: "",
  author: "",
  genre: "",
  description: "",
  isbn: "",
  totalCopies: 1,
  coverUrl: "",
};

const Inventory = () => {
  const books = useLibrary((s) => s.books);
  const loans = useLibrary((s) => s.loans);
  const addBook = useLibrary((s) => s.addBook);
  const updateBook = useLibrary((s) => s.updateBook);
  const deleteBook = useLibrary((s) => s.deleteBook);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] = useState<Omit<Book, "id">>(empty);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      books.filter(
        (b) =>
          !query ||
          b.title.toLowerCase().includes(query.toLowerCase()) ||
          b.author.toLowerCase().includes(query.toLowerCase()) ||
          b.isbn.includes(query)
      ),
    [books, query]
  );

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditing(book);
    const { id, ...rest } = book;
    setForm(rest);
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateBook(editing.id, form);
      toast.success(`Updated "${form.title}"`);
    } else {
      addBook(form);
      toast.success(`Added "${form.title}" to the catalog`);
    }
    setOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    const b = books.find((x) => x.id === deleteId);
    deleteBook(deleteId);
    toast.success(`Removed "${b?.title}" from the catalog`);
    setDeleteId(null);
  };

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Inventory</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Books & copies</h1>
          <p className="mt-1 text-muted-foreground">Add, edit and remove titles from your collection.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add book
        </Button>
      </header>

      <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-soft">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by title, author or ISBN"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No books yet"
          description="Add your first book to get started."
          action={<Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Add book</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Book</th>
                  <th className="px-4 py-3">Genre</th>
                  <th className="px-4 py-3">ISBN</th>
                  <th className="px-4 py-3 text-right">Copies</th>
                  <th className="px-4 py-3 text-right">Available</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((book) => {
                  const { available } = getBookAvailability(book.id, books, loans);
                  return (
                    <tr key={book.id} className="border-t border-border hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={book.coverUrl} alt="" loading="lazy" className="h-12 w-9 rounded object-cover" />
                          <div className="min-w-0">
                            <div className="truncate font-medium">{book.title}</div>
                            <div className="truncate text-xs text-muted-foreground">{book.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{book.genre}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{book.isbn}</td>
                      <td className="px-4 py-3 text-right">{book.totalCopies}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={available === 0 ? "text-destructive" : "text-success"}>{available}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(book)} aria-label="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(book.id)}
                            aria-label="Delete"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? "Edit book" : "Add a new book"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input id="author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input id="genre" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input id="isbn" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copies">Total copies</Label>
                <Input
                  id="copies"
                  type="number"
                  min={1}
                  value={form.totalCopies}
                  onChange={(e) => setForm({ ...form, totalCopies: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="cover">Cover image URL</Label>
                <Input id="cover" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} placeholder="https://..." required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Save changes" : "Add book"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this book?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the title from your catalog. Active loans will remain in history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
};

export default Inventory;
