import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Socket } from "socket.io-client";

import { usePolling } from "../hooks/usePolling";

import "../styles/GameView.css";


const ROLES = ["RETAILER", "WHOLESALER", "DISTRIBUTOR", "FACTORY"] as const;
type Role = typeof ROLES[number];
type OrderStatuses = Record<string, Record<Role, { amount: number }>>;

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
    const [orderStatuses, setOrderStatuses] = useState<OrderStatuses>({});
    const [isManual, setIsManual] = useState(false);
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

    /**
     * Hides the customer orders form if the first game in the group has a bunch of orders.
     * Should probably do this in a reasonable way instead.
     */
    async function getIsManualOrders() {
        try {
            const gameCode = groupCode + "-0";
            const response = await fetch(`/api/games/${gameCode}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error("Game not found.");
            }
            const data = await response.json();
            const gameState = data.state;
            const customerOrders = gameState.customerOrder;
            setIsManual(customerOrders.length < 50);
        }
        catch {
            console.error("Failed to determine game type", error);
        }
    }

    useEffect(() => {
        void loadGroupData();
        void getIsManualOrders();
    }, [token, groupCode]);

// -------------------- LOAD ORDER STATUSES --------------------
    const gamesRef = useRef<string[]>([]);
    useEffect(() => { gamesRef.current = games; }, [games]);

    const loadOrderStatuses = useCallback(async () => {
        if (gamesRef.current.length === 0) return;
        try {
            const results = await Promise.all(
                gamesRef.current.map((room) =>
                    fetch(`/api/orders/orderStatus?roomCode=${room}`, {
                        method: "GET",
                        headers: { Authorization: `Bearer ${token}` },
                    }).then((r) => (r.ok ? r.json() : null))
                )
            );
            const statuses: OrderStatuses = {};
            gamesRef.current.forEach((room, i) => {
                if (results[i]) statuses[room] = results[i].status;
            });
            setOrderStatuses(statuses);
        }
        catch (error) {
            console.error("Failed to load order statuses", error);
        }
    }, [token]);

    usePolling(loadOrderStatuses, 10000);

    useEffect(() => {
        if (games.length > 0) void loadOrderStatuses();
    }, [games]);

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
                    {isManual && <form onSubmit={addCustomerOrder}>
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
                    </form>}

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

                <div className="lobby-panel" style={{ gridColumn: "1 / -1" }}>
                    <h3>Week {week} — Order Status</h3>
                    <div style={{ overflowX: "auto" }}>
                        <table className="game-overview-table" style={{ width: "100%" }}>
                            <thead>
                            <tr>
                                <th>Team</th>
                                {ROLES.map((role) => (
                                    <th key={role}>{role}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {games.map((room) => {
                                const status = orderStatuses[room];
                                return (
                                    <tr key={room}>
                                        <td>{room}</td>
                                        {ROLES.map((role) => {
                                            const amount = status?.[role]?.amount;
                                            const placed = amount !== undefined && amount >= 0;
                                            return (
                                                <td key={role}>
                                                    {status === undefined ? (
                                                        <span style={{ color: "var(--color-text-placeholder)" }}>—</span>
                                                    ) : placed ? (
                                                        <span className="order-placed">{amount}</span>
                                                    ) : (
                                                        <span className="order-awaiting">pending</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
