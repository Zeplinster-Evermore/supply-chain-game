import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
    token: string | null;
    role?: string | null;
    adminRequired?: boolean;
    children: React.ReactNode;
}

export function ProtectedRoute({ token, role, adminRequired, children }: Props) {
    if (!token) {
        return <Navigate to="/login" />;
    }

    // TODO: check this logic
    if (adminRequired && (!role || role && role !== "ADMIN")) {
        return <Navigate to="/" />;
    }

    return <>{children}</>;
}