import "../styles/About.css";

export function AboutDeveloperView() {
    return (
        <div className="about-container">
            <div className="about-hero developer-hero">
                <h1>About the Developer</h1>
                <p className="about-tagline">
                    Developed in partnership with the System Dynamics Society
                </p>
            </div>

            <div className="about-content">
                <section className="about-section">
                    <h2>About This Project</h2>
                    <p>
                        The MIT Supply Chain Game Results Calculator was developed to streamline
                        the administration and analysis of the Beer Distribution Game, making it
                        easier for facilitators to run sessions and for participants to understand
                        the complex dynamics of supply chain management.
                    </p>
                    <p>
                        This tool automates the tedious calculations traditionally done by hand,
                        allowing more time for discussion, learning, and insight into system
                        dynamics principles like delays, feedback loops, and the bullwhip effect.
                    </p>
                </section>

                <section className="about-section">
                    <h2>Technology Stack</h2>
                    <div className="tech-grid">
                        <div className="tech-item">
                            <h3>Frontend</h3>
                            <ul>
                                <li>React with TypeScript</li>
                                <li>React Router for navigation</li>
                                <li>Recharts for visualizations</li>
                                <li>Socket.io for real-time updates</li>
                            </ul>
                        </div>
                        <div className="tech-item">
                            <h3>Backend</h3>
                            <ul>
                                <li>Node.js/Express</li>
                                <li>WebSocket connections</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="about-section contact-section">
                    <h2>Connect with the Developer</h2>
                    <p>
                        Interested in similar projects or have questions about this calculator?
                        Feel free to reach out at zeplinster.evermore@gmail.com!
                    </p>
                    <p>
                        This project is open-source and can be viewed at https://github.com/Zeplinster-Evermore/supply-chain-game
                    </p>
                </section>

                <section className="about-section">
                    <h2>Acknowledgments</h2>
                    <p>
                        Special thanks to the System Dynamics Society for their partnership
                        and support in developing this tool, and to the MIT Sloan School of
                        Management for creating the original Beer Distribution Game.
                    </p>
                </section>
            </div>
        </div>
    );
}