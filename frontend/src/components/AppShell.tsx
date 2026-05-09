import React from "react";
import { useLocation } from "react-router-dom";

import { Header } from "./Header";
import { Footer } from "./Footer";

interface Props {
    token: string | null;
    role: string | null;
    onLogout: () => void;
    children: React.ReactNode;
}

export function AppShell({ token, role, onLogout, children }: Props) {
    const { pathname } = useLocation();
    const show = pathname !== "/login";

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {show && <Header token={token} role={role} />}
            <main style={{ flex: 1 }}>
                {children}
            </main>
            {show && <Footer token={token} onLogout={onLogout} />}
        </div>
    );
}