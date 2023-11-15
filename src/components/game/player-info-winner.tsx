import PlayerInfo from "./player-info";

export default function PlayerInfoWinner({
    user,
    host,
    me,
    round_user,
    game_user,
}: {
    user: User;
    host: string;
    me: string;
    round_user: RoundUser;
    game_user: GameUser;
}) {
    const isMe = me === round_user.user_id;
    const isHost = host === round_user.user_id;
    const isWinner = round_user.is_winner;
    const isTzar = round_user.is_tzar;

    return (
        <div
            className={`flex justify-between items-center h-16 p-4 my-4 rounded-lg border border-gray-100 shadow-md ${
                isWinner && "bg-green-300"
            }`}
        >
            <PlayerInfo user={user} isMe={isMe} isHost={isHost} />
            <div className="text-sm font-base text-gray-500">
                {game_user.score} pts ({isTzar && "Tzar"}
                {isWinner && "+1"}
                {!isWinner && !isTzar && "+0"})
            </div>
        </div>
    );
}
