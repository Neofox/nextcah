"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRoundButton } from "./next-round-button";
import PlayerInfoWinner from "./player-info-winner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WinnerBoard({
    game,
    users,
    roundUsers,
    gameUsers,
    connectedUser,
    host,
}: {
    game: Game;
    users: User[];
    roundUsers: RoundUser[];
    gameUsers: GameUser[];
    connectedUser: string;
    host: string;
}) {
    const router = useRouter();

    useEffect(() => {
        const supabase = createClientComponentClient<Database>();
        const channel = supabase
            .channel("new_round_start")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "rounds",
                    filter: `game_id=eq.${game.id}`,
                },
                payload => {
                    console.log(payload);
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router, game]);

    return (
        <div className=" flex-1 p-4 flex justify-center items-center">
            <div className="bg-white w-full md:max-w-4xl rounded-lg shadow-lg">
                <div className="h-12 flex justify-between items-center border-b border-gray-200 m-4">
                    <div className="text-xl font-bold text-gray-700">&quot;{game.id}&quot; Lobby</div>
                    <div className="text-sm font-base text-gray-500">Waiting for host to start next round...</div>
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
                    <NextRoundButton game={game} user={connectedUser} host={host} />
                </div>
            </div>
        </div>
    );
}
