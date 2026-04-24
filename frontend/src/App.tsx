import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Catalog from "./pages/Catalog";
import MyBooks from "./pages/MyBooks";
import AdminOverview from "./pages/admin/AdminOverview";
import Inventory from "./pages/admin/Inventory";
import Users from "./pages/admin/Users";
import Loans from "./pages/admin/Loans";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Reader */}
          <Route path="/catalog" element={<ProtectedRoute role="reader"><Catalog /></ProtectedRoute>} />
          <Route path="/me" element={<ProtectedRoute role="reader"><MyBooks /></ProtectedRoute>} />

          {/* Librarian */}
          <Route path="/admin" element={<ProtectedRoute role="librarian"><AdminOverview /></ProtectedRoute>} />
          <Route path="/admin/inventory" element={<ProtectedRoute role="librarian"><Inventory /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="librarian"><Users /></ProtectedRoute>} />
          <Route path="/admin/loans" element={<ProtectedRoute role="librarian"><Loans /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
