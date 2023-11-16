"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRoundButton } from "./next-round-button";
import PlayerInfoWinner from "./player-info-winner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LeaveGameButton } from "./leave-game-button";

export default function WinnerBoard({
    game,
    users,
    roundUsers,
    gameUsers,
    connectedUser,
    host,
    isGameFinished,
}: {
    game: Game;
    users: User[];
    roundUsers: RoundUser[];
    gameUsers: GameUser[];
    connectedUser: string;
    host: string;
    isGameFinished: boolean;
}) {
    const router = useRouter();
    const supabase = createClientComponentClient<Database>();
    const winner = users.find(u => u.id === roundUsers.find(ru => ru.is_winner)?.user_id);

    useEffect(() => {
        const channel = supabase
            .channel("new_round_start")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "games",
                    filter: `id=eq.${game.id}`,
                },
                () => router.refresh()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, router, game]);

    return (
        <div className=" flex-1 p-4 flex justify-center items-center">
            <div className="bg-white w-full md:max-w-4xl rounded-lg shadow-lg">
                <div className="h-12 flex justify-between items-center border-b border-gray-200 m-4">
                    <div className="text-xl font-bold text-gray-700">Congratulation {winner?.username}!</div>
                    <div className="text-sm font-base text-gray-500">
                        {isGameFinished ? "Thank you for playing!" : "Waiting for host to start next round..."}
                    </div>
                </div>
                <div className="px-6">
                    {roundUsers.map(async round_user => {
                        const user = users.find(user => user.id === round_user.user_id);
                        const gameUser = gameUsers.find(user => user.user_id === round_user.user_id);
                        if (!user || !gameUser) return null;
                        return (
                            <PlayerInfoWinner
                                key={round_user.id}
                                user={user}
                                host={host}
                                me={connectedUser}
                                game_user={gameUser}
                                round_user={round_user}
                            />
                        );
                    })}
                </div>
                <div className="p-6 ">
                    {isGameFinished ? (
                        <LeaveGameButton game={game} user={connectedUser} />
                    ) : host === connectedUser ? (
                        <NextRoundButton game={game} user={connectedUser} host={host} />
                    ) : (
                        <div className="text-sm font-base text-gray-500">Waiting for host to start next round...</div>
                    )}
                </div>
            </div>
        </div>
    );
}
