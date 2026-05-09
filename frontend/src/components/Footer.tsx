import { Link, useNavigate } from "react-router-dom";

import "../styles/Header.css";

interface Props {
    token: string | null;
    onLogout: () => void;
}

export function Footer({ token, onLogout }: Props) {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate("/");
    };

    return (
        <footer>
            <div className="header-container">
                <nav className="header-nav">
                    <>
                        <Link to="/about/sds" className="nav-link">About SDS</Link>
                        <Link to="/about/developer" className="nav-link">About Developer</Link>
                    </>
                    {token && <button onClick={handleLogout} className="logout-button">Logout</button>}
                </nav>
            </div>
        </footer>
    );
}