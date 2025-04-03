import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import useAdmin from "./hooks/useAdmin";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin(); // Get admin status and loading state

  console.log("Current User:", currentUser); // Debugging currentUser
  console.log("Is Admin:", isAdmin); // Debugging isAdmin

  if (authLoading || adminLoading) {
    // Show a loading indicator while checking authentication or admin status
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    // Redirect to login if the user is not authenticated
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    // Redirect to home if the user is not an admin
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
