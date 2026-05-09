import { useNavigate } from "react-router-dom";

import type { Role } from "types";
import "../styles/LobbyView.css";

interface Props {
    availableRooms: string[];
    onRoomSelect: (roomCode: string, role: Role) => void;
}

export function PlayerLobbyView({ availableRooms, onRoomSelect }: Props) {
    const navigate = useNavigate();

    function handleRoomSelect(room: string, role: Role) {
        onRoomSelect(room, role);
        navigate(`/game/${room}`);
    }

// -------------------- PLAYER LOBBY VIEW --------------------
    return (
        <div className="lobby-container">
            <h2>Select Team & Role</h2>
            {availableRooms.length === 0 ? (
                <p>No active teams. Please wait for an admin to create one.</p>
            ) : (
                <form className="join-room-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        const form = event.currentTarget;
                        const roomCode = (form.elements.namedItem("roomCode") as HTMLSelectElement).value;
                        const role = (form.elements.namedItem("role") as HTMLSelectElement).value as Role;
                        handleRoomSelect(roomCode, role);
                    }}
                >
                    <label>
                        Team:
                        <select name="roomCode" required>
                            {availableRooms.map((room) => (
                                <option key={room} value={room}>
                                    {room}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Role:
                        <select name="role" required>
                            <option value="RETAILER">Retailer</option>
                            <option value="WHOLESALER">Wholesaler</option>
                            <option value="DISTRIBUTOR">Distributor</option>
                            <option value="FACTORY">Factory</option>
                        </select>
                    </label>
                    <button type="submit">Join Game</button>
                </form>
            )}
        </div>
    );
}