import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Socket } from "socket.io-client";

import type { Game, Role } from "../types";
import { PlayerGameView } from "../views/PlayerGameView";
import { AdminGameView } from "../views/AdminGameView";

interface Props {
    socket: Socket | null;
    token: string;
    role: string;
}

export function GameRoute({ socket, token, role }: Props) {
    const navigate = useNavigate();

    const { roomCode } = useParams<{ roomCode: string }>();
    const [game, setGame] = useState<Game | null>(null);

    useEffect(() => {
        if (!roomCode) return;
        fetch(`/api/games/${roomCode}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                if (!response.ok) throw new Error("Game not found");
                return response.json();
            })
            .then(setGame)
            .catch(() => navigate("/", { replace: true }));
    }, [roomCode, token]);

    useEffect(() => {
        if (!socket || !roomCode) return;
        const handleStateUpdate = (updatedGame: Game) => {
            if (updatedGame.roomCode === roomCode) setGame(updatedGame);
        };
        socket.on("stateUpdate", handleStateUpdate);
        return () => { socket.off("stateUpdate", handleStateUpdate); };
    }, [socket, roomCode]);

    if (!game) return <p>Loading game state...</p>;

    return role === "ADMIN"
        ? <AdminGameView socket={socket!} token={token} game={game} />
        : <PlayerGameView socket={socket!} token={token} role={role as Role} game={game} />;
}