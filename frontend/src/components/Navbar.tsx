import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, LayoutDashboard, Library, LogOut, Users as UsersIcon, BookMarked, User as UserIcon } from "lucide-react";
import { useLibrary, selectCurrentUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const user = useLibrary(selectCurrentUser);
  const logout = useLibrary((s) => s.logout);
  const location = useLocation();
  const navigate = useNavigate();

  const isLibrarian = user?.role === "librarian";

  const links = user
    ? isLibrarian
      ? [
          { to: "/admin", label: "Overview", icon: LayoutDashboard },
          { to: "/admin/inventory", label: "Inventory", icon: BookMarked },
          { to: "/admin/users", label: "Readers", icon: UsersIcon },
          { to: "/admin/loans", label: "Loans", icon: Library },
        ]
      : [
          { to: "/catalog", label: "Catalog", icon: BookOpen },
          { to: "/me", label: "My Books", icon: UserIcon },
        ]
    : [];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link to={user ? (isLibrarian ? "/admin" : "/catalog") : "/"} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-hero text-primary-foreground">
            <Library className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">Athenaeum</span>
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = location.pathname === l.to || (l.to !== "/" && location.pathname.startsWith(l.to));
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm font-medium">{user.fullName}</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-display text-sm font-semibold">
                {user.fullName.charAt(0)}
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/login?signup=1">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {user && (
        <nav className="md:hidden border-t border-border/60 bg-background/60">
          <div className="container flex items-center gap-1 overflow-x-auto py-2">
            {links.map((l) => {
              const active = location.pathname === l.to || (l.to !== "/" && location.pathname.startsWith(l.to));
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm",
                    active ? "bg-secondary text-foreground" : "text-muted-foreground"
                  )}
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
};
