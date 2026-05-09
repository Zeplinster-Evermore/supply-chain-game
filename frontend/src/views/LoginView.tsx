import React, { useState } from "react";

import "../styles/Login.css";

interface Props {
    onLogin: (token: string, role: string) => void;
}

export function LoginView({ onLogin }: Props) {
    const [isRegistering, setRegistering] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const username = (form.elements.namedItem("username") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;

        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            setError("Invalid username or password");
            return;
        }

        const data = await response.json();
        document.cookie = `role=${data.role}; path=/`;
        document.cookie = `token=${data.token}; path=/`;
        onLogin(data.token, data.role);
        setError("");
    }

    async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const username = (form.elements.namedItem("username") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;
        const password2 = (form.elements.namedItem("password2") as HTMLInputElement).value;

        if (password !== password2) {
            setError("Passwords must match");
            return;
        }

        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            setError("Registration failed. Username may already exist.");
            return;
        }

        setMessage("Registration successful! Please log in.");
        setRegistering(false);
        setError("");
        setTimeout(() => setMessage(""), 5000);
    }

    if (isRegistering) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <h2>Create Account</h2>
                    <form onSubmit={handleRegister} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Choose a username"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Choose a password"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password2">Confirm Password</label>
                            <input
                                id="password2"
                                name="password2"
                                type="password"
                                placeholder="Confirm your password"
                                required
                            />
                        </div>
                        <button type="submit" className="submit-button">Register</button>
                    </form>

                    <button
                        onClick={() => setRegistering(false)}
                        className="toggle-button"
                    >
                        Already have an account? Log in
                    </button>

                    {error && <p className="error-message">{error}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Welcome Back</h2>
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">Log In</button>
                </form>

                <button
                    onClick={() => setRegistering(true)}
                    className="toggle-button"
                >
                    Don't have an account? Register
                </button>

                {error && <p className="error-message">{error}</p>}
                {message && <p className="success-message">{message}</p>}
            </div>
        </div>
    );
}