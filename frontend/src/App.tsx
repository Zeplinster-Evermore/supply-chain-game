import { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GameRoute } from "./components/GameRoute";
import { GroupRoute } from "./components/GroupRoute";

import { LoginView } from "./views/LoginView";
import { PlayerLobbyView } from "./views/PlayerLobbyView";
import { AdminLobbyView } from "./views/AdminLobbyView";
import { AboutSDSView } from "./views/AboutSDSView";
import { AboutDeveloperView } from "./views/AboutDeveloperView";

import "./styles/colors.css"
import "./styles/LobbyView.css";

export default function App() {
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [availableRooms, setAvailableRooms] = useState<string[]>([]);
    const [availableGroups, setAvailableGroups] = useState<string[]>([]);

    const socketReference = useRef<Socket | null>(null);

// -------------------- COOKIES --------------------

    function getCookie(name: string) {
        return document.cookie
            .split("; ")
            .find(row => row.startsWith(name + "="))
            ?.split("=")[1] || null;
    }

    if (!token && !role) {
        let _token = getCookie("token");
        let _role = getCookie("role");
        if (_token) setToken(_token);
        if (_role) setRole(_role);
    }

    const handleLogout = () => {
        document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        setToken(null);
        setRole(null);
        if (socketReference.current) {
            socketReference.current.disconnect();
        }
    };

// -------------------- FETCH GROUPS --------------------
    function loadGroups() {
        fetch("/api/groups", {
            method: "GET",
            headers: {Authorization: `Bearer ${token}`}
        })
            .then((response) => response.json())
            .then((groups: { groupCode: string }[]) => setAvailableGroups(groups.map(group => group.groupCode)))
            .catch(() => console.error("Failed to load groups"));
    }

    useEffect(() => {
        if (!token) return;

        loadGroups();

        fetch("/api/games/rooms", {
            method: "GET",
            headers: {Authorization: `Bearer ${token}`}
        })
            .then((response) => response.json())
            .then((rooms: { roomCode: string }[]) => setAvailableRooms(rooms.map(room => room.roomCode)))
            .catch(() => console.error("Failed to load rooms"));
    }, [token]);

// -------------------- CONNECT SOCKET --------------------
    useEffect(() => {
        if (!token) return;
        if (socketReference.current) socketReference.current.disconnect(); // close any existing socket before reconnecting

        // initialize socket connection
        const socket = io(import.meta.env.VITE_BACKEND_URL, { auth: { token } });
        socketReference.current = socket;

        // event listeners
        socket.on("connect", () => {});
        socket.on("disconnect", () => {});
        socket.on("error", (msg) => {
            console.error("Socket error:", msg);
        });

        return () => {
            socket.disconnect();
            socketReference.current = null;
        };
    }, [token]);

    return (
        <Router>
            <AppShell token={token} role={role} onLogout={handleLogout}>
                <Routes>
                    <Route path="/login" element={
                        token ? <Navigate to={role === "ADMIN" ? "/admin" : "/lobby"}/> :
                            <LoginView onLogin={(_token, _role) => { setToken(_token); setRole(_role); }} />
                    }/>
                    <Route path="/about/sds" element={<AboutSDSView/>}/>
                    <Route path="/about/developer" element={<AboutDeveloperView/>}/>

                    <Route path="/lobby" element={
                        <ProtectedRoute token={token}>
                            <PlayerLobbyView
                                availableRooms={availableRooms}
                                onRoomSelect={(_, selectedRole) => setRole(selectedRole)}
                            />
                        </ProtectedRoute>
                    }/>
                    <Route path="/game/:roomCode" element={
                        <ProtectedRoute token={token}>
                            <GameRoute
                                socket={socketReference.current}
                                token={token!}
                                role={role!}
                            />
                        </ProtectedRoute>
                    }/>

                    <Route path="/admin" element={
                        <ProtectedRoute token={token} role={role} adminRequired={true}>
                            <AdminLobbyView
                                token={token!}
                                availableGroups={availableGroups}
                                onGroupSelect={() => {}}
                                refreshGroups={loadGroups}
                            />
                        </ProtectedRoute>
                    }/>
                    <Route path="/admin/:groupCode" element={
                        <ProtectedRoute token={token} role={role} adminRequired={true}>
                            <GroupRoute
                                socket={socketReference.current}
                                token={token!}
                            />
                        </ProtectedRoute>
                    }/>
                    <Route path="/admin/:groupCode/:roomCode" element={
                        <ProtectedRoute token={token} role={role} adminRequired={true}>
                            <GameRoute
                                socket={socketReference.current}
                                token={token!}
                                role={role!}
                            />
                        </ProtectedRoute>
                    }/>

                    <Route path="/" element={
                        token ? (
                            <Navigate to={role === "ADMIN" ? "/admin" : "/lobby"}/>
                        ) : (
                            <Navigate to="/login"/>
                        )
                    }/>

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AppShell>
        </Router>
    );
}
