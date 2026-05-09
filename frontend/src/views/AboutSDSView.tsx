import "../styles/About.css";

export function AboutSDSView() {
    return (
        <div className="about-container">
            <div className="about-hero">
                <img
                    src="../assets/system-dynamics-society.png"
                    alt="System Dynamics Society Logo"
                    className="about-logo"
                    onError={(e) => {
                        // don't try to display logo if it doesn't load
                        e.currentTarget.style.display = 'none';
                    }}
                />
                <h1>System Dynamics Society</h1>
                <p className="about-tagline">
                    Placeholder text
                </p>
            </div>

            <div className="about-content">
                <section className="about-section">
                    <h2>About the Society</h2>
                    <p>
                        Placeholder text
                    </p>
                    <p>
                        Placeholder text
                    </p>
                    <a
                        href="https://www.systemdynamics.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-button"
                    >
                        Visit www.systemdynamics.org
                    </a>
                </section>
            </div>
        </div>
    );
}