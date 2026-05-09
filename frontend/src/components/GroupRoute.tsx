import { useParams, useNavigate } from "react-router-dom";

import { Socket } from "socket.io-client";

import { AdminGroupView } from "../views/AdminGroupView";

interface Props {
    socket: Socket | null;
    token: string;
}

export function GroupRoute({ socket, token }: Props) {
    const navigate = useNavigate();

    const { groupCode } = useParams<{ groupCode: string }>();

    if (!groupCode) {
        navigate("/admin", { replace: true });
        return null;
    }
    return <AdminGroupView socket={socket!} token={token} groupCode={groupCode} />;
}