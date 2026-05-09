import { Link } from "react-router-dom";

import "../styles/Header.css";

interface Props {
    token: string | null;
    role: string | null;
}

export function Header({ token, role }: Props) {
    return (
        <header className="app-header">
            <div className="header-container">
                <div className="header-logo-section">
                    <img
                        src="../assets/system-dynamics-society.png"
                        alt="System Dynamics Society Logo"
                        className="sds-logo"
                        onError={(e) => {
                            // don't try to display logo if it doesn't load
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <div className="header-title">
                        <h1>MIT Supply Chain Game Results Calculator</h1>
                    </div>
                </div>

                {token && <nav className="header-nav">
                    <>
                        {role === "ADMIN" ? (
                            <Link to="/admin" className="nav-link">Dashboard</Link>
                        ) : (
                            <Link to="/lobby" className="nav-link">Lobby</Link>
                        )}
                    </>
                </nav>}
            </div>
        </header>
    );
}