import React, { useCallback, useEffect, useState } from "react";

import { Socket } from "socket.io-client";

import type { Role, Game } from "types";
import { GameGraphs } from "./GameGraphView";
import { usePolling } from "../hooks/usePolling.tsx";
import "../styles/GameView.css";

interface Props {
    socket: Socket;
    token: string;
    game: Game;
    role: Role;
}

export function PlayerGameView({ socket, token, game, role }: Props) {
    const { roomCode, week, state: gameState } = game;
    const roleData = gameState.roles[role];

    const [outgoingOrder, setOutgoingOrder] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [showGraphs, setShowGraphs] = useState(false);

// -------------------- PROCESS POLLING --------------------
    const pollShowGraphs = useCallback(async () => {
        const groupCode = roomCode.substring(0, roomCode.indexOf("-"));
        const response = await fetch(`/api/groups/${groupCode}/showGraphs`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        setShowGraphs(data.showGraphs);
    }, [roomCode, token]);

    usePolling(pollShowGraphs, 10000);

// -------------------- PLACE ORDER --------------------
    async function submitOrder(event: React.FormEvent) {
        event.preventDefault();

        const form = event.currentTarget as HTMLFormElement;
        const amountInput = form.amount as HTMLInputElement;
        const amount = Number(amountInput.value);

        try {
            const response = await fetch("/api/orders/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ roomCode, role, amount, week }),
            });

            if (response.ok) {
                amountInput.value = "";
                setMessage(`Order of ${amount} submitted successfully! You may change your order until all players have placed order and facilitator has advanced to the next week.`);
            }
            else {
                setError("Failed to submit order.");
            }
        }
        catch (error) {
            console.error(error);
            setError("Server error, please try again.");
        }
    }

// -------------------- GET OUTGOING ORDER --------------------
    const getOutgoingOrder = useCallback(async () => {
        try {
            const response = await fetch(`/api/orders/outgoingOrder?roomCode=${roomCode}&role=${role}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to fetch outgoing order");
            const data = await response.json();
            if (data.amount > -1) setOutgoingOrder(data.amount);
        }
        catch (error) {
            console.error("Failed to get outgoing order", error);
        }
    }, [roomCode, role, token]);

// -------------------- CONNECT SOCKET --------------------
    useEffect(() => {
        if (!socket || !socket.connected) return;
        socket.emit("joinRoom", roomCode);

        const handleStateUpdate = (updatedGame: Game) => {
            if (updatedGame.roomCode === roomCode) {
                setMessage("Week has been advanced");
                void getOutgoingOrder();
            }
        };

        socket.on("stateUpdate", handleStateUpdate);

        return () => {
            socket.off("stateUpdate", handleStateUpdate);
        };
    }, [socket, roomCode, getOutgoingOrder]);

// -------------------- PLAYER GAME VIEW --------------------
    return (
        <div className="game-view-container">
            <h2>Team: {roomCode}</h2>
            {!showGraphs ? (
                <div>
                    <h3>Role: {role}</h3>
                    <p>Week: {week}</p>
                    <p>
                    {roleData.inventory[week - 1] >= 0
                        ? `Inventory: ${roleData.inventory[week - 1]}`
                        : `Backlog: ${-roleData.inventory[week - 1]}`}
                     </p>
                    {outgoingOrder && <p className="outgoing-order">Outgoing order: {outgoingOrder}</p>}

                    <form onSubmit={submitOrder}>
                        <input name="amount" type="number" placeholder="Order amount" min={0} required />
                        <button type="submit">Place Order</button>
                    </form>
                    {message && <p className="message">{message}</p>}
                    {error && <p className="error">{error}</p>}
                </div>
            ) : (
                <div className="chart-section">
                    <GameGraphs token={token} game={game} />
                </div>
            )}
        </div>
    );
}