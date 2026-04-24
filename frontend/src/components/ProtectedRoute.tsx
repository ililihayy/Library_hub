import { Navigate, useLocation } from "react-router-dom";
import { useLibrary, selectCurrentUser } from "@/lib/store";
import type { Role } from "@/lib/types";

export const ProtectedRoute = ({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: Role;
}) => {
  const user = useLibrary(selectCurrentUser);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to={user.role === "librarian" ? "/admin" : "/catalog"} replace />;
  }
  return <>{children}</>;
};
