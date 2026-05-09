import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/GameView.css";
import { Socket } from "socket.io-client";

interface Props {
    socket: Socket;
    token: string;
    groupCode: string;
}

export function AdminGroupView({ socket, token, groupCode }: Props) {
    const navigate = useNavigate();

    const [games, setGames] = useState<string[]>([]);
    const [week, setWeek] = useState<number>(1);
    const [selectedGame, setSelectedGame] = useState<string>("");
    const [newCustomerOrder, setNewCustomerOrder] = useState<number>(0);
    const [showGraphs, setShowGraphs] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    function handleRoomSelect(room: string) {
        setSelectedGame(room);
        navigate(`${room}`);
    }

// -------------------- LOAD GAMES IN GROUP --------------------
    async function loadGroupData() {
        try {
            const response = await fetch(`/api/groups/${groupCode}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error("Group not found.");
            }
            const data = await response.json();
            setGames(data.games);
            setWeek(data.week);
            setShowGraphs(data.showGraphs);
        }
        catch (error) {
            console.error("Failed to load games", error);
            navigate("/admin", { replace: true });
        }
    }

    useEffect(() => {
        void loadGroupData();
    }, [token, groupCode]);


// -------------------- HANDLE SELECTED GAME --------------------
    useEffect(() => {
        if (selectedGame && socket) {
            socket.emit("joinRoom", selectedGame);
        }
    }, [socket, selectedGame]);

// -------------------- ADVANCE WEEK --------------------
    async function advanceWeek(event: React.FormEvent) {
        event.preventDefault();
        try {
            let allOrdersIn = true;

            for (const room of games) {
                const response = await fetch(`/api/orders/orderStatus?roomCode=${room}`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Failed to fetch order status");
                const data = await response.json();
                for (const role in data.status) {
                    if (data.status[role].amount === -1) {
                        allOrdersIn = false;
                        break;
                    }
                }
            }

            if (!allOrdersIn) {
                setMessage("Not all orders are placed yet.");
                setTimeout(() => setMessage(""), 10000);
            }
            else {
                const response = await fetch("/api/orders/advanceWeek", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ groupCode: groupCode }),
                });
                if (!response.ok) throw new Error("Failed to advance week");
                setMessage("Advanced week for all rooms.");
                setTimeout(() => setMessage(""), 10000);
                await loadGroupData();
            }
        }
        catch (error) {
            console.error("Failed to advance all selected weeks", error);
            setError("Error advancing weeks.");
        }
    }

// -------------------- ADD CUSTOMER ORDER TO ALL GAMES --------------------
    async function addCustomerOrder(event: React.FormEvent) {
        event.preventDefault();
        try {
            const response = await fetch("/api/orders/customerOrder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    roomCodes: games,
                    amount: newCustomerOrder,
                }),
            });
            if (!response.ok) throw new Error("Failed to add customer orders");
            setMessage(`Customer order of ${newCustomerOrder} added to all games.`);
            setTimeout(() => setMessage(""), 10000);
            await loadGroupData();
        }
        catch (error) {
            console.error("Error adding customer orders to all rooms:", error);
            setError("Failed to add customer orders.");
        }
    }

// -------------------- MANIPULATE GRAPH VISIBILITY --------------------
    async function showGraphsForAllRooms(showGraphs: boolean) {
        try {
            const response = await fetch(`/api/groups/${groupCode}/showGraphs`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ showGraphs: showGraphs }),
            });
            if (!response.ok) throw new Error("Failed to update graph visibility");
            setMessage((showGraphs ? "Triggered" : "Hid") + " graph view for all rooms.");
            setShowGraphs(showGraphs);
        }
        catch (error) {
            console.error("Graph visibility update failed", error);
            setError("Failed to update graph visibility.");
        }
    }

// -------------------- ADMIN GROUP VIEW --------------------
    return (
        <div className="lobby-container">
            <h2>Admin Game View for ({groupCode})</h2>

            {week && <h3>Current Week: {week}</h3>}

            <div className="lobby-grid">
                <div className="lobby-panel">
                    <h3>Teams in this game</h3>
                    {games.length === 0 ? (
                        <p>No games found.</p>
                    ) : (
                        <ul>
                            {games.map((game) => (
                                <li key={game}>
                                    {game}{" "}
                                    <button onClick={() => {
                                        handleRoomSelect(game);
                                    }}>Open</button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <button onClick={() => navigate(-1)}>Return to Lobby</button>
                </div>

                <div className="lobby-panel">
                    <form onSubmit={addCustomerOrder}>
                        <label>
                            Override Customer Order:
                            <input
                                type="number"
                                placeholder="Customer order amount"
                                value={newCustomerOrder}
                                onChange={(event) => setNewCustomerOrder(Number(event.target.value))}
                                min={0}
                                required
                            />
                        </label>
                        <button type="submit">Update or Add Customer Order</button>
                    </form>

                    <button onClick={advanceWeek}>Advance Week</button>

                    {!showGraphs &&
                        <button className="critical-button" onClick={() => showGraphsForAllRooms(true)}>Show Graphs in
                            All Games</button>}
                    {showGraphs &&
                        <button className="critical-button" onClick={() => showGraphsForAllRooms(false)}>Hide Graphs in
                            All Games</button>}

                    {message && <p className="message">{message}</p>}
                    {error && <p className="error">{error}</p>}
                </div>
            </div>
        </div>
    );
}
