// src/components/HomeRedirect.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LandingPage from "../pages/LandingPage";
import { ROLES } from "../constants/roles";
import LoadingPage from "./LoadingPage";

export default function HomeRedirect() {
    const { user, userRole, emailVerified, loading } = useAuth();

    // Wait for auth to resolve
    if (loading) {
        return <LoadingPage />;
    }

    // If user is logged in, redirect to appropriate dashboard
    if (user && userRole) {
        // Enforce email verification for non-admins
        if (userRole !== ROLES.ADMIN && !emailVerified) {
            return <Navigate to="/verify-email" replace />;
        }

        if (userRole === ROLES.ADMIN) {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (userRole === ROLES.AGENT) {
            return <Navigate to="/agent/dashboard" replace />;
        } else {
            return <Navigate to="/home" replace />;
        }
    }

    // Otherwise, show landing page
    return <LandingPage />;
}
