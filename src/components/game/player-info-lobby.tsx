import { Button } from "../ui/button";
import { X } from "lucide-react";
import { leave } from "@/actions/game/actions";
import PlayerInfo from "./player-info";

export default function PlayerInfoLobby({
    user,
    host,
    me,
    game,
    game_user,
}: {
    user: User;
    host: string;
    me: string;
    game: Game;
    game_user: GameUser;
}) {
    const isMe = me === game_user.user_id;
    const isHost = host === game_user.user_id;
    const canSeeLeaveButton = isMe || me === host;
    const isReady = game_user.is_ready;

    return (
        <div
            className={`flex justify-between items-center h-16 p-4 my-4 rounded-lg border border-gray-100 shadow-md ${
                isReady && "bg-green-300"
            }`}
        >
            <PlayerInfo user={user} isMe={isMe} isHost={isHost} />
            {canSeeLeaveButton && (
                <div>
                    <form action={leave}>
                        <input type="hidden" name="game_id" value={game.id} />
                        <input type="hidden" name="user_id" value={user.id} />
                        <Button className="bg-red-400 hover:bg-red-500 p-2 rounded-full shadow-md flex justify-center items-center">
                            <X />
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
}
