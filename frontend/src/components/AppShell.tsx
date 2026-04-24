import { Navbar } from "./Navbar";

export const AppShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="container py-8 animate-fade-in">{children}</main>
  </div>
);
