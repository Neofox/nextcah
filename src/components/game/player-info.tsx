import { Avatar, AvatarFallback } from "../ui/avatar";
import { Crown } from "lucide-react";
import { Badge } from "../ui/badge";

export default function PlayerInfo({ user, isMe, isHost }: { user: User; isMe: boolean; isHost: boolean }) {
    return (
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
    );
}
