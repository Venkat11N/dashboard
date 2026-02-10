import { Navigate, useLocation } from "react-router-dom";
import { useGovernance } from "../../core/GovernanceContext";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useGovernance();
  const location = useLocation();

  if (loading) return <div>Loading Session...</div>;

  if (!user) {
   
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}