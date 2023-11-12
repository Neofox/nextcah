import { Avatar, AvatarFallback } from "../ui/avatar";
import { Crown } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { leave } from "@/actions/game/actions";

export default function PlayerInfo({
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
            <div className="flex items-center">
                <Avatar>
                    {/* <AvatarImage src="https://github.com/Neofoxd.png" alt="@Neofox" /> */}
                    <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="ml-2">
                    <div className="text-md font-semibold text-gray-600">
                        {user.username} {isMe && <span className="text-xs">(you)</span>}{" "}
                        <span className="inline-block align-top">{isHost && <Crown size={16} fill="gold" />}</span>
                    </div>
                    <div className="text-sm font-light text-gray-500">
                        <Badge variant="secondary">Newbie</Badge>
                    </div>
                </div>
            </div>

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
